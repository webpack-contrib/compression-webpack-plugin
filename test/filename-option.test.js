import path from 'path';

import CompressionPlugin from '../src/index';

import {
  compile,
  getAssetsNameAndSize,
  getCompiler,
  getErrors,
  getWarnings,
  removeCache,
} from './helpers/index';

describe('"filename" option', () => {
  let compiler;

  beforeEach(() => {
    return removeCache();
  });

  it('show work', async () => {
    compiler = getCompiler(
      './entry.js',
      {},
      {
        output: {
          path: path.resolve(__dirname, './outputs'),
          filename: 'assets/scripts/[name].js?var=[hash]#hash',
          chunkFilename: 'assets/scripts/[id].[name].js?ver=[hash]#hash',
        },
      }
    );

    new CompressionPlugin({
      minRatio: 1,
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getAssetsNameAndSize(stats)).toMatchSnapshot('assets');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
    expect(getErrors(stats)).toMatchSnapshot('errors');
  });

  it('matches snapshot for `[path][base].super-compressed.gz[query][fragment]` value ({String})', async () => {
    compiler = getCompiler(
      './entry.js',
      {},
      {
        output: {
          path: path.resolve(__dirname, './outputs'),
          filename: 'assets/js/[name].js?var=[hash]#hash',
          chunkFilename: 'assets/js/[id].[name].js?ver=[hash]#hash',
        },
      }
    );

    new CompressionPlugin({
      minRatio: 1,
      filename: '[path][base].super-compressed.gz[query][fragment]',
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getAssetsNameAndSize(stats)).toMatchSnapshot('assets');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
    expect(getErrors(stats)).toMatchSnapshot('errors');
  });

  it('matches snapshot for `[name][ext].super-compressed.gz[query]` value ({String})', async () => {
    compiler = getCompiler(
      './entry.js',
      {},
      {
        output: {
          path: path.resolve(__dirname, './outputs'),
          filename: '[name].js?var=[hash]',
          chunkFilename: '[id].[name].js?ver=[hash]',
        },
      }
    );

    new CompressionPlugin({
      minRatio: 1,
      filename: '[name].super-compressed[ext].gz[query]',
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getAssetsNameAndSize(stats)).toMatchSnapshot('assets');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
    expect(getErrors(stats)).toMatchSnapshot('errors');
  });

  it('matches snapshot for custom function ({Function})', async () => {
    compiler = getCompiler(
      './entry.js',
      {},
      {
        output: {
          path: path.resolve(__dirname, './outputs'),
          filename: '[name].js?var=[hash]#hash',
          chunkFilename: '[id].[name].js?ver=[hash]#hash',
        },
      }
    );

    new CompressionPlugin({
      minRatio: 1,
      filename(info) {
        return `[name][ext].gz${info.query}`;
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getAssetsNameAndSize(stats)).toMatchSnapshot('assets');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
    expect(getErrors(stats)).toMatchSnapshot('errors');
  });
});
