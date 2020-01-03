export default (stats, size = true) => {
  const { assets } = stats.compilation;

  return Object.keys(assets)
    .sort()
    .map((assetName) => [
      assetName,
      size ? assets[assetName].size() : 'size was skipped by test',
    ]);
};
