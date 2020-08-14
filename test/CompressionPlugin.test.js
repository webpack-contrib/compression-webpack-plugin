import zlib from 'zlib';

import webpack from 'webpack';

import CompressionPlugin from '../src/index';

import {
  compile,
  CopyPluginWithAssetInfo,
  getAssetsNameAndSize,
  getCompiler,
  getErrors,
  getWarnings,
  removeCache,
} from './helpers/index';

jest.setTimeout(30000);

describe('CompressionPlugin', () => {
  beforeEach(() => {
    return removeCache();
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

    expect(getAssetsNameAndSize(stats)).toMatchSnapshot('assets');
    expect(getWarnings(stats)).toMatchSnapshot('errors');
    expect(getErrors(stats)).toMatchSnapshot('warnings');
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

    expect(getAssetsNameAndSize(stats, true)).toMatchSnapshot('assets');
    expect(getWarnings(stats)).toMatchSnapshot('errors');
    expect(getErrors(stats)).toMatchSnapshot('warnings');
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
    expect(getAssetsNameAndSize(stats, true)).toMatchSnapshot('assets');
    expect(getWarnings(stats)).toMatchSnapshot('errors');
    expect(getErrors(stats)).toMatchSnapshot('warnings');

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
      filename: '[path].gz',
    }).apply(compiler);
    new CompressionPlugin({
      algorithm: 'brotliCompress',
      filename: '[path].br',
    }).apply(compiler);
    new CompressionPlugin({
      algorithm: (input, options, callback) => {
        return callback(input);
      },
      filename: '[path].compress',
    }).apply(compiler);
    new CompressionPlugin({
      algorithm: (input, options, callback) => {
        return callback(input);
      },
      filename: '[path].custom?foo=bar#hash',
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getAssetsNameAndSize(stats, true)).toMatchSnapshot('assets');
    expect(getWarnings(stats)).toMatchSnapshot('errors');
    expect(getErrors(stats)).toMatchSnapshot('warnings');
  });

  it('should work in watch mode', async () => {
    const compiler = getCompiler('./entry.js');

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

    expect(getAssetsNameAndSize(stats)).toMatchSnapshot('assets');
    expect(getWarnings(stats)).toMatchSnapshot('errors');
    expect(getErrors(stats)).toMatchSnapshot('warnings');

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

      expect(getAssetsNameAndSize(newStats)).toMatchSnapshot('assets');
      expect(getWarnings(newStats)).toMatchSnapshot('errors');
      expect(getErrors(newStats)).toMatchSnapshot('warnings');

      resolve();
    });
  });
});
