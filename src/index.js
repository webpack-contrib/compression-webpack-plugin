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

  compress(input) {
    return new Promise((resolve, reject) => {
      const { algorithm, compressionOptions } = this;

      algorithm(input, compressionOptions, (error, result) => {
        if (error) {
          return reject(error);
        }

        return resolve(result);
      });
    });
  }

  *getTask(compilation, assetName) {
    const { source: assetSource, info: assetInfo } = CompressionPlugin.getAsset(
      compilation,
      assetName
    );

    if (assetInfo.compressed) {
      yield false;
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

    if (assetInfo.related && assetInfo.related[relatedName]) {
      yield false;
    }

    let input = assetSource.source();

    if (!Buffer.isBuffer(input)) {
      input = Buffer.from(input);
    }

    if (input.length < this.options.threshold) {
      yield false;
    }

    const task = { assetName, assetSource, assetInfo, input, relatedName };

    if (CompressionPlugin.isWebpack4()) {
      task.cacheKeys = {
        nodeVersion: process.version,
        // eslint-disable-next-line global-require
        'compression-webpack-plugin': require('../package.json').version,
        algorithm: this.algorithm,
        originalAlgorithm: this.options.algorithm,
        compressionOptions: this.compressionOptions,
        assetName,
        contentHash: crypto.createHash('md4').update(input).digest('hex'),
      };
    }

    yield task;
  }

  afterTask(compilation, task) {
    const { output, input } = task;

    if (output.source().length / input.length > this.options.minRatio) {
      return;
    }

    const { assetSource, assetName } = task;
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
      CompressionPlugin.updateAsset(compilation, assetName, assetSource, {
        related: { [task.relatedName]: newAssetName },
      });
    }
  }

  async runTasks(compilation, assetNames, CacheEngine, weakCache) {
    const scheduledTasks = [];
    const cache = new CacheEngine(
      compilation,
      {
        cache: this.options.cache,
      },
      weakCache
    );

    for (const assetName of assetNames) {
      scheduledTasks.push(
        (async () => {
          const task = this.getTask(compilation, assetName).next().value;

          if (!task) {
            return Promise.resolve();
          }

          task.output = await cache.get(task, { RawSource });

          if (!task.output) {
            try {
              // eslint-disable-next-line no-param-reassign
              task.output = new RawSource(await this.compress(task.input));
            } catch (error) {
              compilation.errors.push(error);

              return Promise.resolve();
            }

            await cache.store(task);
          }

          this.afterTask(compilation, task);

          return Promise.resolve();
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
    const matchObject = ModuleFilenameHelpers.matchObject.bind(
      // eslint-disable-next-line no-undefined
      undefined,
      this.options
    );
    const compressionFn = async (
      compilation,
      assets,
      CacheEngine,
      weakCache
    ) => {
      const assetNames = Object.keys(
        typeof assets === 'undefined' ? compilation.assets : assets
      ).filter((assetName) => matchObject(assetName));

      if (assetNames.length === 0) {
        return Promise.resolve();
      }

      await this.runTasks(compilation, assetNames, CacheEngine, weakCache);

      return Promise.resolve();
    };

    if (CompressionPlugin.isWebpack4()) {
      // eslint-disable-next-line global-require
      const CacheEngine = require('./Webpack4Cache').default;
      const weakCache = new WeakMap();

      compiler.hooks.emit.tapPromise({ name: pluginName }, (compilation) =>
        // eslint-disable-next-line no-undefined
        compressionFn(compilation, undefined, CacheEngine, weakCache)
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
          (assets) => compressionFn(compilation, assets, CacheEngine)
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
