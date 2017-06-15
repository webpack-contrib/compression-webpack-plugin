/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var async = require("async");
var url = require('url');

var RawSource = require("webpack-sources/lib/RawSource");

function CompressionPlugin(options) {
	options = options || {};
	this.asset = options.asset || "[path].gz[query]";
	this.algorithm = options.algorithm || "gzip";
	this.filename = options.filename || false;
	this.compressionOptions = {};
	if(typeof this.algorithm === "string") {
		if (this.algorithm === "zopfli") {
			throw new Error("This plugin doesn't support zopfli anymore.",
							"This functionality has been separated into a separate npm module available at ",
							"https://github.com/webpack-contrib/zopfli-webpack-plugin");	
		} else {
			var zlib = require("zlib");
			this.algorithm = zlib[this.algorithm];
			if(!this.algorithm) throw new Error("Algorithm not found in zlib");
			this.compressionOptions = {
				level: options.level || 9,
				flush: options.flush,
				chunkSize: options.chunkSize,
				windowBits: options.windowBits,
				memLevel: options.memLevel,
				strategy: options.strategy,
				dictionary: options.dictionary
			};
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
					if (typeof this.filename === 'function') {
						newFile = this.filename(newFile);
					}					
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
