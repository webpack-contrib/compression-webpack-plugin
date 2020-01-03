import Plugin from '../src/index';

import {
  compile,
  getAssetsNameAndSize,
  getCompiler,
  getErrors,
  getWarnings,
} from './helpers/index';

describe('when applied with `test` option', () => {
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

  it('matches snapshot with empty `test` value', async () => {
    new Plugin({
      minRatio: 1,
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getAssetsNameAndSize(stats)).toMatchSnapshot('assets');
    expect(getWarnings(stats)).toMatchSnapshot('errors');
    expect(getErrors(stats)).toMatchSnapshot('warnings');
  });

  it('matches snapshot for a single `test` value ({RegExp})', async () => {
    new Plugin({
      test: /\.(png|jpg|gif)$/i,
      minRatio: 1,
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getAssetsNameAndSize(stats)).toMatchSnapshot('assets');
    expect(getWarnings(stats)).toMatchSnapshot('errors');
    expect(getErrors(stats)).toMatchSnapshot('warnings');
  });

  it('matches snapshot for multiple `test` values ({Array<RegExp>})', async () => {
    new Plugin({
      test: [/\.(png|jpg|gif)$/i, /\.svg/i],
      minRatio: 1,
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getAssetsNameAndSize(stats)).toMatchSnapshot('assets');
    expect(getWarnings(stats)).toMatchSnapshot('errors');
    expect(getErrors(stats)).toMatchSnapshot('warnings');
  });
});
