import zlib from 'zlib';
import path from 'path';

import webpack from 'webpack';
import findCacheDir from 'find-cache-dir';
import cacache from 'cacache';
import WorkboxPlugin from 'workbox-webpack-plugin';

import Webpack4Cache from '../src/Webpack4Cache';
import CompressionPlugin from '../src/index';

import {
  compile,
  CopyPluginWithAssetInfo,
  ModifyExistingAsset,
  getAssetsNameAndSize,
  getCompiler,
  getErrors,
  getWarnings,
  removeCache,
} from './helpers/index';

const cacheDir1 = findCacheDir({ name: 'compression-webpack-plugin-cache-1' });
const cacheDir2 = findCacheDir({ name: 'compression-webpack-plugin-cache-2' });
const cacheDir3 = findCacheDir({ name: 'compression-webpack-plugin-cache-3' });
const cacheDir4 = findCacheDir({ name: 'compression-webpack-plugin-cache-4' });

describe('CompressionPlugin', () => {
  beforeAll(() => {
    return Promise.all([
      removeCache(),
      cacache.rm.all(cacheDir1),
      cacache.rm.all(cacheDir2),
      cacache.rm.all(cacheDir3),
      cacache.rm.all(cacheDir4),
    ]);
  });

  it('should work', async () => {
    const compiler = getCompiler(
      './entry.js',
      {},
      {
        output: {
          path: `${__dirname}/dist`,
          filename: '[name].js?var=[hash]',
          chunkFilename: '[id].[name].js?ver=[hash]',
        },
      }
    );

    new CompressionPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(getAssetsNameAndSize(stats, compiler)).toMatchSnapshot('assets');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
    expect(getErrors(stats)).toMatchSnapshot('errors');
  });

  it('should work with assets info', async () => {
    const compiler = getCompiler(
      './entry.js',
      {},
      {
        devtool: 'source-map',
        output: {
          path: `${__dirname}/dist`,
          filename: '[name].js?var=[hash]',
          chunkFilename: '[id].[name].js?ver=[hash]',
        },
      }
    );

    new CompressionPlugin().apply(compiler);
    new CopyPluginWithAssetInfo().apply(compiler);

    const stats = await compile(compiler);

    expect(getAssetsNameAndSize(stats, compiler)).toMatchSnapshot('assets');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
    expect(getErrors(stats)).toMatchSnapshot('errors');
  });

  it('should work child compilations', async () => {
    const gzipSpy = jest.spyOn(zlib, 'gzip');
    const compiler = getCompiler(
      './entry.js',
      {},
      {
        output: {
          path: `${__dirname}/dist`,
          filename: '[name].js?var=[hash]',
          chunkFilename: '[id].[name].js?ver=[hash]',
        },
        module: {
          rules: [
            {
              test: /number\.js$/i,
              rules: [
                {
                  loader: require.resolve(
                    './helpers/loader-with-child-compilation.js'
                  ),
                },
              ],
            },
            {
              test: /\.(png|jpg|gif|svg)$/i,
              rules: [
                {
                  loader: 'file-loader',
                },
              ],
            },
          ],
        },
      }
    );

    new CompressionPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(gzipSpy).toHaveBeenCalledTimes(5);
    expect(getAssetsNameAndSize(stats, compiler)).toMatchSnapshot('assets');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
    expect(getErrors(stats)).toMatchSnapshot('errors');

    gzipSpy.mockRestore();
  });

  it('should work with multiple plugins', async () => {
    const compiler = getCompiler(
      './entry.js',
      {},
      {
        output: {
          path: `${__dirname}/dist`,
          filename: '[name].js?var=[hash]',
          chunkFilename: '[id].[name].js?ver=[hash]',
        },
      }
    );

    new CompressionPlugin({
      algorithm: 'gzip',
      filename: '[path][base].gz',
    }).apply(compiler);
    new CompressionPlugin({
      algorithm: 'brotliCompress',
      filename: '[path][base].br',
    }).apply(compiler);
    new CompressionPlugin({
      minRatio: Infinity,
      algorithm: (input, options, callback) => {
        return callback(null, input);
      },
      filename: '[path][base].compress',
    }).apply(compiler);
    new CompressionPlugin({
      minRatio: Infinity,
      algorithm: (input, options, callback) => {
        return callback(null, input);
      },
      filename: '[path][base].custom?foo=bar#hash',
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getAssetsNameAndSize(stats, compiler)).toMatchSnapshot('assets');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
    expect(getErrors(stats)).toMatchSnapshot('errors');
  });

  it('should work and show compress assets in stats', async () => {
    const compiler = getCompiler(
      './entry.js',
      {},
      {
        stats: 'verbose',
        output: {
          path: `${__dirname}/dist`,
          filename: '[name].js',
          chunkFilename: '[id].[name].js',
        },
      }
    );

    new CompressionPlugin().apply(compiler);

    const stats = await compile(compiler);
    const stringStats = stats.toString({ relatedAssets: true });
    const printedCompressed = stringStats.match(/\[compressed]/g);

    expect(printedCompressed ? printedCompressed.length : 0).toBe(
      getCompiler.isWebpack4() ? 0 : 3
    );
    expect(getAssetsNameAndSize(stats, compiler)).toMatchSnapshot('assets');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
    expect(getErrors(stats)).toMatchSnapshot('errors');
  });

  it('should work and keep assets info', async () => {
    const compiler = getCompiler(
      './entry.js',
      {},
      {
        stats: 'verbose',
        output: {
          path: `${__dirname}/dist`,
          filename: '[name].[contenthash].js',
          chunkFilename: '[id].[name].[contenthash].js',
        },
      }
    );

    new CompressionPlugin().apply(compiler);

    const stats = await compile(compiler);

    for (const [, info] of stats.compilation.assetsInfo.entries()) {
      expect(info.immutable).toBe(true);
    }

    expect(getAssetsNameAndSize(stats, compiler)).toMatchSnapshot('assets');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
    expect(getErrors(stats)).toMatchSnapshot('errors');
  });

  it('should work and use memory cache without options in the "development" mode', async () => {
    const getCacheDirectorySpy = jest
      .spyOn(Webpack4Cache, 'getCacheDirectory')
      .mockImplementation(() => {
        return cacheDir1;
      });

    const compiler = getCompiler('./entry.js', {}, { mode: 'development' });

    new CompressionPlugin().apply(compiler);

    const stats = await compile(compiler);

    if (webpack.version[0] === '4') {
      expect(
        Object.keys(stats.compilation.assets).filter(
          (assetName) => stats.compilation.assets[assetName].emitted
        ).length
      ).toBe(7);
    } else {
      expect(stats.compilation.emittedAssets.size).toBe(7);
    }

    expect(getAssetsNameAndSize(stats, compiler)).toMatchSnapshot('assets');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
    expect(getErrors(stats)).toMatchSnapshot('errors');

    await new Promise(async (resolve) => {
      const newStats = await compile(compiler);

      if (webpack.version[0] === '4') {
        expect(
          Object.keys(newStats.compilation.assets).filter(
            (assetName) => newStats.compilation.assets[assetName].emitted
          ).length
        ).toBe(0);
      } else {
        expect(newStats.compilation.emittedAssets.size).toBe(0);
      }

      expect(getAssetsNameAndSize(newStats, compiler)).toMatchSnapshot(
        'assets'
      );
      expect(getWarnings(newStats)).toMatchSnapshot('errors');
      expect(getErrors(newStats)).toMatchSnapshot('warnings');

      getCacheDirectorySpy.mockRestore();

      resolve();
    });
  });

  it('should work and use memory cache when the "cache" option is "true"', async () => {
    const getCacheDirectorySpy = jest
      .spyOn(Webpack4Cache, 'getCacheDirectory')
      .mockImplementation(() => {
        return cacheDir2;
      });

    const compiler = getCompiler(
      './entry.js',
      {},
      {
        cache: true,
        output: {
          path: path.resolve(__dirname, './outputs'),
          filename: '[name].js',
          chunkFilename: '[id].js',
        },
      }
    );

    new CompressionPlugin().apply(compiler);

    const stats = await compile(compiler);

    if (webpack.version[0] === '4') {
      expect(
        Object.keys(stats.compilation.assets).filter(
          (assetName) => stats.compilation.assets[assetName].emitted
        ).length
      ).toBe(7);
    } else {
      expect(stats.compilation.emittedAssets.size).toBe(7);
    }

    expect(getAssetsNameAndSize(stats, compiler)).toMatchSnapshot('assets');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
    expect(getErrors(stats)).toMatchSnapshot('errors');

    await new Promise(async (resolve) => {
      const newStats = await compile(compiler);

      if (webpack.version[0] === '4') {
        expect(
          Object.keys(newStats.compilation.assets).filter(
            (assetName) => newStats.compilation.assets[assetName].emitted
          ).length
        ).toBe(0);
      } else {
        expect(newStats.compilation.emittedAssets.size).toBe(0);
      }

      expect(getAssetsNameAndSize(newStats, compiler)).toMatchSnapshot(
        'assets'
      );
      expect(getWarnings(newStats)).toMatchSnapshot('errors');
      expect(getErrors(newStats)).toMatchSnapshot('warnings');

      getCacheDirectorySpy.mockRestore();

      resolve();
    });
  });

  it('should work and use memory cache when the "cache" option is "true" and the asset has been changed', async () => {
    const getCacheDirectorySpy = jest
      .spyOn(Webpack4Cache, 'getCacheDirectory')
      .mockImplementation(() => {
        return cacheDir3;
      });

    const compiler = getCompiler(
      './entry.js',
      {},
      {
        cache: true,
        output: {
          path: path.resolve(__dirname, './outputs'),
          filename: '[name].js',
          chunkFilename: '[id].js',
        },
      }
    );

    new CompressionPlugin().apply(compiler);

    const stats = await compile(compiler);

    if (webpack.version[0] === '4') {
      expect(
        Object.keys(stats.compilation.assets).filter(
          (assetName) => stats.compilation.assets[assetName].emitted
        ).length
      ).toBe(7);
    } else {
      expect(stats.compilation.emittedAssets.size).toBe(7);
    }

    expect(getAssetsNameAndSize(stats, compiler)).toMatchSnapshot('assets');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
    expect(getErrors(stats)).toMatchSnapshot('errors');

    new ModifyExistingAsset({ name: 'main.js' }).apply(compiler);

    await new Promise(async (resolve) => {
      const newStats = await compile(compiler);

      if (webpack.version[0] === '4') {
        expect(
          Object.keys(newStats.compilation.assets).filter(
            (assetName) => newStats.compilation.assets[assetName].emitted
          ).length
        ).toBe(2);
      } else {
        expect(newStats.compilation.emittedAssets.size).toBe(2);
      }

      expect(getAssetsNameAndSize(newStats, compiler)).toMatchSnapshot(
        'assets'
      );
      expect(getWarnings(newStats)).toMatchSnapshot('errors');
      expect(getErrors(newStats)).toMatchSnapshot('warnings');

      getCacheDirectorySpy.mockRestore();

      resolve();
    });
  });

  it('should work and use memory cache when the "cache" option is "true" with multiple plugins', async () => {
    const getCacheDirectorySpy = jest
      .spyOn(Webpack4Cache, 'getCacheDirectory')
      .mockImplementation(() => {
        return cacheDir4;
      });

    const compiler = getCompiler(
      './entry.js',
      {},
      {
        cache: true,
        output: {
          path: path.resolve(__dirname, './outputs'),
          filename: '[name].js',
          chunkFilename: '[id].js',
        },
      }
    );

    new CompressionPlugin({
      filename: '[path][base].gz',
      algorithm: 'gzip',
    }).apply(compiler);
    new CompressionPlugin({
      filename: '[path][base].br',
      algorithm: 'brotliCompress',
    }).apply(compiler);
    new CompressionPlugin({
      minRatio: Infinity,
      algorithm: (input, options, callback) => {
        return callback(null, input);
      },
      filename: '[path][base].custom',
    }).apply(compiler);

    const stats = await compile(compiler);

    if (webpack.version[0] === '4') {
      expect(
        Object.keys(stats.compilation.assets).filter(
          (assetName) => stats.compilation.assets[assetName].emitted
        ).length
      ).toBe(14);
    } else {
      expect(stats.compilation.emittedAssets.size).toBe(14);
    }

    expect(getAssetsNameAndSize(stats, compiler)).toMatchSnapshot('assets');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
    expect(getErrors(stats)).toMatchSnapshot('errors');

    await new Promise(async (resolve) => {
      const newStats = await compile(compiler);

      if (webpack.version[0] === '4') {
        expect(
          Object.keys(newStats.compilation.assets).filter(
            (assetName) => newStats.compilation.assets[assetName].emitted
          ).length
        ).toBe(0);
      } else {
        expect(newStats.compilation.emittedAssets.size).toBe(0);
      }

      expect(getAssetsNameAndSize(newStats, compiler)).toMatchSnapshot(
        'assets'
      );
      expect(getWarnings(newStats)).toMatchSnapshot('errors');
      expect(getErrors(newStats)).toMatchSnapshot('warnings');

      getCacheDirectorySpy.mockRestore();

      resolve();
    });
  });

  it('should work and do not use memory cache when the "cache" option is "false"', async () => {
    const compiler = getCompiler(
      './entry.js',
      {
        name: '[name].[ext]',
      },
      {
        cache: false,
        output: {
          path: path.resolve(__dirname, './outputs'),
          filename: '[name].js',
          chunkFilename: '[id].[name].js',
        },
      }
    );

    new CompressionPlugin(
      webpack.version[0] === '4' ? { cache: false } : {}
    ).apply(compiler);

    const stats = await compile(compiler);

    if (webpack.version[0] === '4') {
      expect(
        Object.keys(stats.compilation.assets).filter(
          (assetName) => stats.compilation.assets[assetName].emitted
        ).length
      ).toBe(7);
    } else {
      expect(stats.compilation.emittedAssets.size).toBe(7);
    }

    expect(getAssetsNameAndSize(stats, compiler)).toMatchSnapshot('assets');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
    expect(getErrors(stats)).toMatchSnapshot('errors');

    await new Promise(async (resolve) => {
      const newStats = await compile(compiler);

      if (webpack.version[0] === '4') {
        expect(
          Object.keys(newStats.compilation.assets).filter(
            (assetName) => newStats.compilation.assets[assetName].emitted
          ).length
        ).toBe(7);
      } else {
        expect(newStats.compilation.emittedAssets.size).toBe(7);
      }

      expect(getAssetsNameAndSize(newStats, compiler)).toMatchSnapshot(
        'assets'
      );
      expect(getWarnings(newStats)).toMatchSnapshot('errors');
      expect(getErrors(newStats)).toMatchSnapshot('warnings');

      resolve();
    });
  });

  // TODO https://github.com/webpack-contrib/compression-webpack-plugin/issues/218
  it.skip('should work with "workbox-webpack-plugin" plugin ("GenerateSW")', async () => {
    const compiler = getCompiler(
      './entry.js',
      {},
      {
        output: {
          filename: '[name].js',
          chunkFilename: '[id].[name].js',
        },
      }
    );

    new WorkboxPlugin.GenerateSW().apply(compiler);
    new CompressionPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(getAssetsNameAndSize(stats, compiler)).toMatchSnapshot('assets');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
    expect(getErrors(stats)).toMatchSnapshot('errors');
  });

  // TODO https://github.com/webpack-contrib/compression-webpack-plugin/issues/218
  it.skip('should work with "workbox-webpack-plugin" plugin ("InjectManifest")', async () => {
    const compiler = getCompiler(
      './entry.js',
      {},
      {
        output: {
          filename: '[name].js',
          chunkFilename: '[id].[name].js',
        },
      }
    );

    new WorkboxPlugin.InjectManifest({
      swSrc: path.resolve(__dirname, './fixtures/sw.js'),
      swDest: 'sw.js',
      exclude: [/\.(gz|br)$/],
    }).apply(compiler);
    new CompressionPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(getAssetsNameAndSize(stats, compiler)).toMatchSnapshot('assets');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
    expect(getErrors(stats)).toMatchSnapshot('errors');
  });
});
