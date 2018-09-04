import Plugin from '../src/index';

import {
  cleanErrorStack,
  createCompiler,
  compile,
  getAssetsInfo,
} from './helpers';

describe('when applied with `compressionOptions` option', () => {
  let compiler;

  beforeEach(() => {
    compiler = createCompiler({
      entry: {
        js: `${__dirname}/fixtures/entry.js`,
      },
    });
  });

  it('matches snapshot without values', () => {
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

  it('matches snapshot for custom options ({Object})', () => {
    new Plugin({
      compressionOptions: {
        level: 1,
      },
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
