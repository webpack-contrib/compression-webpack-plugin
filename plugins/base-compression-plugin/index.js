var async = require("async");
var url = require('url');

var RawSource = require("webpack-sources/lib/RawSource");

function BaseCompressionPlugin(options) {};

BaseCompressionPlugin.prototype.apply = function(compiler) {
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
					callback();
				}.bind(this));
			}.bind(this), callback);
		}.bind(this));
	}.bind(this));
};

module.exports = BaseCompressionPlugin;
