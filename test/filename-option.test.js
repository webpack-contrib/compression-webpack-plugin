import Plugin from '../src/index';
import { cleanErrorStack, createCompiler, compile } from './helpers';

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

  it('matches snapshot for `{Function}` value', () => {
    new Plugin({
      minRatio: 1,
      filename(newAssetName) {
        return `path/to/my/${newAssetName}`;
      },
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
