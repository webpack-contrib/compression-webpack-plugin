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

describe('"overwriteOriginalAssets" option', () => {
  let compiler;

  beforeEach(() => {
    compiler = getCompiler('./entry.js');

    return removeCache();
  });

  it('matches snapshot for `true` value ({Boolean})', async () => {
    compiler = getCompiler(
      './entry.js',
      {},
      {
        output: {
          path: path.resolve(__dirname, './outputs1'),
        },
      }
    );

    new CompressionPlugin({
      filename: '[path][name][ext]',
      overwriteOriginalAssets: true,
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getAssetsNameAndSize(stats)).toMatchSnapshot('assets');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
    expect(getErrors(stats)).toMatchSnapshot('errors');
  });

  it('matches snapshot for `false` value ({Boolean})', async () => {
    compiler = getCompiler(
      './entry.js',
      {},
      {
        output: {
          path: path.resolve(__dirname, './outputs1'),
        },
      }
    );

    new CompressionPlugin({
      filename: '[path][name][ext]',
      overwriteOriginalAssets: false,
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getAssetsNameAndSize(stats)).toMatchSnapshot('assets');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
    expect(getErrors(stats)).toMatchSnapshot('errors');
  });

  it('matches snapshot for not specify value', async () => {
    compiler = getCompiler(
      './entry.js',
      {},
      {
        output: {
          path: path.resolve(__dirname, './outputs1'),
        },
      }
    );

    new CompressionPlugin({
      filename: '[path][name][ext]',
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getAssetsNameAndSize(stats)).toMatchSnapshot('assets');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
    expect(getErrors(stats)).toMatchSnapshot('errors');
  });
});
