import Plugin from '../src/index';

import {
  compile,
  getAssetsNameAndSize,
  getCompiler,
  getErrors,
  getWarnings,
} from './helpers/index';

describe('CompressionPlugin', () => {
  let compiler;

  beforeEach(() => {
    compiler = getCompiler(
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
  });

  it('should works (without options)', async () => {
    new Plugin().apply(compiler);

    const stats = await compile(compiler);

    expect(getAssetsNameAndSize(stats)).toMatchSnapshot('assets');
    expect(getWarnings(stats)).toMatchSnapshot('errors');
    expect(getErrors(stats)).toMatchSnapshot('warnings');
  });
});
