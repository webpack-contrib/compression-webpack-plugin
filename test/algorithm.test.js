import Plugin from '../src/index';

import {
  compile,
  getAssetsNameAndSize,
  getCompiler,
  getErrors,
  getWarnings,
} from './helpers/index';

describe('when applied with `algorithm` option', () => {
  let compiler;

  beforeEach(() => {
    compiler = getCompiler('./entry.js');
  });

  it('matches snapshot for `unknown` value ({String})', () => {
    expect(() => {
      new Plugin({
        minRatio: 1,
        algorithm: 'unknown',
      }).apply(compiler);
    }).toThrowErrorMatchingSnapshot();
  });

  it('matches snapshot for `gzip` value ({String})', async () => {
    new Plugin({
      minRatio: 1,
      algorithm: 'gzip',
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getAssetsNameAndSize(stats)).toMatchSnapshot('assets');
    expect(getWarnings(stats)).toMatchSnapshot('errors');
    expect(getErrors(stats)).toMatchSnapshot('warnings');
  });

  it('matches snapshot for custom function ({Function})', async () => {
    new Plugin({
      minRatio: 1,
      algorithm(input, compressionOptions, callback) {
        expect(compressionOptions).toMatchSnapshot('compressionOptions');

        return callback(null, input);
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getAssetsNameAndSize(stats)).toMatchSnapshot('assets');
    expect(getWarnings(stats)).toMatchSnapshot('errors');
    expect(getErrors(stats)).toMatchSnapshot('warnings');
  });

  it('matches snapshot for custom function with error ({Function})', async () => {
    new Plugin({
      minRatio: 1,
      algorithm(input, compressionOptions, callback) {
        expect(compressionOptions).toMatchSnapshot('compressionOptions');

        return callback('Error', input);
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getAssetsNameAndSize(stats)).toMatchSnapshot('assets');
    expect(getWarnings(stats)).toMatchSnapshot('errors');
    expect(getErrors(stats)).toMatchSnapshot('warnings');
  });
});
