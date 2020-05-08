import path from 'path';

import webpack from 'webpack';
import { createFsFromVolume, Volume } from 'memfs';

export default function getCompiler(fixture, loaderOptions = {}, config = {}) {
  const fullConfig = {
    mode: 'development',
    devtool: config.devtool || false,
    context: path.resolve(__dirname, '../fixtures'),
    entry: path.resolve(__dirname, '../fixtures', fixture),
    output: {
      path: path.resolve(__dirname, '../outputs'),
      filename: '[name].[chunkhash].js',
      chunkFilename: '[id].[name].[chunkhash].js',
    },
    module: {
      rules: [
        {
          test: /\.(png|jpg|gif|svg)$/i,
          rules: [
            {
              loader: 'file-loader',
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
    const outputFileSystem = createFsFromVolume(new Volume());
    // Todo remove when we drop webpack@4 support
    outputFileSystem.join = path.join.bind(path);

    compiler.outputFileSystem = outputFileSystem;
  }

  return compiler;
}

getCompiler.isWebpack4 = () => webpack.version[0] === '4';
