import Plugin from '../src/index';

import {
  cleanErrorStack,
  createCompiler,
  compile,
  getAssetsInfo,
} from './helpers';

describe('when applied with `test` option', () => {
  let compiler;

  beforeEach(() => {
    compiler = createCompiler({
      entry: {
        js: `${__dirname}/fixtures/entry.js`,
      },
      output: {
        path: `${__dirname}/dist`,
        filename: '[name].js?var=[hash]',
        chunkFilename: '[id].[name].js?ver=[hash]',
      },
    });
  });

  it('matches snapshot with empty `test` value', () => {
    new Plugin({
      minRatio: 1,
    }).apply(compiler);

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');
      expect(getAssetsInfo(stats.compilation.assets)).toMatchSnapshot('assets');
    });
  });

  it('matches snapshot for a single `test` value ({RegExp})', () => {
    new Plugin({
      test: /\.(png|jpg|gif)$/i,
      minRatio: 1,
    }).apply(compiler);

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');
      expect(getAssetsInfo(stats.compilation.assets)).toMatchSnapshot('assets');
    });
  });

  it('matches snapshot for multiple `test` values ({Array<RegExp>})', () => {
    new Plugin({
      test: [/\.(png|jpg|gif)$/i, /\.svg/i],
      minRatio: 1,
    }).apply(compiler);

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');
      expect(getAssetsInfo(stats.compilation.assets)).toMatchSnapshot('assets');
    });
  });
});
