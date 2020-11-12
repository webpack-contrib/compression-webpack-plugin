import os from "os";

import cacache from "cacache";
import findCacheDir from "find-cache-dir";
import serialize from "serialize-javascript";

export default class Webpack4Cache {
  constructor(compilation, options, weakCache) {
    this.cache =
      options.cache === true
        ? Webpack4Cache.getCacheDirectory()
        : options.cache;
    this.weakCache = weakCache;
  }

  static getCacheDirectory() {
    return findCacheDir({ name: "compression-webpack-plugin" }) || os.tmpdir();
  }

  async get(cacheData, { RawSource }) {
    if (!this.cache) {
      // eslint-disable-next-line no-undefined
      return undefined;
    }

    const weakOutput = this.weakCache.get(cacheData.inputSource);

    if (weakOutput) {
      return weakOutput;
    }

    // eslint-disable-next-line no-param-reassign
    cacheData.cacheIdent =
      cacheData.cacheIdent || serialize(cacheData.cacheKeys);

    let cachedResult;

    try {
      cachedResult = await cacache.get(this.cache, cacheData.cacheIdent);
    } catch (ignoreError) {
      // eslint-disable-next-line no-undefined
      return undefined;
    }

    return new RawSource(Buffer.from(JSON.parse(cachedResult.data).data));
  }

  async store(cacheData) {
    if (!this.cache) {
      // eslint-disable-next-line no-undefined
      return undefined;
    }

    if (!this.weakCache.has(cacheData.inputSource)) {
      this.weakCache.set(cacheData.inputSource, cacheData.output);
    }

    const { cacheIdent, output } = cacheData;

    return cacache.put(this.cache, cacheIdent, JSON.stringify(output.source()));
  }
}
