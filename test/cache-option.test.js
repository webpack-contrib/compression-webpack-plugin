import path from 'path';
import cacache from 'cacache';
import findCacheDir from 'find-cache-dir';
import Plugin from '../src/index';
import { createCompiler, compile, cleanErrorStack } from './helpers';

const cacheDir = findCacheDir({ name: 'compression-webpack-plugin' });

describe('when applied with `cache` option', () => {
  let compiler;

  beforeEach(() => {
    compiler = createCompiler({
      entry: {
        js: `${__dirname}/fixtures/entry.js`,
      },
    });

    return Promise.all([
      cacache.rm.all(cacheDir),
    ]);
  });

  afterEach(() =>
    Promise.all([cacache.rm.all(cacheDir)]));

  it('matches snapshot for `false` value', () => {
    new Plugin({ cache: false, minRatio: 1 }).apply(compiler);

    cacache.get = jest.fn(cacache.get);
    cacache.put = jest.fn(cacache.put);

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');
      expect(Object.keys(stats.compilation.assets).sort()).toMatchSnapshot('assets');

      // Cache disabled so we don't run `get` or `put`
      expect(cacache.get.mock.calls.length).toBe(0);
      expect(cacache.put.mock.calls.length).toBe(0);

      return Promise.resolve()
        .then(() => cacache.ls(cacheDir))
        .then((cacheEntriesList) => {
          const cacheKeys = Object.keys(cacheEntriesList);

          expect(cacheKeys.length).toBe(0);
        });
    });
  });

  it('matches snapshot for `true` value', () => {
    new Plugin({ cache: true, minRatio: 1 }).apply(compiler);

    cacache.get = jest.fn(cacache.get);
    cacache.put = jest.fn(cacache.put);

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');
      expect(Object.keys(stats.compilation.assets).sort()).toMatchSnapshot('assets');

      const countAssets = Object.keys(stats.compilation.assets).length;

      // Try to found cached files, but we don't have their in cache
      expect(cacache.get.mock.calls.length).toBe(countAssets / 2);
      // Put files in cache
      expect(cacache.put.mock.calls.length).toBe(countAssets / 2);

      return (
        Promise.resolve()
          .then(() => cacache.ls(cacheDir))
          .then((cacheEntriesList) => {
            const cacheKeys = Object.keys(cacheEntriesList);

            // Make sure that we cached files
            expect(cacheKeys.length).toBe(countAssets / 2);

            cacheKeys.forEach((cacheEntry) => {
              // eslint-disable-next-line no-new-func
              const cacheEntryOptions = new Function(
                `'use strict'\nreturn ${cacheEntry}`,
              )();
              const basename = path.basename(cacheEntryOptions.path);

              expect([basename, cacheEntryOptions.hash]).toMatchSnapshot(
                basename,
              );
            });

            cacache.get.mockClear();
            cacache.put.mockClear();
          })
          // Run second compilation to ensure cached files will be taken from cache
          .then(() => compile(compiler))
          .then((newStats) => {
            const newErrors = newStats.compilation.errors.map(cleanErrorStack);
            const newWarnings = newStats.compilation.warnings.map(
              cleanErrorStack,
            );

            expect(newErrors).toMatchSnapshot('errors');
            expect(newWarnings).toMatchSnapshot('warnings');
            expect(Object.keys(newStats.compilation.assets).sort()).toMatchSnapshot('assets');

            const newCountAssets = Object.keys(newStats.compilation.assets)
              .length;

            // Now we have cached files so we get their and don't put
            expect(cacache.get.mock.calls.length).toBe(newCountAssets / 2);
            expect(cacache.put.mock.calls.length).toBe(0);
          })
      );
    });
  });
});
