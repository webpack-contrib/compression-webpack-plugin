import CompressionPlugin from "../src/index";

import {
  compile,
  getAssetsNameAndSize,
  getCompiler,
  getErrors,
  getWarnings,
} from "./helpers/index";

describe('"include" option', () => {
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

  it("matches snapshot for a single `include` value ({RegExp})", async () => {
    new CompressionPlugin({
      include: /\.js(\?.*)?$/i,
      minRatio: 1,
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getAssetsNameAndSize(stats, compiler)).toMatchSnapshot("assets");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });

  it("matches snapshot for multiple `include` values ({Array<RegExp>})", async () => {
    new CompressionPlugin({
      include: [/\.js(\?.*)?$/i, /\.svg(\?.*)?$/i],
      minRatio: 1,
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getAssetsNameAndSize(stats, compiler)).toMatchSnapshot("assets");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });
});
