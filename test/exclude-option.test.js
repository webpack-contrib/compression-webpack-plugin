import Plugin from '../src/index';

import {
  cleanErrorStack,
  createCompiler,
  compile,
  getAssetsInfo,
} from './helpers';

describe('when applied with `exclude` option', () => {
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

  it('matches snapshot for a single `exclude` value ({RegExp})', () => {
    new Plugin({
      exclude: /\.svg(\?.*)?$/i,
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

  it('matches snapshot for multiple `exclude` values ({Array<RegExp>})', () => {
    new Plugin({
      exclude: [/\.svg(\?.*)?$/i, /\.png(\?.*)?$/i],
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
