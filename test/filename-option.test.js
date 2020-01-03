import Plugin from '../src/index';

import {
  compile,
  getAssetsNameAndSize,
  getCompiler,
  getErrors,
  getWarnings,
} from './helpers/index';

describe('"filename" option', () => {
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

  it('matches snapshot for `[path].super-compressed.gz[query]` value ({String})', async () => {
    new Plugin({
      minRatio: 1,
      filename: '[path].super-compressed.gz[query]',
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getAssetsNameAndSize(stats)).toMatchSnapshot('assets');
    expect(getWarnings(stats)).toMatchSnapshot('errors');
    expect(getErrors(stats)).toMatchSnapshot('warnings');
  });

  it('matches snapshot for `[dir][name].super-compressed.gz[ext][query]` value ({String})', async () => {
    new Plugin({
      minRatio: 1,
      filename: '[dir][name].super-compressed.gz[ext][query]',
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getAssetsNameAndSize(stats)).toMatchSnapshot('assets');
    expect(getWarnings(stats)).toMatchSnapshot('errors');
    expect(getErrors(stats)).toMatchSnapshot('warnings');
  });

  it('matches snapshot for custom function ({Function})', async () => {
    new Plugin({
      minRatio: 1,
      filename(info) {
        return `${info.path}.gz${info.query}`;
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getAssetsNameAndSize(stats)).toMatchSnapshot('assets');
    expect(getWarnings(stats)).toMatchSnapshot('errors');
    expect(getErrors(stats)).toMatchSnapshot('warnings');
  });
});
