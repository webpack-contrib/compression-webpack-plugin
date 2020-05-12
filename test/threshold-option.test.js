import CompressionPlugin from '../src/index';

import {
  compile,
  getAssetsNameAndSize,
  getCompiler,
  getErrors,
  getWarnings,
  removeCache,
} from './helpers/index';

describe('"threshold" option', () => {
  let compiler;

  beforeEach(() => {
    compiler = getCompiler('./entry.js');

    return removeCache();
  });

  it('matches snapshot for `0` value ({Number})', async () => {
    new CompressionPlugin({
      minRatio: 1,
      threshold: 0,
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getAssetsNameAndSize(stats)).toMatchSnapshot('assets');
    expect(getWarnings(stats)).toMatchSnapshot('errors');
    expect(getErrors(stats)).toMatchSnapshot('warnings');
  });

  it('matches snapshot for `8192` value ({Number})', async () => {
    new CompressionPlugin({
      minRatio: 1,
      threshold: 8192,
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getAssetsNameAndSize(stats)).toMatchSnapshot('assets');
    expect(getWarnings(stats)).toMatchSnapshot('errors');
    expect(getErrors(stats)).toMatchSnapshot('warnings');
  });
});
