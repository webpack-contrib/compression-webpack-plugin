/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Jason Palmer @palmerj3
*/
var zlib = require('zlib');

var BaseCompressionPlugin = require('base-compression-webpack-plugin');

function GzipCompressionPlugin(options) {
	BaseCompressionPlugin.call(this, options);

	options = options || {};
	this.asset = options.asset || "[path].gz[query]";
	this.algorithm = options.algorithm || "gzip";
	this.compressionOptions = {};
	if(typeof this.algorithm === "string") {
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
	this.test = options.test || options.regExp;
	this.threshold = options.threshold || 0;
	this.minRatio = options.minRatio || 0.8;
}

GzipCompressionPlugin.prototype = Object.create(BaseCompressionPlugin);
GzipCompressionPlugin.prototype.constructor = GzipCompressionPlugin;

GzipCompressionPlugin.prototype.apply = function (compiler) {
	BaseCompressionPlugin.prototype.apply.call(this, compiler);
};

module.exports = GzipCompressionPlugin;
