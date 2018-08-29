import MemoryFileSystem from 'memory-fs'; // eslint-disable-line import/no-extraneous-dependencies
import webpack from 'webpack';

export function compile(compiler) {
  return new Promise((resolve, reject) => {
    // eslint-disable-line consistent-return
    compiler.run((err, stats) => {
      if (err) {
        return reject(err);
      }

      return resolve(stats);
    });
  });
}

export function createCompiler(options = {}) {
  const compiler = webpack(
    // eslint-disable-next-line multiline-ternary
    Array.isArray(options)
      ? // eslint-disable-next-line multiline-ternary
        options
      : {
          module: {
            rules: [
              {
                test: /\.(png|jpg|gif|svg)$/i,
                use: [
                  {
                    loader: 'file-loader',
                  },
                ],
              },
            ],
          },
          mode: 'production',
          bail: true,
          cache: false,
          entry: `${__dirname}/fixtures/entry.js`,
          optimization: {
            minimize: false,
          },
          output: {
            pathinfo: false,
            path: `${__dirname}/dist`,
            filename: '[name].[chunkhash].js',
            chunkFilename: '[id].[name].[chunkhash].js',
          },
          plugins: [],
          ...options,
        }
  );

  compiler.outputFileSystem = new MemoryFileSystem();

  return compiler;
}

export function removeCWD(str) {
  return str.split(`${process.cwd()}/`).join('');
}

export function cleanErrorStack(error) {
  return removeCWD(error.toString())
    .split('\n')
    .slice(0, 2)
    .join('\n');
}
