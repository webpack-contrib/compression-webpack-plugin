import readAsset from "./readAsset";

/** @typedef {import("webpack").Asset} Asset */
/** @typedef {import("webpack").Compiler} Compiler */
/** @typedef {import("webpack").Stats} Stats */
/** @typedef {import("webpack").MultiStats} MultiStats */

/**
 * @param {Compiler} compiler compiler
 * @param {Stats | MultiStats} stats stats
 * @returns {Record<string, Asset>} assets
 */
export default function readAssets(compiler, stats) {
  const assets = {};

  for (const asset of Object.keys(stats.compilation.assets)) {
    assets[asset] = readAsset(asset, compiler, stats);
  }

  return assets;
}
