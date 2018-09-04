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
    });
  });

  it('matches snapshot for `true` value ({Boolean})', () => {
    new Plugin({
      minRatio: 1,
      deleteOriginalAssets: true,
    }).apply(compiler);

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');
      expect(getAssetsInfo(stats.compilation.assets)).toMatchSnapshot('assets');
    });
  });

  it('matches snapshot for `false` value ({Boolean})', () => {
    new Plugin({
      minRatio: 1,
      deleteOriginalAssets: false,
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
