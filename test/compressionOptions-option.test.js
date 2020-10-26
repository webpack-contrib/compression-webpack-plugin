import CompressionPlugin from '../src/index';

import {
  compile,
  getAssetsNameAndSize,
  getCompiler,
  getErrors,
  getWarnings,
  removeCache,
} from './helpers/index';

describe('"compressionOptions" option', () => {
  let compiler;

  beforeEach(() => {
    compiler = getCompiler('./entry.js');

    return removeCache();
  });

  it('matches snapshot without values', async () => {
    new CompressionPlugin({
      minRatio: 1,
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getAssetsNameAndSize(stats)).toMatchSnapshot('assets');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
    expect(getErrors(stats)).toMatchSnapshot('errors');
  });

  it('matches snapshot for custom options ({Object})', async () => {
    new CompressionPlugin({
      compressionOptions: {
        level: 9,
      },
      minRatio: 1,
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getAssetsNameAndSize(stats)).toMatchSnapshot('assets');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
    expect(getErrors(stats)).toMatchSnapshot('errors');
  });

  it('set default compression level to maximum for gzip', async () => {
    const compressionPlugin = new CompressionPlugin({
      algorithm: 'gzip',
    });

    expect(compressionPlugin).toHaveProperty('options.compressionOptions', {
      level: 9,
    });
  });

  it('set default compression level to maximum for deflate', async () => {
    const compressionPlugin = new CompressionPlugin({
      algorithm: 'deflate',
    });

    expect(compressionPlugin).toHaveProperty('options.compressionOptions', {
      level: 9,
    });
  });

  it('set default compression level to maximum for deflateRaw', async () => {
    const compressionPlugin = new CompressionPlugin({
      algorithm: 'deflateRaw',
    });

    expect(compressionPlugin).toHaveProperty('options.compressionOptions', {
      level: 9,
    });
  });

  it('set default compression level to maximum for brotli', async () => {
    const compressionPlugin = new CompressionPlugin({
      algorithm: 'brotliCompress',
    });

    expect(compressionPlugin).toHaveProperty('options.compressionOptions', {
      params: { 1: 11 },
    });
  });
});
