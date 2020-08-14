export default (stats, withAssetInfo = false) => {
  const { assets, assetsInfo } = stats.compilation;

  return Object.keys(assets)
    .sort()
    .map((assetName) => {
      const item = [assetName, assets[assetName].size()];

      if (withAssetInfo) {
        item.push(assetsInfo.get(assetName));
      }

      return item;
    });
};
