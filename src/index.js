/*
MIT License http://www.opensource.org/licenses/mit-license.php
Author Tobias Koppers @sokra
*/
import crypto from 'crypto';
import url from 'url';
import async from 'neo-async';
import RawSource from 'webpack-sources/lib/RawSource';
import ModuleFilenameHelpers from 'webpack/lib/ModuleFilenameHelpers';
import cacache from 'cacache';
import findCacheDir from 'find-cache-dir';
import serialize from 'serialize-javascript';
import pkg from '../package.json';

class CompressionPlugin {
  constructor(options = {}) {
    const {
      asset = '[path].gz[query]',
      test,
      include,
      exclude,
      algorithm = 'gzip',
      filename = false,
      compressionOptions = {},
      cache = false,
      threshold = 0,
      minRatio = 0.8,
      deleteOriginalAssets = false,
    } = options;

    this.options = {
      asset,
      test,
      include,
      exclude,
      algorithm,
      filename,
      compressionOptions,
      cache,
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

      this.options.compressionOptions = {
        level: options.level || 9,
        flush: options.flush,
        chunkSize: options.chunkSize,
        windowBits: options.windowBits,
        memLevel: options.memLevel,
        strategy: options.strategy,
        dictionary: options.dictionary,
      };
    }
  }

  apply(compiler) {
    const emit = (compilation, callback) => {
      const { cache, threshold, minRatio, asset: assetName, filename, deleteOriginalAssets } = this.options;
      const cacheDir = cache === true ? findCacheDir({ name: 'compression-webpack-plugin' }) : cache;

      const { assets } = compilation;
      // eslint-disable-next-line consistent-return
      async.forEach(Object.keys(assets), (file, cb) => {
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

        return Promise
          .resolve()
          .then(() => {
            if (cache) {
              const cacheKey = serialize({
                // Invalidate cache after upgrade `zlib` module (build-in in `nodejs`)
                node: process.version,
                'compression-webpack-plugin': pkg.version,
                'compression-webpack-plugin-options': this.options,
                path: compiler.outputPath ? `${compiler.outputPath}/${file}` : file,
                hash: crypto.createHash('md4').update(input).digest('hex'),
              });

              return cacache
                .get(cacheDir, cacheKey)
                .then(
                  result => result.data,
                  () => Promise
                    .resolve()
                    .then(() => this.compress(input))
                    .then(
                      data => cacache.put(cacheDir, cacheKey, data)
                        .then(() => data),
                    ),
                );
            }

            return this.compress(input);
          })
          .then((result) => {
            if (result.length / originalSize > minRatio) { return cb(); }

            const parse = url.parse(file);
            const sub = {
              file,
              path: parse.pathname,
              query: parse.query || '',
            };

            let newAssetName = assetName.replace(/\[(file|path|query)\]/g, (p0, p1) => sub[p1]);

            if (typeof filename === 'function') {
              newAssetName = filename(newAssetName);
            }

            assets[newAssetName] = new RawSource(result);

            if (deleteOriginalAssets) {
              delete assets[file];
            }

            return cb();
          })
          .catch(cb);
      }, callback);
    };

    if (compiler.hooks) {
      const plugin = { name: 'CompressionPlugin' };
      compiler.hooks.emit.tapAsync(plugin, emit);
    } else {
      compiler.plugin('emit', emit);
    }
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
