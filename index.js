/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var async = require("async");

var RawSource = require("webpack/lib/RawSource");

function CompressionPlugin(options) {
	options = options || {};
	this.asset = options.asset || "{file}.gz";
	this.algorithm = options.algorithm || "gzip";
	if(typeof this.algorithm === "string") {
		var zlib = require("zlib");
		this.algorithm = zlib[this.algorithm];
		if(!this.algorithm) throw new Error("Algorithm not found in zlib");
		this.algorithm = this.algorithm.bind(zlib);
	}
	this.regExp = options.regExp;
	this.threshold = options.threshold || 0;
	this.minRatio = options.minRatio || 0.8;
}
module.exports = CompressionPlugin;

CompressionPlugin.prototype.apply = function(compiler) {
	compiler.plugin("this-compilation", function(compilation) {
		compilation.plugin("optimize-assets", function(assets, callback) {
			async.forEach(Object.keys(assets), function(file, callback) {
				if(this.regExp && !this.regExp.test(file)) return callback();
				var asset = assets[file];
				var content = asset.source();
				if(!Buffer.isBuffer(content))
					content = new Buffer(content, "utf-8");
				var originalSize = content.length;
				if(originalSize < this.threshold) return callback();
				this.algorithm(content, function(err, result) {
					if(err) return callback(err);
					if(result.length / originalSize > this.minRatio) return callback();
					var newFile = this.asset.replace(/\{file\}/g, file);
					assets[newFile] = new RawSource(result);
					callback();
				}.bind(this));
			}.bind(this), callback);
		}.bind(this));
	}.bind(this));
};
