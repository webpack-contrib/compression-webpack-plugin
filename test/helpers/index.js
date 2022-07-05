const compile = require("./compile");
const CopyPluginWithAssetInfo = require("./CopyPluginWithAssetInfo");
const execute = require("./execute");
const getAssetsNameAndSize = require("./getAssetsNameAndSize");
const getCompiler = require("./getCompiler");
const getErrors = require("./getErrors");
const getWarnings = require("./getWarnings");
const ModifyExistingAsset = require("./ModifyExistingAsset");
const EmitNewAsset = require("./EmitNewAsset");
const normalizeErrors = require("./normalizeErrors");
const readAsset = require("./readAsset");
const readsAssets = require("./readAssets");

module.exports = {
  compile,
  CopyPluginWithAssetInfo,
  execute,
  getAssetsNameAndSize,
  getCompiler,
  getErrors,
  getWarnings,
  ModifyExistingAsset,
  EmitNewAsset,
  normalizeErrors,
  readAsset,
  readsAssets,
};
