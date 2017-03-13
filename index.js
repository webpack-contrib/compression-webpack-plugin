/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var async = require("async");
var url = require('url');

var RawSource = require("webpack-sources/lib/RawSource");

var NON_COMPRESSION_OPTIONS = ['asset', 'algorithm', 'test', 'threshold', 'minRatio'];

function CompressionPlugin(options) {
	options = options || {};
	this.asset = options.asset || "[path].gz[query]";
	this.algorithm = options.algorithm || "gzip";
	this.compressionOptions = Object.keys(options).reduce(function(o, k) {
		if(NON_COMPRESSION_OPTIONS.indexOf(k) < 0) o[k] = options[k];
		return o;
	}, {});
	if(typeof this.algorithm === "string") {
		var defaultCompressionOptions;
		if (this.algorithm === "zopfli") {
			try {
				var zopfli = require("node-zopfli");
			} catch(err) {
				throw new Error("node-zopfli not found");
			}
			defaultCompressionOptions = {
				verbose: false,
				verbose_more: false,
				numiterations: 15,
				blocksplitting: true,
				blocksplittinglast: false,
				blocksplittingmax: 15
			};
			this.algorithm = function (content, options, fn) {
				zopfli.gzip(content, options, fn);
			};
		} else {
			var zlib = require("zlib");
			this.algorithm = zlib[this.algorithm];
			if(!this.algorithm) throw new Error("Algorithm not found in zlib");
			defaultCompressionOptions = {
				level: 9
			};
		}
		for(var k in defaultCompressionOptions) {
			if(!this.compressionOptions.hasOwnProperty(k)) {
				this.compressionOptions[k] = defaultCompressionOptions[k];
			}
		}
	}
	this.test = options.test || options.regExp;
	this.threshold = options.threshold || 0;
	this.minRatio = options.minRatio || 0.8;
	this.deleteOriginalAssets = options.deleteOriginalAssets || false;
}
module.exports = CompressionPlugin;

CompressionPlugin.prototype.apply = function(compiler) {
	compiler.plugin("this-compilation", function(compilation) {
		compilation.plugin("optimize-assets", function(assets, callback) {
			async.forEach(Object.keys(assets), function(file, callback) {
				if(Array.isArray(this.test)) {
					if(this.test.every(function(t) {
						return !t.test(file);
					})) return callback();
				} else if(this.test && !this.test.test(file))
					return callback();
				var asset = assets[file];
				var content = asset.source();
				if(!Buffer.isBuffer(content))
					content = new Buffer(content, "utf-8");
				var originalSize = content.length;
				if(originalSize < this.threshold) return callback();
				this.algorithm(content, this.compressionOptions, function(err, result) {
					if(err) return callback(err);
					if(result.length / originalSize > this.minRatio) return callback();
					var parse = url.parse(file);
					var sub = {
						file: file,
						path: parse.pathname,
						query: parse.query || ""
					};
					var newFile = this.asset.replace(/\[(file|path|query)\]/g, function(p0,p1) {
						return sub[p1];
					});
					assets[newFile] = new RawSource(result);
					if (this.deleteOriginalAssets) {
						delete assets[file];
					}
					callback();
				}.bind(this));
			}.bind(this), callback);
		}.bind(this));
	}.bind(this));
};
