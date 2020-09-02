/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/

import crypto from 'crypto';
import url from 'url';
import path from 'path';

import webpack, {
  ModuleFilenameHelpers,
  version as webpackVersion,
} from 'webpack';
import validateOptions from 'schema-utils';

import schema from './options.json';

const { RawSource } =
  // eslint-disable-next-line global-require
  webpack.sources || require('webpack-sources');

class CompressionPlugin {
  constructor(options = {}) {
    validateOptions(schema, options, {
      name: 'Compression Plugin',
      baseDataPath: 'options',
    });

    const {
      test,
      include,
      exclude,
      cache = true,
      algorithm = 'gzip',
      compressionOptions = {},
      filename = '[path].gz',
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

    this.algorithm = this.options.algorithm;
    this.compressionOptions = this.options.compressionOptions;

    if (typeof this.algorithm === 'string') {
      // eslint-disable-next-line global-require
      const zlib = require('zlib');

      this.algorithm = zlib[this.algorithm];

      if (!this.algorithm) {
        throw new Error(
          `Algorithm "${this.options.algorithm}" is not found in "zlib"`
        );
      }

      this.compressionOptions = {
        ...{ level: 9 },
        ...this.compressionOptions,
      };
    }
  }

  static interpolateName(originalFilename, filename) {
    const parse = url.parse(originalFilename);
    const { pathname } = parse;
    const { dir, name, ext } = path.parse(pathname);
    const info = {
      file: originalFilename,
      path: pathname,
      dir: dir ? `${dir}/` : '',
      name,
      ext,
      query: parse.query ? `?${parse.query}` : '',
    };

    return typeof filename === 'function'
      ? filename(info)
      : filename.replace(
          /\[(file|path|query|dir|name|ext)]/g,
          (p0, p1) => info[p1]
        );
  }

  // eslint-disable-next-line consistent-return
  static getAsset(compilation, name) {
    // New API
    if (compilation.getAsset) {
      return compilation.getAsset(name);
    }

    if (compilation.assets[name]) {
      return { name, source: compilation.assets[name], info: {} };
    }
  }

  static emitAsset(compilation, name, source, assetInfo) {
    // New API
    if (compilation.emitAsset) {
      compilation.emitAsset(name, source, assetInfo);
    }

    // eslint-disable-next-line no-param-reassign
    compilation.assets[name] = source;
  }

  static updateAsset(compilation, name, newSource, assetInfo) {
    // New API
    if (compilation.updateAsset) {
      compilation.updateAsset(name, newSource, assetInfo);
    }

    // eslint-disable-next-line no-param-reassign
    compilation.assets[name] = newSource;
  }

  static deleteAsset(compilation, name) {
    // New API
    if (compilation.deleteAsset) {
      compilation.deleteAsset(name);
    }

    // eslint-disable-next-line no-param-reassign
    delete compilation.assets[name];
  }

  runCompressionAlgorithm(input) {
    return new Promise((resolve, reject) => {
      const { algorithm, compressionOptions } = this;

      algorithm(input, compressionOptions, (error, result) => {
        if (error) {
          return reject(error);
        }

        if (!Buffer.isBuffer(result)) {
          // eslint-disable-next-line no-param-reassign
          result = Buffer.from(result);
        }

        return resolve(result);
      });
    });
  }

  async compress(compilation, assets, CacheEngine, weakCache) {
    const assetNames = Object.keys(
      typeof assets === 'undefined' ? compilation.assets : assets
    ).filter((assetName) =>
      // eslint-disable-next-line no-undefined
      ModuleFilenameHelpers.matchObject.bind(undefined, this.options)(assetName)
    );

    if (assetNames.length === 0) {
      return Promise.resolve();
    }

    const scheduledTasks = [];
    const cache = new CacheEngine(
      compilation,
      { cache: this.options.cache },
      weakCache
    );

    for (const assetName of assetNames) {
      scheduledTasks.push(
        (async () => {
          const { source, info } = CompressionPlugin.getAsset(
            compilation,
            assetName
          );

          if (info.compressed) {
            return;
          }

          let relatedName;

          if (typeof this.options.algorithm === 'function') {
            let filenameForRelatedName = this.options.filename;

            const index = filenameForRelatedName.lastIndexOf('?');

            if (index >= 0) {
              filenameForRelatedName = filenameForRelatedName.substr(0, index);
            }

            relatedName = `${path.extname(filenameForRelatedName).slice(1)}ed`;
          } else {
            relatedName = `${this.options.algorithm}ed`;
          }

          if (info.related && info.related[relatedName]) {
            return;
          }

          let input = source.source();

          if (!Buffer.isBuffer(input)) {
            input = Buffer.from(input);
          }

          if (input.length < this.options.threshold) {
            return;
          }

          const cacheData = { source };

          if (CompressionPlugin.isWebpack4()) {
            cacheData.cacheKeys = {
              nodeVersion: process.version,
              // eslint-disable-next-line global-require
              'compression-webpack-plugin': require('../package.json').version,
              algorithm: this.algorithm,
              originalAlgorithm: this.options.algorithm,
              compressionOptions: this.compressionOptions,
              assetName,
              contentHash: crypto.createHash('md4').update(input).digest('hex'),
            };
          } else {
            cacheData.assetName = assetName;
          }

          let output = await cache.get(cacheData, { RawSource });

          if (!output) {
            try {
              output = new RawSource(await this.runCompressionAlgorithm(input));
            } catch (error) {
              compilation.errors.push(error);

              return;
            }

            cacheData.output = output;

            await cache.store(cacheData);
          }

          if (output.source().length / input.length > this.options.minRatio) {
            return;
          }

          const newAssetName = CompressionPlugin.interpolateName(
            assetName,
            this.options.filename
          );

          CompressionPlugin.emitAsset(compilation, newAssetName, output, {
            compressed: true,
          });

          if (this.options.deleteOriginalAssets) {
            // eslint-disable-next-line no-param-reassign
            CompressionPlugin.deleteAsset(compilation, assetName);
          } else {
            CompressionPlugin.updateAsset(compilation, assetName, source, {
              related: { [relatedName]: newAssetName },
            });
          }
        })()
      );
    }

    return Promise.all(scheduledTasks);
  }

  static isWebpack4() {
    return webpackVersion[0] === '4';
  }

  apply(compiler) {
    const pluginName = this.constructor.name;

    if (CompressionPlugin.isWebpack4()) {
      // eslint-disable-next-line global-require
      const CacheEngine = require('./Webpack4Cache').default;
      const weakCache = new WeakMap();

      compiler.hooks.emit.tapPromise({ name: pluginName }, (compilation) =>
        // eslint-disable-next-line no-undefined
        this.compress(compilation, undefined, CacheEngine, weakCache)
      );
    } else {
      // eslint-disable-next-line global-require
      const CacheEngine = require('./Webpack5Cache').default;

      compiler.hooks.compilation.tap(pluginName, (compilation) => {
        // eslint-disable-next-line global-require
        const Compilation = require('webpack/lib/Compilation');

        compilation.hooks.processAssets.tapPromise(
          {
            name: pluginName,
            stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER,
          },
          (assets) => this.compress(compilation, assets, CacheEngine)
        );

        compilation.hooks.statsPrinter.tap(pluginName, (stats) => {
          stats.hooks.print
            .for('asset.info.compressed')
            .tap(
              'compression-webpack-plugin',
              (minimized, { green, formatFlag }) =>
                // eslint-disable-next-line no-undefined
                minimized ? green(formatFlag('compressed')) : undefined
            );
        });
      });
    }
  }
}

export default CompressionPlugin;
