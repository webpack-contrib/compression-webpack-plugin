import zlib from "zlib";

import { readAsset } from "./index";

export default (stats, compiler) => {
  const { assets, assetsInfo } = stats.compilation;

  return Object.keys(assets)
    .sort()
    .map((name) => {
      const info = assetsInfo.get(name);
      const item = [name, assets[name].size(), info];

      if (info.related) {
        if (info.related.gzipped) {
          const original = readAsset(name, compiler, stats);
          const gzipped = readAsset(info.related.gzipped, compiler, stats);
          const ungzipped = zlib.gunzipSync(gzipped);

          const isEquals = ungzipped.equals(original);

          if (!isEquals) {
            throw new Error(
              `Ungzipped version of "${name}" is not equal to original`
            );
          }
        }
      }

      return item;
    });
};
