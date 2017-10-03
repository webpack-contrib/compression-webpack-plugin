/* eslint-disable */
import Plugin from '../src';
import webpack from './helpers/compiler';
import { assets } from './helpers/stats';

test('Plugin', () => {
  const config = { plugins: [ new Plugin() ] };

  return webpack('./fixture.js', config)
    .then((stats) => assets(stats))
    .then((assets) => {

      assets.forEach((asset) => {
        const { source, map } = asset

        if (Buffer.isBuffer(source)) {
          expect(source).toMatchSnapshot();
        }
      });
    })
    .catch((err) => err);
});
