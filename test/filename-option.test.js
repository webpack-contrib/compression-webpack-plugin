import Plugin from '../src/index';

import {
  cleanErrorStack,
  createCompiler,
  compile,
  getAssetsInfo,
} from './helpers';

describe('when applied with `function` option', () => {
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

  it('matches snapshot for `[path].super-compressed.gz[query]` value ({String})', () => {
    new Plugin({
      minRatio: 1,
      filename: '[path].super-compressed.gz[query]',
    }).apply(compiler);

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');
      expect(getAssetsInfo(stats.compilation.assets)).toMatchSnapshot('assets');
    });
  });

  it('matches snapshot for custom function ({Function})', () => {
    new Plugin({
      minRatio: 1,
      filename(info) {
        return `${info.path}.gz${info.query}`;
      },
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
