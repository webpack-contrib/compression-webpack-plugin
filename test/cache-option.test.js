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

const cacheDir = findCacheDir({ name: 'compression-webpack-plugin' });
const otherCacheDir = findCacheDir({ name: 'other-cache-directory' });
const uniqueDirectory = findCacheDir({ name: 'unique-cache-directory' });

if (getCompiler.isWebpack4()) {
  describe('"cache" option', () => {
    beforeEach(() => {
      return Promise.all([
        cacache.rm.all(cacheDir),
        cacache.rm.all(otherCacheDir),
        cacache.rm.all(uniqueDirectory),
      ]);
    });

    afterEach(() =>
      Promise.all([cacache.rm.all(cacheDir), cacache.rm.all(otherCacheDir)])
    );

    it('matches snapshot for `false` value ({Boolean})', async () => {
      const compiler = getCompiler('./entry.js');

      new CompressionPlugin({ cache: false, minRatio: 1 }).apply(compiler);

      cacache.get = jest.fn(cacache.get);
      cacache.put = jest.fn(cacache.put);

      const stats = await compile(compiler);

      expect(getAssetsNameAndSize(stats)).toMatchSnapshot('assets');
      expect(getWarnings(stats)).toMatchSnapshot('errors');
      expect(getErrors(stats)).toMatchSnapshot('warnings');

      // Cache disabled so we don't run `get` or `put`
      expect(cacache.get.mock.calls.length).toBe(0);
      expect(cacache.put.mock.calls.length).toBe(0);

      const cacheEntriesList = await cacache.ls(cacheDir);
      const cacheKeys = Object.keys(cacheEntriesList);

      expect(cacheKeys.length).toBe(0);
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
          return uniqueDirectory;
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

      const cacheEntriesList = await cacache.ls(uniqueDirectory);

      const cacheKeys = Object.keys(cacheEntriesList);

      // Make sure that we cached files
      expect(cacheKeys.length).toBe(countAssets / 2);

      cacheKeys.forEach((cacheEntry) => {
        // eslint-disable-next-line no-new-func
        const cacheEntryOptions = new Function(
          `'use strict'\nreturn ${cacheEntry}`
        )();
        const basename = path.basename(cacheEntryOptions.filename);

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
        const basename = path.basename(cacheEntryOptions.filename);

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
  });
} else {
  describe('"cache" option', () => {
    beforeEach(() => {
      return del([path.resolve('node_modules/.cache/webpack')]);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should work when `cache` is `false`', async () => {
      const gzipSpy = jest.spyOn(zlib, 'gzip');
      const beforeCacheCompiler = getCompiler(
        './entry.js',
        {},
        { cache: false }
      );

      new CompressionPlugin().apply(beforeCacheCompiler);

      const stats = await compile(beforeCacheCompiler);

      expect(gzipSpy).toHaveBeenCalledTimes(4);
      expect(getAssetsNameAndSize(stats)).toMatchSnapshot('assets');
      expect(getWarnings(stats)).toMatchSnapshot('errors');
      expect(getErrors(stats)).toMatchSnapshot('warnings');

      gzipSpy.mockClear();

      await new Promise((resolve) => {
        beforeCacheCompiler.close(async () => {
          const afterCacheCompiler = getCompiler(
            './entry.js',
            {},
            { cache: false }
          );

          new CompressionPlugin().apply(afterCacheCompiler);

          const newStats = await compile(afterCacheCompiler);

          expect(gzipSpy).toHaveBeenCalledTimes(4);
          expect(getAssetsNameAndSize(newStats)).toMatchSnapshot('assets');
          expect(getWarnings(newStats)).toMatchSnapshot('errors');
          expect(getErrors(newStats)).toMatchSnapshot('warnings');

          gzipSpy.mockRestore();

          resolve();
        });
      });
    });

    it('should work when `cache` is `memory`', async () => {
      const gzipSpy = jest.spyOn(zlib, 'gzip');
      const compiler = getCompiler(
        './entry.js',
        {},
        { cache: { type: 'memory' } }
      );

      new CompressionPlugin().apply(compiler);

      const stats = await compile(compiler);

      expect(gzipSpy).toHaveBeenCalledTimes(4);
      expect(getAssetsNameAndSize(stats)).toMatchSnapshot('assets');
      expect(getWarnings(stats)).toMatchSnapshot('errors');
      expect(getErrors(stats)).toMatchSnapshot('warnings');

      gzipSpy.mockClear();

      await new Promise((resolve) => {
        compiler.close(async () => {
          const newStats = await compile(compiler);

          expect(gzipSpy).toHaveBeenCalledTimes(0);
          expect(getAssetsNameAndSize(newStats)).toMatchSnapshot('assets');
          expect(getWarnings(newStats)).toMatchSnapshot('errors');
          expect(getErrors(newStats)).toMatchSnapshot('warnings');

          gzipSpy.mockRestore();

          resolve();
        });
      });
    });

    it('should work when `cache` is `filesystem`', async () => {
      const gzipSpy = jest.spyOn(zlib, 'gzip');
      const beforeCacheCompiler = getCompiler(
        './entry.js',
        {},
        { cache: { type: 'filesystem' } }
      );

      new CompressionPlugin().apply(beforeCacheCompiler);

      const stats = await compile(beforeCacheCompiler);

      expect(gzipSpy).toHaveBeenCalledTimes(4);
      expect(getAssetsNameAndSize(stats)).toMatchSnapshot('assets');
      expect(getWarnings(stats)).toMatchSnapshot('errors');
      expect(getErrors(stats)).toMatchSnapshot('warnings');

      gzipSpy.mockClear();

      await new Promise((resolve) => {
        beforeCacheCompiler.close(async () => {
          const afterCacheCompiler = getCompiler(
            './entry.js',
            {},
            { cache: { type: 'filesystem' } }
          );

          new CompressionPlugin().apply(afterCacheCompiler);

          const newStats = await compile(afterCacheCompiler);

          expect(gzipSpy).toHaveBeenCalledTimes(0);
          expect(getAssetsNameAndSize(newStats)).toMatchSnapshot('assets');
          expect(getWarnings(newStats)).toMatchSnapshot('errors');
          expect(getErrors(newStats)).toMatchSnapshot('warnings');

          gzipSpy.mockRestore();

          resolve();
        });
      });
    });
  });
}
