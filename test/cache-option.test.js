import path from 'path';
import zlib from 'zlib';

import cacache from 'cacache';
import findCacheDir from 'find-cache-dir';
import del from 'del';

import CompressionPlugin from '../src/index';
import Webpack4Cache from '../src/Webpack4Cache';

import {
  compile,
  getAssetsNameAndSize,
  getCompiler,
  getErrors,
  getWarnings,
} from './helpers/index';

const falseCacheDirectory = findCacheDir({ name: 'false-cache-directory' });
const cacheDir = findCacheDir({ name: 'compression-webpack-plugin' });
const otherCacheDir = findCacheDir({ name: 'other-cache-directory' });
const otherOtherCacheDir = findCacheDir({
  name: 'other-other-cache-directory',
});
const uniqueCacheDirectory = findCacheDir({ name: 'unique-cache-directory' });

if (getCompiler.isWebpack4()) {
  describe('"cache" option', () => {
    beforeEach(() => {
      return Promise.all([
        cacache.rm.all(falseCacheDirectory),
        cacache.rm.all(cacheDir),
        cacache.rm.all(otherCacheDir),
        cacache.rm.all(uniqueCacheDirectory),
        cacache.rm.all(otherOtherCacheDir),
      ]);
    });

    afterAll(() => {
      return Promise.all([
        cacache.rm.all(falseCacheDirectory),
        cacache.rm.all(cacheDir),
        cacache.rm.all(otherCacheDir),
        cacache.rm.all(uniqueCacheDirectory),
        cacache.rm.all(otherOtherCacheDir),
      ]);
    });

    it('matches snapshot for `false` value ({Boolean})', async () => {
      const compiler = getCompiler('./entry.js');

      new CompressionPlugin({ cache: false, minRatio: 1 }).apply(compiler);

      cacache.get = jest.fn(cacache.get);
      cacache.put = jest.fn(cacache.put);

      const getCacheDirectorySpy = jest
        .spyOn(Webpack4Cache, 'getCacheDirectory')
        .mockImplementation(() => {
          return falseCacheDirectory;
        });

      const stats = await compile(compiler);

      expect(getAssetsNameAndSize(stats)).toMatchSnapshot('assets');
      expect(getWarnings(stats)).toMatchSnapshot('errors');
      expect(getErrors(stats)).toMatchSnapshot('warnings');

      // Cache disabled so we don't run `get` or `put`
      expect(cacache.get.mock.calls.length).toBe(0);
      expect(cacache.put.mock.calls.length).toBe(0);

      const cacheEntriesList = await cacache.ls(falseCacheDirectory);
      const cacheKeys = Object.keys(cacheEntriesList);

      expect(cacheKeys.length).toBe(0);

      getCacheDirectorySpy.mockRestore();
    });

    it('matches snapshot for `true` value ({Boolean})', async () => {
      const beforeCacheCompiler = getCompiler('./entry.js');

      new CompressionPlugin({ cache: true, minRatio: 1 }).apply(
        beforeCacheCompiler
      );

      cacache.get = jest.fn(cacache.get);
      cacache.put = jest.fn(cacache.put);

      const getCacheDirectorySpy = jest
        .spyOn(Webpack4Cache, 'getCacheDirectory')
        .mockImplementation(() => {
          return uniqueCacheDirectory;
        });

      const stats = await compile(beforeCacheCompiler);

      expect(getAssetsNameAndSize(stats)).toMatchSnapshot('assets');
      expect(getWarnings(stats)).toMatchSnapshot('errors');
      expect(getErrors(stats)).toMatchSnapshot('warnings');

      const countAssets = Object.keys(stats.compilation.assets).length;

      // Try to found cached files, but we don't have their in cache
      expect(cacache.get.mock.calls.length).toBe(countAssets / 2);
      // Put files in cache
      expect(cacache.put.mock.calls.length).toBe(countAssets / 2);

      const cacheEntriesList = await cacache.ls(uniqueCacheDirectory);

      const cacheKeys = Object.keys(cacheEntriesList);

      // Make sure that we cached files
      expect(cacheKeys.length).toBe(countAssets / 2);

      cacheKeys.forEach((cacheEntry) => {
        // eslint-disable-next-line no-new-func
        const cacheEntryOptions = new Function(
          `'use strict'\nreturn ${cacheEntry}`
        )();
        const basename = path.basename(cacheEntryOptions.assetName);

        expect([basename, cacheEntryOptions.contentHash]).toMatchSnapshot(
          basename
        );
      });

      cacache.get.mockClear();
      cacache.put.mockClear();

      const afterCacheCompiler = getCompiler('./entry.js');

      new CompressionPlugin({ cache: true, minRatio: 1 }).apply(
        afterCacheCompiler
      );

      const newStats = await compile(afterCacheCompiler);

      expect(getAssetsNameAndSize(newStats)).toMatchSnapshot('assets');
      expect(getWarnings(newStats)).toMatchSnapshot('errors');
      expect(getErrors(newStats)).toMatchSnapshot('warnings');

      const newCountAssets = Object.keys(newStats.compilation.assets).length;

      // Now we have cached files so we get their and don't put
      expect(cacache.get.mock.calls.length).toBe(newCountAssets / 2);
      expect(cacache.put.mock.calls.length).toBe(0);

      getCacheDirectorySpy.mockRestore();
    });

    it('matches snapshot for `other-cache-directory` value ({String})', async () => {
      const beforeCacheCompiler = getCompiler('./entry.js');

      new CompressionPlugin({ cache: otherCacheDir, minRatio: 1 }).apply(
        beforeCacheCompiler
      );

      cacache.get = jest.fn(cacache.get);
      cacache.put = jest.fn(cacache.put);

      const stats = await compile(beforeCacheCompiler);

      expect(getAssetsNameAndSize(stats)).toMatchSnapshot('assets');
      expect(getWarnings(stats)).toMatchSnapshot('errors');
      expect(getErrors(stats)).toMatchSnapshot('warnings');

      const countAssets = Object.keys(stats.compilation.assets).length;

      // Try to found cached files, but we don't have their in cache
      expect(cacache.get.mock.calls.length).toBe(countAssets / 2);
      // Put files in cache
      expect(cacache.put.mock.calls.length).toBe(countAssets / 2);

      const cacheEntriesList = await cacache.ls(otherCacheDir);
      const cacheKeys = Object.keys(cacheEntriesList);

      // Make sure that we cached files
      expect(cacheKeys.length).toBe(countAssets / 2);

      cacheKeys.forEach((cacheEntry) => {
        // eslint-disable-next-line no-new-func
        const cacheEntryOptions = new Function(
          `'use strict'\nreturn ${cacheEntry}`
        )();
        const basename = path.basename(cacheEntryOptions.assetName);

        expect([basename, cacheEntryOptions.contentHash]).toMatchSnapshot(
          basename
        );
      });

      cacache.get.mockClear();
      cacache.put.mockClear();

      const afterCacheCompiler = getCompiler('./entry.js');

      new CompressionPlugin({ cache: otherCacheDir, minRatio: 1 }).apply(
        afterCacheCompiler
      );

      const newStats = await compile(afterCacheCompiler);

      expect(getAssetsNameAndSize(newStats)).toMatchSnapshot('assets');
      expect(getWarnings(newStats)).toMatchSnapshot('errors');
      expect(getErrors(newStats)).toMatchSnapshot('warnings');

      const newCountAssets = Object.keys(newStats.compilation.assets).length;

      // Now we have cached files so we get their and don't put
      expect(cacache.get.mock.calls.length).toBe(newCountAssets / 2);
      expect(cacache.put.mock.calls.length).toBe(0);
    });

    it('matches snapshot for `other-other-cache-directory` value ({String}) with the "algorithm" option', async () => {
      const beforeCacheCompiler = getCompiler('./entry.js');

      new CompressionPlugin({
        cache: otherOtherCacheDir,
        minRatio: 1,
        algorithm: (input, compressionOptions, callback) => {
          return zlib.gzip(
            input,
            { ...compressionOptions, ...{ level: 9 } },
            (error, buffer) => {
              callback(error, Uint8Array.from(buffer));
            }
          );
        },
      }).apply(beforeCacheCompiler);

      cacache.get = jest.fn(cacache.get);
      cacache.put = jest.fn(cacache.put);

      const stats = await compile(beforeCacheCompiler);

      expect(getAssetsNameAndSize(stats)).toMatchSnapshot('assets');
      expect(getWarnings(stats)).toMatchSnapshot('errors');
      expect(getErrors(stats)).toMatchSnapshot('warnings');

      const countAssets = Object.keys(stats.compilation.assets).length;

      // Try to found cached files, but we don't have their in cache
      expect(cacache.get.mock.calls.length).toBe(countAssets / 2);
      // Put files in cache
      expect(cacache.put.mock.calls.length).toBe(countAssets / 2);

      const cacheEntriesList = await cacache.ls(otherOtherCacheDir);
      const cacheKeys = Object.keys(cacheEntriesList);

      // Make sure that we cached files
      expect(cacheKeys.length).toBe(countAssets / 2);

      cacheKeys.forEach((cacheEntry) => {
        // eslint-disable-next-line no-new-func
        const cacheEntryOptions = new Function(
          `'use strict'\nreturn ${cacheEntry}`
        )();
        const basename = path.basename(cacheEntryOptions.assetName);

        expect([basename, cacheEntryOptions.contentHash]).toMatchSnapshot(
          basename
        );
      });

      cacache.get.mockClear();
      cacache.put.mockClear();

      const afterCacheCompiler = getCompiler('./entry.js');

      new CompressionPlugin({
        cache: otherOtherCacheDir,
        minRatio: 1,
        algorithm: (input, compressionOptions, callback) => {
          return zlib.gzip(
            input,
            { ...compressionOptions, ...{ level: 9 } },
            (error, buffer) => {
              callback(error, Uint8Array.from(buffer));
            }
          );
        },
      }).apply(afterCacheCompiler);

      const newStats = await compile(afterCacheCompiler);

      expect(getAssetsNameAndSize(newStats)).toMatchSnapshot('assets');
      expect(getWarnings(newStats)).toMatchSnapshot('errors');
      expect(getErrors(newStats)).toMatchSnapshot('warnings');

      const newCountAssets = Object.keys(newStats.compilation.assets).length;

      // Now we have cached files so we get their and don't put
      expect(cacache.get.mock.calls.length).toBe(newCountAssets / 2);
      expect(cacache.put.mock.calls.length).toBe(0);
    });
  });
} else {
  describe('"cache" option', () => {
    const fileSystemCacheDirectory = path.resolve(
      __dirname,
      './outputs/type-filesystem'
    );

    beforeAll(() => {
      return Promise.all([del(fileSystemCacheDirectory)]);
    });

    it('should work when `cache` is `false`', async () => {
      const compiler = getCompiler('./entry.js', {}, { cache: false });

      new CompressionPlugin().apply(compiler);

      let getCounter = 0;

      compiler.cache.hooks.get.tap(
        { name: 'TestCache', stage: -100 },
        (identifier) => {
          if (identifier.indexOf('CompressionWebpackPlugin') !== -1) {
            getCounter += 1;
          }
        }
      );

      let storeCounter = 0;

      compiler.cache.hooks.store.tap(
        { name: 'TestCache', stage: -100 },
        (identifier) => {
          if (identifier.indexOf('CompressionWebpackPlugin') !== -1) {
            storeCounter += 1;
          }
        }
      );

      const stats = await compile(compiler);

      // Without cache webpack always try to get
      expect(getCounter).toBe(4);
      // Without cache webpack always try to store
      expect(storeCounter).toBe(4);
      expect(getAssetsNameAndSize(stats)).toMatchSnapshot('assets');
      expect(getErrors(stats)).toMatchSnapshot('errors');
      expect(getWarnings(stats)).toMatchSnapshot('warnings');

      getCounter = 0;
      storeCounter = 0;

      const newStats = await compile(compiler);

      // Without cache webpack always try to get
      expect(getCounter).toBe(4);
      // Without cache webpack always try to store
      expect(storeCounter).toBe(4);
      expect(getAssetsNameAndSize(newStats)).toMatchSnapshot('assets');
      expect(getErrors(newStats)).toMatchSnapshot('errors');
      expect(getWarnings(newStats)).toMatchSnapshot('warnings');
    });

    it('should work with "memory" value for the "cache.type" option', async () => {
      const compiler = getCompiler(
        './entry.js',
        {},
        {
          cache: {
            type: 'memory',
          },
        }
      );

      new CompressionPlugin().apply(compiler);

      let getCounter = 0;

      compiler.cache.hooks.get.tap(
        { name: 'TestCache', stage: -100 },
        (identifier) => {
          if (identifier.indexOf('CompressionWebpackPlugin') !== -1) {
            getCounter += 1;
          }
        }
      );

      let storeCounter = 0;

      compiler.cache.hooks.store.tap(
        { name: 'TestCache', stage: -100 },
        (identifier) => {
          if (identifier.indexOf('CompressionWebpackPlugin') !== -1) {
            storeCounter += 1;
          }
        }
      );

      const stats = await compile(compiler);

      // Get cache for assets
      expect(getCounter).toBe(4);
      // Store cached assets
      expect(storeCounter).toBe(4);
      expect(getAssetsNameAndSize(stats)).toMatchSnapshot('assets');
      expect(getErrors(stats)).toMatchSnapshot('errors');
      expect(getWarnings(stats)).toMatchSnapshot('warnings');

      getCounter = 0;
      storeCounter = 0;

      const newStats = await compile(compiler);

      // Get cache for assets
      expect(getCounter).toBe(4);
      // No need to store, we got cached assets
      expect(storeCounter).toBe(0);
      expect(getAssetsNameAndSize(newStats)).toMatchSnapshot('assets');
      expect(getErrors(newStats)).toMatchSnapshot('errors');
      expect(getWarnings(newStats)).toMatchSnapshot('warnings');
    });

    it('should work with "filesystem" value for the "cache.type" option', async () => {
      const compiler = getCompiler(
        './entry.js',
        {},
        {
          cache: {
            type: 'filesystem',
            cacheDirectory: fileSystemCacheDirectory,
          },
        }
      );

      new CompressionPlugin().apply(compiler);

      let getCounter = 0;

      compiler.cache.hooks.get.tap(
        { name: 'TestCache', stage: -100 },
        (identifier) => {
          if (identifier.indexOf('CompressionWebpackPlugin') !== -1) {
            getCounter += 1;
          }
        }
      );

      let storeCounter = 0;

      compiler.cache.hooks.store.tap(
        { name: 'TestCache', stage: -100 },
        (identifier) => {
          if (identifier.indexOf('CompressionWebpackPlugin') !== -1) {
            storeCounter += 1;
          }
        }
      );

      const stats = await compile(compiler);

      // Get cache for assets
      expect(getCounter).toBe(4);
      // Store cached assets
      expect(storeCounter).toBe(4);
      expect(getAssetsNameAndSize(stats)).toMatchSnapshot('assets');
      expect(getErrors(stats)).toMatchSnapshot('errors');
      expect(getWarnings(stats)).toMatchSnapshot('warnings');

      getCounter = 0;
      storeCounter = 0;

      const newStats = await compile(compiler);

      // Get cache for assets
      expect(getCounter).toBe(4);
      // No need to store, we got cached assets
      expect(storeCounter).toBe(0);
      expect(getAssetsNameAndSize(newStats)).toMatchSnapshot('assets');
      expect(getErrors(newStats)).toMatchSnapshot('errors');
      expect(getWarnings(newStats)).toMatchSnapshot('warnings');
    });

    it('should work with "filesystem" value for the "cache.type" option and with the "algorithm" option', async () => {
      const compiler = getCompiler(
        './entry.js',
        {},
        {
          cache: {
            type: 'filesystem',
            cacheDirectory: fileSystemCacheDirectory,
          },
        }
      );

      new CompressionPlugin({
        algorithm: (input, compressionOptions, callback) => {
          return zlib.gzip(
            input,
            { ...compressionOptions, ...{ level: 9 } },
            (error, buffer) => {
              callback(error, Uint8Array.from(buffer));
            }
          );
        },
      }).apply(compiler);

      let getCounter = 0;

      compiler.cache.hooks.get.tap(
        { name: 'TestCache', stage: -100 },
        (identifier) => {
          if (identifier.indexOf('CompressionWebpackPlugin') !== -1) {
            getCounter += 1;
          }
        }
      );

      let storeCounter = 0;

      compiler.cache.hooks.store.tap(
        { name: 'TestCache', stage: -100 },
        (identifier) => {
          if (identifier.indexOf('CompressionWebpackPlugin') !== -1) {
            storeCounter += 1;
          }
        }
      );

      const stats = await compile(compiler);

      // Get cache for assets
      expect(getCounter).toBe(4);
      // Store cached assets
      expect(storeCounter).toBe(4);
      expect(getAssetsNameAndSize(stats)).toMatchSnapshot('assets');
      expect(getErrors(stats)).toMatchSnapshot('errors');
      expect(getWarnings(stats)).toMatchSnapshot('warnings');

      getCounter = 0;
      storeCounter = 0;

      const newStats = await compile(compiler);

      // Get cache for assets
      expect(getCounter).toBe(4);
      // No need to store, we got cached assets
      expect(storeCounter).toBe(0);
      expect(getAssetsNameAndSize(newStats)).toMatchSnapshot('assets');
      expect(getErrors(newStats)).toMatchSnapshot('errors');
      expect(getWarnings(newStats)).toMatchSnapshot('warnings');
    });
  });
}
