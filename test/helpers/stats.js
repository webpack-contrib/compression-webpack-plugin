/* eslint-disable */
export function assets(stats, i) {
  const asset = (asset) => {
    if (/map/.test(asset)) return false;
    return stats.compilation.assets[asset].sourceAndMap();
  };

  const assets = Object.keys(stats.compilation.assets)
    .map(asset)
    .filter(Boolean);

  return i ? assets[i] : assets;
}

export function errors(stats, i) {
  const { errors } = stats.compilation.errors;

  return i ? errors[i] : errors;
}

export function warnings(stats, i) {
  const { warnings } = stats.compilation.warnings;

  return i ? warnings[i] : warnings;
}

export default {
  assets,
  errors,
  warnings,
};
