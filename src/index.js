/*
MIT License http://www.opensource.org/licenses/mit-license.php
Author Tobias Koppers @sokra
*/
import url from 'url';
import async from 'async';
import RawSource from 'webpack-sources/lib/RawSource';

class CompressionPlugin {
  constructor(options = {}) {
    const {
      asset = '[path].gz[query]',
      test,
      regExp,
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
      regExp,
      algorithm,
      filename,
      compressionOptions,
      cache,
      threshold,
      minRatio,
      deleteOriginalAssets,
    };

    if (typeof algorithm === 'string') {
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
    compiler.plugin('emit', (compilation, callback) => {
      const assets = compilation.assets;
      async.forEach(Object.keys(assets), (file, cb) => {
        if (Array.isArray(this.options.test)) {
          if (this.options.test.every(t => !t.test(file))) {
            return cb();
          }
        } else if (this.options.test && !this.options.test.test(file)) {
          return cb();
        }
        const asset = assets[file];
        let content = asset.source();

        if (!Buffer.isBuffer(content)) {
          content = new Buffer(content, 'utf-8');
        }

        const originalSize = content.length;

        if (originalSize < this.options.threshold) {
          return cb();
        }

        this.options.algorithm(content, this.options.compressionOptions, (err, result) => {
          if (err) { return cb(err); }

          if (result.length / originalSize > this.options.minRatio) { return cb(); }

          const parse = url.parse(file);
          const sub = {
            file,
            path: parse.pathname,
            query: parse.query || '',
          };

          let newFile = this.options.asset.replace(/\[(file|path|query)\]/g, (p0, p1) => sub[p1]);

          if (typeof this.options.filename === 'function') {
            newFile = this.options.filename(newFile);
          }
          assets[newFile] = new RawSource(result);
          if (this.options.deleteOriginalAssets) {
            delete assets[file];
          }
          cb();
        });
      }, callback);
    });
  }
}

export default CompressionPlugin;
