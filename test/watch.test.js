import MemoryFileSystem from 'memory-fs';
import webpack from 'webpack';

import Plugin from '../src/index';

import { getAssetsInfo } from './helpers';

const fs = require('fs');

describe('when in watch mode', () => {
  let compiler;

  let originalContent;

  beforeEach(() => {
    originalContent = fs.readFileSync(`${__dirname}/fixtures/async.js`);
    compiler = webpack({
      entry: {
        js: `${__dirname}/fixtures/entry.js`,
      },
      output: {
        path: `${__dirname}/dist`,
        filename: '[name].js',
      },
      mode: 'development',
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
    });
    compiler.outputFileSystem = new MemoryFileSystem();
  });

  afterEach(() => {
    fs.writeFileSync(`${__dirname}/fixtures/async.js`, originalContent);
  });

  it('matches shansphot', (done) => {
    new Plugin().apply(compiler);

    let prepare = true;

    const watcher = compiler.watch({}, (err, stats) => {
      if (err) done(err);

      expect(getAssetsInfo(stats.compilation.assets)).toMatchSnapshot('assets');

      if (prepare) {
        prepare = false;
        fs.writeFileSync(
          `${__dirname}/fixtures/async.js`,
          'console.log("Hello World")'
        );
      } else {
        watcher.close();
        done();
      }
    });
  });
});
