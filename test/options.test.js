/* eslint-disable */
import Plugin from '../src';
import webpack from './helpers/compiler';
import { assets } from './helpers/stats';

describe('options', () => {
  test('asset', () => {
    const config = { plugins: [ new Plugin() ] };

    return webpack('./fixture.js', config)
      .then((stats) => assets(stats, 2))
      .then((asset) => {
        const { source, map } = asset

        expect(source).toMatchSnapshot();
        expect(map).toMatchSnapshot();
      })
      .catch((err) => err);
  });
});
