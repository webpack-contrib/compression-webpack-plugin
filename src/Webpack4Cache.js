import os from 'os';

import cacache from 'cacache';
import findCacheDir from 'find-cache-dir';
import serialize from 'serialize-javascript';

export default class Webpack4Cache {
  constructor(compilation, options, weakCache) {
    this.cache =
      options.cache === true
        ? Webpack4Cache.getCacheDirectory()
        : options.cache;
    this.weakCache = weakCache;
  }

  static getCacheDirectory() {
    return findCacheDir({ name: 'compression-webpack-plugin' }) || os.tmpdir();
  }

  async get(task, sources) {
    const weakOutput = this.weakCache.get(task.assetSource);

    if (weakOutput) {
      return weakOutput;
    }

    if (!this.cache) {
      // eslint-disable-next-line no-undefined
      return undefined;
    }

    // eslint-disable-next-line no-param-reassign
    task.cacheIdent = task.cacheIdent || serialize(task.cacheKeys);

    let cachedResult;

    try {
      cachedResult = await cacache.get(this.cache, task.cacheIdent);
    } catch (ignoreError) {
      // eslint-disable-next-line no-undefined
      return undefined;
    }

    return new sources.RawSource(
      Buffer.from(JSON.parse(cachedResult.data).data)
    );
  }

  async store(task) {
    if (!this.weakCache.has(task.assetSource)) {
      this.weakCache.set(task.assetSource, task.output);
    }

    if (!this.cache) {
      // eslint-disable-next-line no-undefined
      return undefined;
    }

    const { cacheIdent, output } = task;

    return cacache.put(this.cache, cacheIdent, JSON.stringify(output.source()));
  }
}
