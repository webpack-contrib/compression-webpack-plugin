import Plugin from '../src';
import CJSPlugin from '../src/cjs';

describe('CJS', () => {
  it('should exported plugin', () => {
    expect(CJSPlugin).toEqual(Plugin);
  });
});
