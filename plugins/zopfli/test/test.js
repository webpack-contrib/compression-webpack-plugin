var assert = require('assert');
var CompressionPluginZopfli = require('../index.js');

describe('Constructor', function() {
  describe('#CompressionPlugin()', function() {
    it('should set default values', function() {
      var compressionPluginZopfli = new CompressionPluginZopfli();

      assert.equal(compressionPluginZopfli.asset, "[path].gz[query]");
      assert.equal(compressionPluginZopfli.threshold, 0);
      assert.equal(compressionPluginZopfli.minRatio, 0.8);

      assert.equal(compressionPluginZopfli.compressionOptions.verbose, false);
      assert.equal(compressionPluginZopfli.compressionOptions.verbose_more, false);
      assert.equal(compressionPluginZopfli.compressionOptions.numiterations, 15);
      assert.equal(compressionPluginZopfli.compressionOptions.blocksplitting, true);
      assert.equal(compressionPluginZopfli.compressionOptions.blocksplittinglast, false);
      assert.equal(compressionPluginZopfli.compressionOptions.blocksplittingmax, 15);
    });
  });
});
