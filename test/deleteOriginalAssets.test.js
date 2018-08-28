import Plugin from '../src/index';
import { cleanErrorStack, createCompiler, compile } from './helpers';

describe('when applied with `test` option', () => {
  let compiler;

  beforeEach(() => {
    compiler = createCompiler({
      entry: {
        js: `${__dirname}/fixtures/entry.js`,
      },
    });
  });

  it('matches snapshot for `true` value', () => {
    new Plugin({
      minRatio: 1,
      deleteOriginalAssets: true,
    }).apply(compiler);

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');
      expect(Object.keys(stats.compilation.assets).sort()).toMatchSnapshot('assets');
    });
  });

  it('matches snapshot for `false` value', () => {
    new Plugin({
      minRatio: 1,
      deleteOriginalAssets: false,
    }).apply(compiler);

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');
      expect(Object.keys(stats.compilation.assets).sort()).toMatchSnapshot('assets');
    });
  });
});
