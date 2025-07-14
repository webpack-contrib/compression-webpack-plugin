import path from "node:path";

import { Volume, createFsFromVolume } from "memfs";
import webpack from "webpack";

/** @type {import("webpack").Configuration} Configuration */
/** @type {import("../../src/index.js")} EXPECTED_ANY */

/**
 * @param {string} fixture fixture
 * @param {Record<string, EXPECTED_ANY>} loaderOptions loader options
 * @param {Configuration} config extra configuration
 * @returns {Configuration} configuration
 */
export default function getCompiler(fixture, loaderOptions = {}, config = {}) {
  const fullConfig = {
    mode: "development",
    devtool: config.devtool || false,
    context: path.resolve(__dirname, "../fixtures"),
    entry: path.resolve(__dirname, "../fixtures", fixture),
    output: {
      path: path.resolve(__dirname, "../outputs"),
      filename: "[name].[chunkhash].js",
      chunkFilename: "[id].[name].[chunkhash].js",
    },
    module: {
      rules: [
        {
          test: /\.(png|jpg|gif|svg|txt)$/i,
          rules: [
            {
              loader: "file-loader",
              options: loaderOptions || {},
            },
          ],
        },
      ],
    },
    plugins: [],
    ...config,
  };

  const compiler = webpack(fullConfig);

  if (!config.outputFileSystem) {
    compiler.outputFileSystem = createFsFromVolume(new Volume());
  }

  return compiler;
}
