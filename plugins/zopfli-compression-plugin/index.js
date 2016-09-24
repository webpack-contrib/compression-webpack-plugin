/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var zopfli = require("node-zopfli");

var BaseCompressionPlugin = require('base-compression-webpack-plugin');

function ZopfliCompressionPlugin(options) {
	options = options || {};
	this.asset = options.asset || "[path].gz[query]";
	this.compressionOptions = {};

	this.compressionOptions = {
		verbose: options.hasOwnProperty('verbose') ? options.verbose : false,
		verbose_more: options.hasOwnProperty('verbose_more') ? options.verbose_more : false,
		numiterations: options.numiterations ? options.numiterations : 15,
		blocksplitting: options.hasOwnProperty('blocksplitting') ? options.blocksplitting : true,
		blocksplittinglast: options.hasOwnProperty('blocksplittinglast') ? options.blocksplittinglast : false,
		blocksplittingmax: options.blocksplittingmax ? options.blocksplittingmax : 15
	};
	this.algorithm = function (content, options, fn) {
		zopfli.gzip(content, options, fn);
	};

	this.test = options.test || options.regExp;
	this.threshold = options.threshold || 0;
	this.minRatio = options.minRatio || 0.8;
}

ZopfliCompressionPlugin.prototype = Object.create(BaseCompressionPlugin);
ZopfliCompressionPlugin.prototype.constructor = ZopfliCompressionPlugin;

ZopfliCompressionPlugin.prototype.apply = function (compiler) {
	BaseCompressionPlugin.prototype.apply.call(this, compiler);
};

module.exports = ZopfliCompressionPlugin;
