import CompressionPlugin from "../src/index";

import {
  compile,
  getAssetsNameAndSize,
  getCompiler,
  getErrors,
  getWarnings,
} from "./helpers/index";

describe('"threshold" option', () => {
  let compiler;

  beforeEach(() => {
    compiler = getCompiler("./entry.js");
  });

  it("matches snapshot for `0` value ({Number})", async () => {
    new CompressionPlugin({
      minRatio: 1,
      threshold: 0,
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getAssetsNameAndSize(stats, compiler)).toMatchSnapshot("assets");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });

  it("matches snapshot for `8192` value ({Number})", async () => {
    new CompressionPlugin({
      minRatio: 1,
      threshold: 8192,
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getAssetsNameAndSize(stats, compiler)).toMatchSnapshot("assets");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });

  it('should compress all assets including assets with "0" bytes original size', async () => {
    compiler = getCompiler("./empty.js");

    new CompressionPlugin({
      minRatio: Infinity,
      threshold: 0,
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getAssetsNameAndSize(stats, compiler)).toMatchSnapshot("assets");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });

  it('should compress all assets excluding assets with "0" bytes original size', async () => {
    compiler = getCompiler("./empty.js");

    new CompressionPlugin({
      minRatio: Number.MAX_SAFE_INTEGER,
      threshold: 0,
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getAssetsNameAndSize(stats, compiler)).toMatchSnapshot("assets");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });
});
