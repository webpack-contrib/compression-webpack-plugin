export default class Cache {
  constructor(compilation) {
    this.cache = compilation.getCache("CompressionWebpackPlugin");
  }

  async get(cacheData) {
    // eslint-disable-next-line no-param-reassign
    cacheData.eTag =
      cacheData.eTag || this.cache.getLazyHashedEtag(cacheData.inputSource);

    return this.cache.getPromise(cacheData.name, cacheData.eTag);
  }

  async store(cacheData) {
    return this.cache.storePromise(
      cacheData.name,
      cacheData.eTag,
      cacheData.output
    );
  }
}
