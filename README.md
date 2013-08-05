# compression plugin for webpack

## Usage

``` javascript
var CompressionPlugin = require("compression-webpack-plugin");
module.exports = {
	plugins: [
		new CompressionPlugin({
			asset: "{file}.gz",
			algorithm: "gzip",
			regExp: /\.js$|\.html$/,
			threshold: 10240,
			minRatio: 0.8
		})
	]
}
```

Arguments:

* `asset`: The target asset name. `{file}` is replaced with the original asset. Defaults to `"{file}.gz"`.
* `algorithm`: Can be a `function(buf, callback)` or a string. For a string the algorithm is tacken from `zlib`. Defaults to `"gzip"`.
* `regExp`: All assets matching this RegExp are processed. Defaults to every asset.
* `threshold`: Only assets bigger than this size are processed. In bytes. Defaults to `0`.
* `minRatio`: Only assets that compress better that this ratio are processed. Defaults to `0.8`.

## License

MIT (http://www.opensource.org/licenses/mit-license.php)