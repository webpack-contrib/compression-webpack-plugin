<div align="center">
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200" src="https://webpack.js.org/assets/icon-square-big.svg">
  </a>
</div>

[![npm][npm]][npm-url]
[![node][node]][node-url]
[![tests][tests]][tests-url]
[![cover][cover]][cover-url]
[![discussion][discussion]][discussion-url]
[![size][size]][size-url]

# compression-webpack-plugin

Prepare compressed versions of assets to serve them with Content-Encoding.

## Getting Started

To begin, you'll need to install `compression-webpack-plugin`:

```console
npm install compression-webpack-plugin --save-dev
```

or

```console
yarn add -D compression-webpack-plugin
```

or

```console
pnpm add -D compression-webpack-plugin
```

Then add the plugin to your `webpack` config. For example:

**webpack.config.js**

```js
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = {
  plugins: [new CompressionPlugin()],
};
```

And run `webpack` via your preferred method.

## Options

- **[`test`](#test)**
- **[`include`](#include)**
- **[`exclude`](#exclude)**
- **[`algorithm`](#algorithm)**
- **[`compressionOptions`](#compressionoptions)**
- **[`threshold`](#threshold)**
- **[`minRatio`](#minratio)**
- **[`filename`](#filename)**
- **[`deleteOriginalAssets`](#deleteoriginalassets)**

### `test`

Type:

```ts
type test = string | RegExp | Array<string | RegExp>;
```

Default: `undefined`

Include all assets that pass test assertion.

**webpack.config.js**

```js
module.exports = {
  plugins: [
    new CompressionPlugin({
      test: /\.js(\?.*)?$/i,
    }),
  ],
};
```

### `include`

Type:

```ts
type include = string | RegExp | Array<string | RegExp>;
```

Default: `undefined`

Include all assets matching any of these conditions.

**webpack.config.js**

```js
module.exports = {
  plugins: [
    new CompressionPlugin({
      include: /\/includes/,
    }),
  ],
};
```

### `exclude`

Type:

```ts
type exclude = string | RegExp | Array<string | RegExp>;
```

Default: `undefined`

Exclude all assets matching any of these conditions.

**webpack.config.js**

```js
module.exports = {
  plugins: [
    new CompressionPlugin({
      exclude: /\/excludes/,
    }),
  ],
};
```

### `algorithm`

Type:

```ts
type algorithm =
  | string
  | ((
      input: Buffer,
      options: CompressionOptions,
      callback: (
        error: Error | null | undefined,
        result:
          | string
          | ArrayBuffer
          | SharedArrayBuffer
          | Uint8Array
          | readonly number[]
          | {
              valueOf(): ArrayBuffer | SharedArrayBuffer;
            }
          | {
              valueOf(): string | Uint8Array | readonly number[];
            }
          | {
              valueOf(): string;
            }
          | {
              [Symbol.toPrimitive](hint: "string"): string;
            }
      ) => void
    ) => any);
```

Default: `gzip`

The compression algorithm/function.

> **Note**
>
> If you use custom function for the `algorithm` option, the default value of the `compressionOptions` option is `{}`.

#### `string`

The algorithm is taken from [zlib](https://nodejs.org/api/zlib.html).

**webpack.config.js**

```js
module.exports = {
  plugins: [
    new CompressionPlugin({
      algorithm: "gzip",
    }),
  ],
};
```

#### `function`

Allow to specify a custom compression function.

**webpack.config.js**

```js
module.exports = {
  plugins: [
    new CompressionPlugin({
      algorithm(input, compressionOptions, callback) {
        return compressionFunction(input, compressionOptions, callback);
      },
    }),
  ],
};
```

### `compressionOptions`

Type:

```ts
type compressionOptions = {
  flush?: number;
  finishFlush?: number;
  chunkSize?: number;
  windowBits?: number;
  level?: number;
  memLevel?: number;
  strategy?: number;
  dictionary?: Buffer | TypedArray | DataView | ArrayBuffer;
  info?: boolean;
  maxOutputLength?: number;
};
```

Default: `{ level: 9 }`

Compression options for `algorithm`.

You can find all options here [zlib](https://nodejs.org/api/zlib.html#zlib_class_options).

> **Note**
>
> If you use custom function for the `algorithm` option, the default value is `{}`.

**webpack.config.js**

```js
module.exports = {
  plugins: [
    new CompressionPlugin({
      compressionOptions: { level: 1 },
    }),
  ],
};
```

### `threshold`

Type:

```ts
type threshold = number;
```

Default: `0`

Only assets bigger than this size are processed. In bytes.

**webpack.config.js**

```js
module.exports = {
  plugins: [
    new CompressionPlugin({
      threshold: 8192,
    }),
  ],
};
```

### `minRatio`

Type:

```ts
type minRatio = number;
```

Default: `0.8`

Only assets that compress better than this ratio are processed (`minRatio = Compressed Size / Original Size`).
Example: you have `image.png` file with 1024b size, compressed version of file has 768b size, so `minRatio` equal `0.75`.
In other words assets will be processed when the `Compressed Size / Original Size` value less `minRatio` value.

You can use `1` value to process assets that are smaller than the original.

Use a value of `Infinity` to process all assets even if they are larger than the original size or their original size is `0` bytes (useful when you are pre-zipping all assets for AWS).

Use a value of `Number.MAX_SAFE_INTEGER` to process all assets even if they are larger than the original size, excluding assets with their original size is `0` bytes.

**webpack.config.js**

```js
module.exports = {
  plugins: [
    new CompressionPlugin({
      // Compress all assets, including files with `0` bytes size
      // minRatio: Infinity

      // Compress all assets, excluding files with `0` bytes size
      // minRatio: Number.MAX_SAFE_INTEGER

      minRatio: 0.8,
    }),
  ],
};
```

### `filename`

Type:

```ts
type filename = string | ((pathdata: PathData) => string);
```

Default: `"[path][base].gz"`

The target asset filename.

#### `string`

For example we have `assets/images/image.png?foo=bar#hash`:

`[path]` is replaced with the directories to the original asset, included trailing `/` (`assets/images/`).

`[file]` is replaced with the path of original asset (`assets/images/image.png`).

`[base]` is replaced with the base (`[name]` + `[ext]`) of the original asset (`image.png`).

`[name]` is replaced with the name of the original asset (`image`).

`[ext]` is replaced with the extension of the original asset, included `.` (`.png`).

`[query]` is replaced with the query of the original asset, included `?` (`?foo=bar`).

`[fragment]` is replaced with the fragment (in the concept of URL it is called `hash`) of the original asset (`#hash`).

**webpack.config.js**

```js
module.exports = {
  plugins: [
    new CompressionPlugin({
      filename: "[path][base].gz",
    }),
  ],
};
```

#### `function`

**webpack.config.js**

```js
module.exports = {
  plugins: [
    new CompressionPlugin({
      filename(pathData) {
        // The `pathData` argument contains all placeholders - `path`/`name`/`ext`/etc
        // Available properties described above, for the `String` notation
        if (/\.svg$/.test(pathData.filename)) {
          return "assets/svg/[path][base].gz";
        }

        return "assets/js/[path][base].gz";
      },
    }),
  ],
};
```

### `deleteOriginalAssets`

Type:

```ts
type deleteOriginalAssets = boolean | "keep-source-map";
```

Default: `false`

Whether to delete the original assets or not.

**webpack.config.js**

```js
module.exports = {
  plugins: [
    new CompressionPlugin({
      deleteOriginalAssets: true,
    }),
  ],
};
```

To exclude sourcemaps from compression

```js
module.exports = {
  plugins: [
    new CompressionPlugin({
      exclude: /.map$/,
      deleteOriginalAssets: "keep-source-map",
    }),
  ],
};
```

## Examples

### Using Zopfli

Prepare compressed versions of assets using `zopfli` library.

> **Note**
>
> `@gfx/zopfli` require minimum `8` version of `node`.

To begin, you'll need to install `@gfx/zopfli`:

```console
$ npm install @gfx/zopfli --save-dev
```

**webpack.config.js**

```js
const zopfli = require("@gfx/zopfli");

module.exports = {
  plugins: [
    new CompressionPlugin({
      compressionOptions: {
        numiterations: 15,
      },
      algorithm(input, compressionOptions, callback) {
        return zopfli.gzip(input, compressionOptions, callback);
      },
    }),
  ],
};
```

### Using Brotli

[Brotli](https://en.wikipedia.org/wiki/Brotli) is a compression algorithm originally developed by Google, and offers compression superior to gzip.

Node 10.16.0 and later has [native support](https://nodejs.org/api/zlib.html#zlib_zlib_createbrotlicompress_options) for Brotli compression in its zlib module.

We can take advantage of this built-in support for Brotli in Node 10.16.0 and later by just passing in the appropriate `algorithm` to the CompressionPlugin:

**webpack.config.js**

```js
const zlib = require("zlib");

module.exports = {
  plugins: [
    new CompressionPlugin({
      filename: "[path][base].br",
      algorithm: "brotliCompress",
      test: /\.(js|css|html|svg)$/,
      compressionOptions: {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
        },
      },
      threshold: 10240,
      minRatio: 0.8,
      deleteOriginalAssets: false,
    }),
  ],
};
```

**Note** Brotli’s `BROTLI_PARAM_QUALITY` option is functionally equivalent to zlib’s `level` option.
You can find all Brotli’s options in [the relevant part of the zlib module documentation](https://nodejs.org/api/zlib.html#zlib_class_brotlioptions).

### Multiple compressed versions of assets for different algorithm

**webpack.config.js**

```js
const zlib = require("zlib");

module.exports = {
  plugins: [
    new CompressionPlugin({
      filename: "[path][base].gz",
      algorithm: "gzip",
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240,
      minRatio: 0.8,
    }),
    new CompressionPlugin({
      filename: "[path][base].br",
      algorithm: "brotliCompress",
      test: /\.(js|css|html|svg)$/,
      compressionOptions: {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
        },
      },
      threshold: 10240,
      minRatio: 0.8,
    }),
  ],
};
```

## Contributing

Please take a moment to read our contributing guidelines if you haven't yet done so.

[CONTRIBUTING](./.github/CONTRIBUTING.md)

## License

[MIT](./LICENSE)

[npm]: https://img.shields.io/npm/v/compression-webpack-plugin.svg
[npm-url]: https://npmjs.com/package/compression-webpack-plugin
[node]: https://img.shields.io/node/v/compression-webpack-plugin.svg
[node-url]: https://nodejs.org
[tests]: https://github.com/webpack-contrib/compression-webpack-plugin/workflows/compression-webpack-plugin/badge.svg
[tests-url]: https://github.com/webpack-contrib/compression-webpack-plugin/actions
[cover]: https://codecov.io/gh/webpack-contrib/compression-webpack-plugin/branch/master/graph/badge.svg
[cover-url]: https://codecov.io/gh/webpack-contrib/compression-webpack-plugin
[discussion]: https://img.shields.io/github/discussions/webpack/webpack
[discussion-url]: https://github.com/webpack/webpack/discussions
[size]: https://packagephobia.now.sh/badge?p=compression-webpack-plugin
[size-url]: https://packagephobia.now.sh/result?p=compression-webpack-plugin
