/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/

import path from "path";

import { validate } from "schema-utils";
import serialize from "serialize-javascript";

import schema from "./options.json";

class CompressionPlugin {
  constructor(options = {}) {
    validate(schema, options, {
      name: "Compression Plugin",
      baseDataPath: "options",
    });

    const {
      test,
      include,
      exclude,
      cache = true,
      algorithm = "gzip",
      compressionOptions = {},
      filename = "[path][base].gz",
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

    if (typeof this.algorithm === "string") {
      // eslint-disable-next-line global-require
      const zlib = require("zlib");

      this.algorithm = zlib[this.algorithm];

      if (!this.algorithm) {
        throw new Error(
          `Algorithm "${this.options.algorithm}" is not found in "zlib"`
        );
      }

      const defaultCompressionOptions =
        {
          gzip: {
            level: zlib.constants.Z_BEST_COMPRESSION,
          },
          deflate: {
            level: zlib.constants.Z_BEST_COMPRESSION,
          },
          deflateRaw: {
            level: zlib.constants.Z_BEST_COMPRESSION,
          },
          brotliCompress: {
            params: {
              [zlib.constants.BROTLI_PARAM_QUALITY]:
                zlib.constants.BROTLI_MAX_QUALITY,
            },
          },
        }[algorithm] || {};

      this.options.compressionOptions = {
        ...defaultCompressionOptions,
        ...this.options.compressionOptions,
      };
    }
  }

  runCompressionAlgorithm(input) {
    return new Promise((resolve, reject) => {
      this.algorithm(
        input,
        this.options.compressionOptions,
        (error, result) => {
          if (error) {
            return reject(error);
          }

          if (!Buffer.isBuffer(result)) {
            // eslint-disable-next-line no-param-reassign
            result = Buffer.from(result);
          }

          return resolve(result);
        }
      );
    });
  }

  async compress(compilation, assets, compiler) {
    const cache = compilation.getCache("CompressionWebpackPlugin");
    const assetNames = Object.keys(
      typeof assets === "undefined" ? compilation.assets : assets
    ).filter((assetName) =>
      compiler.webpack.ModuleFilenameHelpers.matchObject.bind(
        // eslint-disable-next-line no-undefined
        undefined,
        this.options
      )(assetName)
    );

    if (assetNames.length === 0) {
      return Promise.resolve();
    }

    const { RawSource } = compiler.webpack.sources;
    const scheduledTasks = [];

    for (const name of assetNames) {
      scheduledTasks.push(
        (async () => {
          const { source: inputSource, info } = compilation.getAsset(name);

          if (info.compressed) {
            return;
          }

          let relatedName;

          if (typeof this.options.algorithm === "function") {
            let filenameForRelatedName = this.options.filename;

            const index = filenameForRelatedName.lastIndexOf("?");

            if (index >= 0) {
              filenameForRelatedName = filenameForRelatedName.substr(0, index);
            }

            relatedName = `${path.extname(filenameForRelatedName).slice(1)}ed`;
          } else if (this.options.algorithm === "gzip") {
            relatedName = "gzipped";
          } else {
            relatedName = `${this.options.algorithm}ed`;
          }

          if (info.related && info.related[relatedName]) {
            return;
          }

          let input = inputSource.source();

          if (!Buffer.isBuffer(input)) {
            input = Buffer.from(input);
          }

          if (input.length < this.options.threshold) {
            return;
          }

          const eTag = cache.getLazyHashedEtag(inputSource);
          const cacheItem = cache.getItemCache(
            serialize({
              name,
              algorithm: this.options.algorithm,
            }),
            eTag
          );

          let output = await cacheItem.getPromise();

          if (!output) {
            try {
              output = new RawSource(await this.runCompressionAlgorithm(input));
            } catch (error) {
              compilation.errors.push(error);

              return;
            }

            await cacheItem.storePromise(output);
          }

          if (output.source().length / input.length > this.options.minRatio) {
            return;
          }

          const match = /^([^?#]*)(\?[^#]*)?(#.*)?$/.exec(name);
          const [, replacerFile] = match;
          const replacerQuery = match[2] || "";
          const replacerFragment = match[3] || "";
          const replacerExt = path.extname(replacerFile);
          const replacerBase = path.basename(replacerFile);
          const replacerName = replacerBase.slice(
            0,
            replacerBase.length - replacerExt.length
          );
          const replacerPath = replacerFile.slice(
            0,
            replacerFile.length - replacerBase.length
          );
          const pathData = {
            file: replacerFile,
            query: replacerQuery,
            fragment: replacerFragment,
            path: replacerPath,
            base: replacerBase,
            name: replacerName,
            ext: replacerExt || "",
          };

          let newFilename = this.options.filename;

          if (typeof newFilename === "function") {
            newFilename = newFilename(pathData);
          }

          const newName = newFilename.replace(
            /\[(file|query|fragment|path|base|name|ext)]/g,
            (p0, p1) => pathData[p1]
          );

          const newInfo = { compressed: true };

          if (info.immutable && /(\[name]|\[base]|\[file])/.test(newFilename)) {
            newInfo.immutable = true;
          }

          if (this.options.deleteOriginalAssets) {
            if (this.options.deleteOriginalAssets === "keep-source-map") {
              // TODO `...` required only for webpack@4
              const updatedAssetInfo = {
                ...info,
                related: { ...info.related, sourceMap: null },
              };

              compilation.updateAsset(name, inputSource, updatedAssetInfo);
            }

            compilation.deleteAsset(name);
          } else {
            // TODO `...` required only for webpack@4
            const newOriginalInfo = {
              ...info,
              related: { [relatedName]: newName, ...info.related },
            };

            compilation.updateAsset(name, inputSource, newOriginalInfo);
          }

          compilation.emitAsset(newName, output, newInfo);
        })()
      );
    }

    return Promise.all(scheduledTasks);
  }

  apply(compiler) {
    const pluginName = this.constructor.name;

    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      // eslint-disable-next-line global-require
      const Compilation = require("webpack/lib/Compilation");

      compilation.hooks.processAssets.tapPromise(
        {
          name: pluginName,
          stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER,
        },
        (assets) => this.compress(compilation, assets, compiler)
      );

      compilation.hooks.statsPrinter.tap(pluginName, (stats) => {
        stats.hooks.print
          .for("asset.info.compressed")
          .tap(
            "compression-webpack-plugin",
            (compressed, { green, formatFlag }) =>
              // eslint-disable-next-line no-undefined
              compressed ? green(formatFlag("compressed")) : undefined
          );
      });
    });
  }
}

export default CompressionPlugin;
