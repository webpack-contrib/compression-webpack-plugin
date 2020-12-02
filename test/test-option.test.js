import CompressionPlugin from "../src/index";

import {
  compile,
  getAssetsNameAndSize,
  getCompiler,
  getErrors,
  getWarnings,
} from "./helpers/index";

describe('"test" option', () => {
  let compiler;

  beforeEach(() => {
    compiler = getCompiler(
      "./entry.js",
      {},
      {
        output: {
          path: `${__dirname}/dist`,
          filename: "[name].js?var=[hash]",
          chunkFilename: "[id].[name].js?ver=[hash]",
        },
      }
    );
  });

  it("matches snapshot with empty `test` value", async () => {
    new CompressionPlugin({
      minRatio: 1,
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getAssetsNameAndSize(stats, compiler)).toMatchSnapshot("assets");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });

  it("matches snapshot for a single `test` value ({RegExp})", async () => {
    new CompressionPlugin({
      test: /\.(png|jpg|gif)$/i,
      minRatio: 1,
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getAssetsNameAndSize(stats, compiler)).toMatchSnapshot("assets");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });

  it("matches snapshot for multiple `test` values ({Array<RegExp>})", async () => {
    new CompressionPlugin({
      test: [/\.(png|jpg|gif)$/i, /\.svg/i],
      minRatio: 1,
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getAssetsNameAndSize(stats, compiler)).toMatchSnapshot("assets");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });

  it("should work when no asset to compress ", async () => {
    new CompressionPlugin({
      test: /\.(unknown)$/i,
      minRatio: 1,
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getAssetsNameAndSize(stats, compiler)).toMatchSnapshot("assets");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });
});
