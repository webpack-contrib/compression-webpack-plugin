import Plugin from '../src';

describe('Errors', () => {
  test('Validation Error', () => {
    const plugin = () => new Plugin({ minRatio: 'false' });

    expect(plugin).toThrow();
    expect(plugin).toThrowErrorMatchingSnapshot();
  });
});
