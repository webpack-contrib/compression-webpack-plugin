/*
MIT License http://www.opensource.org/licenses/mit-license.php
Author Tobias Koppers @sokra
*/

import os from 'os';
import crypto from 'crypto';
import url from 'url';

import async from 'neo-async';
import RawSource from 'webpack-sources/lib/RawSource';
import ModuleFilenameHelpers from 'webpack/lib/ModuleFilenameHelpers';
import cacache from 'cacache';
import findCacheDir from 'find-cache-dir';
import serialize from 'serialize-javascript';
import validateOptions from 'schema-utils';

import pkg from '../package.json';

import schema from './options.json';

class CompressionPlugin {
  constructor(options = {}) {
    validateOptions(schema, options, 'Compression Plugin');

    this.chunkVersions = {};

    const {
      test,
      include,
      exclude,
      cache = false,
      algorithm = 'gzip',
      compressionOptions = {},
      filename = '[path].gz[query]',
      threshold = 0,
      minRatio = 0.8,
      deleteOriginalAssets = false,
    } = options;

    this.options = {
      test,
      include,
      exclude,
      cache,
      algorithm,
      compressionOptions,
      filename,
      threshold,
      minRatio,
      deleteOriginalAssets,
    };

    if (typeof algorithm === 'string') {
      // eslint-disable-next-line global-require
      const zlib = require('zlib');

      this.options.algorithm = zlib[this.options.algorithm];

      if (!this.options.algorithm) {
        throw new Error('Algorithm not found in zlib');
      }

      const defaultCompressionOptions = { level: 9 };

      this.options.compressionOptions = Object.assign(
        {},
        defaultCompressionOptions,
        this.options.compressionOptions
      );
    }
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync(
      { name: 'CompressionPlugin' },
      (compilation, callback) => {
        const {
          cache,
          threshold,
          minRatio,
          filename,
          deleteOriginalAssets,
        } = this.options;
        const cacheDir =
          cache === true
            ? findCacheDir({ name: 'compression-webpack-plugin' }) ||
              os.tmpdir()
            : cache;

        const skipFiles = {};
        for (const chunk of compilation.chunks) {
          const oldVersion = this.chunkVersions[chunk.id];
          this.chunkVersions[chunk.id] = chunk.hash;
          if (chunk.hash === oldVersion) {
            for (const chunkModule of chunk.getModules()) {
              if (chunkModule.buildInfo.assets) {
                for (const file of Object.keys(chunkModule.buildInfo.assets)) {
                  skipFiles[file] = true;
                }
              }
            }
            for (const file of chunk.files) {
              skipFiles[file] = true;
            }
          }
        }

        const { assets } = compilation;

        // eslint-disable-next-line consistent-return
        async.forEach(
          Object.keys(assets),
          (file, cb) => {
            if (skipFiles[file]) {
              return cb();
            }
            if (!ModuleFilenameHelpers.matchObject(this.options, file)) {
              return cb();
            }

            const asset = assets[file];
            let input = asset.source();

            if (!Buffer.isBuffer(input)) {
              input = Buffer.from(input);
            }

            const originalSize = input.length;

            if (originalSize < threshold) {
              return cb();
            }

            return Promise.resolve()
              .then(() => {
                if (cache) {
                  const { outputPath } = compiler;
                  const cacheKey = serialize({
                    // Invalidate cache after upgrade `zlib` module (build-in in `nodejs`)
                    node: process.version,
                    'compression-webpack-plugin': pkg.version,
                    'compression-webpack-plugin-options': this.options,
                    path: `${outputPath ? `${outputPath}/` : ''}${file}`,
                    hash: crypto
                      .createHash('md4')
                      .update(input)
                      .digest('hex'),
                  });

                  return cacache.get(cacheDir, cacheKey).then(
                    (result) => result.data,
                    () =>
                      Promise.resolve()
                        .then(() => this.compress(input))
                        .then((data) =>
                          cacache.put(cacheDir, cacheKey, data).then(() => data)
                        )
                  );
                }

                return this.compress(input);
              })
              .then((result) => {
                if (result.length / originalSize > minRatio) {
                  return cb();
                }

                const parse = url.parse(file);
                const info = {
                  file,
                  path: parse.pathname,
                  query: parse.query ? `?${parse.query}` : '',
                };

                const newAssetName =
                  typeof filename === 'function'
                    ? filename(info)
                    : filename.replace(
                        /\[(file|path|query)\]/g,
                        (p0, p1) => info[p1]
                      );

                assets[newAssetName] = new RawSource(result);

                if (deleteOriginalAssets) {
                  delete assets[file];
                }

                return cb();
              })
              .catch((error) => {
                compilation.errors.push(error);

                return cb();
              });
          },
          callback
        );
      }
    );
  }

  compress(input) {
    return new Promise((resolve, reject) => {
      const { algorithm, compressionOptions } = this.options;

      algorithm(input, compressionOptions, (error, result) => {
        if (error) {
          return reject(error);
        }

        return resolve(result);
      });
    });
  }
}

export default CompressionPlugin;
