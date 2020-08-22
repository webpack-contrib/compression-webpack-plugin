import os from 'os';

import cacache from 'cacache';
import findCacheDir from 'find-cache-dir';
import serialize from 'serialize-javascript';

const weakCache = new WeakMap();

export default class Webpack4Cache {
  constructor(compilation, options) {
    // TODO rename
    this.cacheDir =
      options.cache === true
        ? Webpack4Cache.getCacheDirectory()
        : options.cache;
  }

  static getCacheDirectory() {
    return findCacheDir({ name: 'compression-webpack-plugin' }) || os.tmpdir();
  }

  async get(task, sources) {
    const weakOutput = weakCache.get(task.assetSource);

    if (weakOutput) {
      return weakOutput;
    }

    if (!this.cacheDir) {
      // eslint-disable-next-line no-undefined
      return undefined;
    }

    // eslint-disable-next-line no-param-reassign
    task.cacheIdent = task.cacheIdent || serialize(task.cacheKeys);

    let cachedResult;

    try {
      cachedResult = await cacache.get(this.cacheDir, task.cacheIdent);
    } catch (ignoreError) {
      // eslint-disable-next-line no-undefined
      return undefined;
    }

    return new sources.RawSource(
      Buffer.from(JSON.parse(cachedResult.data).data)
    );
  }

  async store(task) {
    if (!weakCache.has(task.assetSource)) {
      weakCache.set(task.assetSource, task.output);
    }

    const { cacheDir } = this;

    if (!cacheDir) {
      // eslint-disable-next-line no-undefined
      return undefined;
    }

    const { cacheIdent, output } = task;

    return cacache.put(cacheDir, cacheIdent, JSON.stringify(output.source()));
  }
}
