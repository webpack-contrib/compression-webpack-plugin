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
	if(typeof this.algorithm === "string") {
		var lib, algo;
		if (this.algorithm === "zopfli") {
			try {
				lib = require("node-zopfli");
			} catch(err) {
				throw new Error("node-zopfli not found");
			}
			algo = lib.gzip;
			options = {
				verbose: options.hasOwnProperty('verbose') ? options.verbose : false,
				verbose_more: options.hasOwnProperty('verbose_more') ? options.verbose_more : false,
				numiterations: options.numiterations ? options.numiterations : 15,
				blocksplitting: options.hasOwnProperty('blocksplitting') ? options.blocksplitting : true,
				blocksplittinglast: options.hasOwnProperty('blocksplittinglast') ? options.blocksplittinglast : false,
				blocksplittingmax: options.blocksplittingmax ? options.blocksplittingmax : 15
			};
		} else {
			lib = require("zlib");
			algo = lib[this.algorithm];
			if(!algo) throw new Error("Algorithm not found in zlib");
			options = {
				level: options.level || 9,
				flush: options.flush,
				chunkSize: options.chunkSize,
				windowBits: options.windowBits,
				memLevel: options.memLevel,
				strategy: options.strategy,
				dictionary: options.dictionary
			};
		}
		this.algorithm = function (buf, cb) {
			algo.call(lib, buf, options, cb);
		};
	}
	this.test = options.test || options.regExp;
	this.threshold = options.threshold || 0;
	this.minRatio = options.minRatio || 0.8;
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
				this.algorithm(content, function(err, result) {
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
