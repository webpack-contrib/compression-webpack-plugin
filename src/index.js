/*
MIT License http://www.opensource.org/licenses/mit-license.php
Author Tobias Koppers @sokra
*/

import crypto from 'crypto';
import url from 'url';
import path from 'path';

import RawSource from 'webpack-sources/lib/RawSource';
import { ModuleFilenameHelpers, version as webpackVersion } from 'webpack';
import validateOptions from 'schema-utils';

import pkg from '../package.json';

import schema from './options.json';

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

    this.algorithm = this.options.algorithm;
    this.compressionOptions = this.options.compressionOptions;

    if (typeof this.algorithm === 'string') {
      // eslint-disable-next-line global-require
      const zlib = require('zlib');

      this.algorithm = zlib[this.algorithm];

      if (!this.algorithm) {
        throw new Error(
          `Algorithm "${this.options.algorithm}" is not found in zlib`
        );
      }

      const defaultCompressionOptions = { level: 9 };

      // TODO change this behaviour in the next major release
      this.compressionOptions = {
        ...defaultCompressionOptions,
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

  *getTask(assetName, assetSource) {
    let input = assetSource.source();

    if (!Buffer.isBuffer(input)) {
      input = Buffer.from(input);
    }

    if (input.length < this.options.threshold) {
      yield false;
    }

    const task = { assetName, assetSource, input };

    if (CompressionPlugin.isWebpack4()) {
      task.cacheKeys = {
        node: process.version,
        'compression-webpack-plugin': pkg.version,
        algorithm: this.algorithm,
        compressionOptions: this.algorithm.compressionOptions,
        contentHash: crypto.createHash('md4').update(input).digest('hex'),
        ...task.cacheKeys,
      };
    }

    yield task;
  }

  afterTask(compilation, task, weakCache) {
    const { output, input } = task;

    if (output.length / input.length > this.options.minRatio) {
      return;
    }

    const { assetSource, assetName } = task;

    let weakOutput = weakCache.get(assetSource);

    if (!weakOutput) {
      weakOutput = new RawSource(output);

      weakCache.set(assetSource, weakOutput);
    }

    const newAssetName = CompressionPlugin.interpolateName(
      assetName,
      this.options.filename
    );

    CompressionPlugin.emitAsset(compilation, newAssetName, weakOutput, {
      compressed: true,
    });

    if (this.options.deleteOriginalAssets) {
      // eslint-disable-next-line no-param-reassign
      CompressionPlugin.deleteAsset(compilation, assetName);
    }
  }

  async runTasks(compilation, assetNames, CacheEngine, weakCache) {
    const scheduledTasks = [];
    const cache = new CacheEngine(compilation, {
      cache: this.options.cache,
    });

    for (const assetName of assetNames) {
      const enqueue = async (task) => {
        try {
          // eslint-disable-next-line no-param-reassign
          task.output = await this.compress(task.input);
        } catch (error) {
          compilation.errors.push(error);

          return;
        }

        if (cache.isEnabled()) {
          await cache.store(task, task.output);
        }

        this.afterTask(compilation, task, weakCache);
      };

      scheduledTasks.push(
        (async () => {
          const assetSource = CompressionPlugin.getAsset(compilation, assetName)
            .source;
          const task = this.getTask(assetName, assetSource).next().value;

          if (!task) {
            return Promise.resolve();
          }

          if (cache.isEnabled()) {
            try {
              task.output = await cache.get(task);
            } catch (ignoreError) {
              return enqueue(task);
            }

            // Webpack@5 return `undefined` when cache is not found
            if (!task.output) {
              return enqueue(task);
            }

            this.afterTask(compilation, task, weakCache);

            return Promise.resolve();
          }

          return enqueue(task);
        })()
      );
    }

    return Promise.all(scheduledTasks);
  }

  static isWebpack4() {
    return webpackVersion[0] === '4';
  }

  apply(compiler) {
    const matchObject = ModuleFilenameHelpers.matchObject.bind(
      // eslint-disable-next-line no-undefined
      undefined,
      this.options
    );
    const pluginName = this.constructor.name;
    const CacheEngine = CompressionPlugin.isWebpack4()
      ? // eslint-disable-next-line global-require
        require('./Webpack4Cache').default
      : // eslint-disable-next-line global-require
        require('./Webpack5Cache').default;
    const weakCache = new WeakMap();

    compiler.hooks.emit.tapPromise(
      { name: pluginName },
      async (compilation) => {
        const { assets } = compilation;

        const assetNames = Object.keys(assets).filter((assetName) =>
          matchObject(assetName)
        );

        if (assetNames.length === 0) {
          return Promise.resolve();
        }

        await this.runTasks(compilation, assetNames, CacheEngine, weakCache);

        return Promise.resolve();
      }
    );

    if (!CompressionPlugin.isWebpack4()) {
      compiler.hooks.compilation.tap(pluginName, (compilation) => {
        compilation.hooks.statsPrinter.tap(pluginName, (stats) => {
          stats.hooks.print
            .for('asset.info.compressed')
            .tap('terser-webpack-plugin', (minimized, { green, formatFlag }) =>
              // eslint-disable-next-line no-undefined
              minimized ? green(formatFlag('compressed')) : undefined
            );
        });
      });
    }
  }
}

export default CompressionPlugin;
