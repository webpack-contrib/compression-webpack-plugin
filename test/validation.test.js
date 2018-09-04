import CompressionPlugin from '../src';

it('validation', () => {
  /* eslint-disable no-new */
  expect(() => {
    new CompressionPlugin({ test: /foo/ });
  }).not.toThrow();

  expect(() => {
    new CompressionPlugin({ test: 'foo' });
  }).not.toThrow();

  expect(() => {
    new CompressionPlugin({ test: [/foo/, /bar/] });
  }).not.toThrow();

  expect(() => {
    new CompressionPlugin({ test: ['foo', 'bar'] });
  }).not.toThrow();

  expect(() => {
    new CompressionPlugin({ test: [/foo/, 'bar'] });
  }).not.toThrow();

  expect(() => {
    new CompressionPlugin({ test: true });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new CompressionPlugin({ test: [true] });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new CompressionPlugin({ test: [/foo/, 'foo', true] });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new CompressionPlugin({ include: 'foo' });
  }).not.toThrow();

  expect(() => {
    new CompressionPlugin({ include: [/foo/, /bar/] });
  }).not.toThrow();

  expect(() => {
    new CompressionPlugin({ include: ['foo', 'bar'] });
  }).not.toThrow();

  expect(() => {
    new CompressionPlugin({ include: [/foo/, 'bar'] });
  }).not.toThrow();

  expect(() => {
    new CompressionPlugin({ include: true });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new CompressionPlugin({ include: [true] });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new CompressionPlugin({ include: [/foo/, 'foo', true] });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new CompressionPlugin({ exclude: 'foo' });
  }).not.toThrow();

  expect(() => {
    new CompressionPlugin({ exclude: [/foo/, /bar/] });
  }).not.toThrow();

  expect(() => {
    new CompressionPlugin({ exclude: ['foo', 'bar'] });
  }).not.toThrow();

  expect(() => {
    new CompressionPlugin({ exclude: [/foo/, 'bar'] });
  }).not.toThrow();

  expect(() => {
    new CompressionPlugin({ exclude: true });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new CompressionPlugin({ exclude: [true] });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new CompressionPlugin({ exclude: [/foo/, 'foo', true] });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new CompressionPlugin({ cache: true });
  }).not.toThrow();

  expect(() => {
    new CompressionPlugin({ cache: '/path/to/cache' });
  }).not.toThrow();

  expect(() => {
    new CompressionPlugin({ cache: () => {} });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new CompressionPlugin({ filename: '[path].gz[query]' });
  }).not.toThrow();

  expect(() => {
    new CompressionPlugin({
      filename() {
        return 'test';
      },
    });
  }).not.toThrow();

  expect(() => {
    new CompressionPlugin({ filename: true });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new CompressionPlugin({ algorithm: 'gzip' });
  }).not.toThrow();

  expect(() => {
    new CompressionPlugin({
      algorithm(input, compressionOptions, callback) {
        return callback(input);
      },
    });
  }).not.toThrow();

  expect(() => {
    new CompressionPlugin({ algorithm: true });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new CompressionPlugin({ compressionOptions: { level: 1 } });
  }).not.toThrow();

  expect(() => {
    new CompressionPlugin({ compressionOptions: { unknown: 1 } });
  }).not.toThrow();

  expect(() => {
    new CompressionPlugin({ compressionOptions: '1024' });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new CompressionPlugin({ threshold: 1024 });
  }).not.toThrow();

  expect(() => {
    new CompressionPlugin({ threshold: '1024' });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new CompressionPlugin({ minRatio: 0.8 });
  }).not.toThrow();

  expect(() => {
    new CompressionPlugin({ minRatio: '0.8' });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new CompressionPlugin({ deleteOriginalAssets: true });
  }).not.toThrow();

  expect(() => {
    new CompressionPlugin({ deleteOriginalAssets: false });
  }).not.toThrow();

  expect(() => {
    new CompressionPlugin({ deleteOriginalAssets: 'true' });
  }).toThrowErrorMatchingSnapshot();
  /* eslint-enable no-new */
});
