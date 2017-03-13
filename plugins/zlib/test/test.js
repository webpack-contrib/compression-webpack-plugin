var assert = require('assert');
var CompressionPluginZlib = require('../index.js');

describe('Constructor', function() {
  describe('#CompressionPlugin()', function() {
    it('should set default values', function() {
      var compressionPluginZlib = new CompressionPluginZlib();

      assert.equal(compressionPluginZlib.asset, "[path].gz[query]");
      assert.equal(compressionPluginZlib.threshold, 0);
      assert.equal(compressionPluginZlib.minRatio, 0.8);
    });
  });
});
