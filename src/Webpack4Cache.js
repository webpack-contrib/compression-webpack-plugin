import os from 'os';

import cacache from 'cacache';
import findCacheDir from 'find-cache-dir';
import serialize from 'serialize-javascript';

export default class Webpack4Cache {
  constructor(compilation, options) {
    this.cacheDir =
      options.cache === true
        ? Webpack4Cache.getCacheDirectory()
        : options.cache;
  }

  static getCacheDirectory() {
    return findCacheDir({ name: 'compression-webpack-plugin' }) || os.tmpdir();
  }

  isEnabled() {
    return Boolean(this.cacheDir);
  }

  async get(task) {
    // eslint-disable-next-line no-param-reassign
    task.cacheIdent = task.cacheIdent || serialize(task.cacheKeys);

    let cachedResult;

    try {
      cachedResult = await cacache.get(this.cacheDir, task.cacheIdent);
    } catch (ignoreError) {
      // eslint-disable-next-line no-undefined
      return undefined;
    }

    return Buffer.from(JSON.parse(cachedResult.data).data);
  }

  async store(task) {
    return cacache.put(
      this.cacheDir,
      task.cacheIdent,
      JSON.stringify(task.output)
    );
  }
}
