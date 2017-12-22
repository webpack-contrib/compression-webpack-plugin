# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="1.1.3"></a>
## [1.1.3](https://github.com/webpack-contrib/compression-webpack-plugin/compare/v1.1.2...v1.1.3) (2017-12-22)


### Bug Fixes

* `cache` behaviour ([#91](https://github.com/webpack-contrib/compression-webpack-plugin/issues/91)) ([9791044](https://github.com/webpack-contrib/compression-webpack-plugin/commit/9791044))



<a name="1.1.2"></a>
## [1.1.2](https://github.com/webpack-contrib/compression-webpack-plugin/compare/v1.1.1...v1.1.2) (2017-12-14)


### Bug Fixes

* `text/include/exclude` option behaviour ([#88](https://github.com/webpack-contrib/compression-webpack-plugin/issues/88)) ([1d0a840](https://github.com/webpack-contrib/compression-webpack-plugin/commit/1d0a840))



<a name="1.1.1"></a>
## [1.1.1](https://github.com/webpack-contrib/compression-webpack-plugin/compare/v1.1.0...v1.1.1) (2017-12-14)


### Bug Fixes

* **index:** don't use `JSON.stringify()` to serialize the `cache` data (`options.cache`) ([#87](https://github.com/webpack-contrib/compression-webpack-plugin/issues/87)) ([0d22741](https://github.com/webpack-contrib/compression-webpack-plugin/commit/0d22741))



<a name="1.1.0"></a>
# [1.1.0](https://github.com/webpack-contrib/compression-webpack-plugin/compare/v1.0.1...v1.1.0) (2017-12-14)


### Features

* add `cache` option (`options.cache`) ([#86](https://github.com/webpack-contrib/compression-webpack-plugin/issues/86)) ([49a8a77](https://github.com/webpack-contrib/compression-webpack-plugin/commit/49a8a77))
* add `include` and `exclude` options (`options.include|options.exclude`) ([#82](https://github.com/webpack-contrib/compression-webpack-plugin/issues/82)) ([1ce3024](https://github.com/webpack-contrib/compression-webpack-plugin/commit/1ce3024))



<a name="1.0.1"></a>
## [1.0.1](https://github.com/webpack-contrib/compression-webpack-plugin/compare/v1.0.0...v1.0.1) (2017-09-29)


### Code Refactoring

* Use emit event instead of this-compilation ([#71](https://github.com/webpack-contrib/compression-webpack-plugin/pull/71)) ([9ebc852](https://github.com/webpack-contrib/compression-webpack-plugin/commit/9ebc852))


<a name="1.0.0"></a>
# [1.0.0](https://github.com/webpack-contrib/compression-webpack-plugin/compare/v1.0.0-beta.1...v1.0.0) (2017-07-15)

### Code Refactoring

* apply webpack-defaults ([#54](https://github.com/webpack-contrib/compression-webpack-plugin/issues/54)) ([f6f8c6c](https://github.com/webpack-contrib/compression-webpack-plugin/commit/f6f8c6c))


### BREAKING CHANGES

* Enforces `peerDependencies` of `"webpack": ">= 3.0.0-rc.0 || ^3.0.0"`.
* Enforces `engines` of `"node": ">=4.3.0 < 5.0.0 || >= 5.10`
* Remove loose dependency on Node Zopfli, which has been extracted to it's own plugin https://github.com/webpack-contrib/zopfli-webpack-plugin

Migration:

- `npm i -D zopfli-webpack-plugin`
- The Zopfli API has remained the same, those who were using the Zopfli option in this plugin should just need to switch plugins.


<a name="1.0.0-beta.1"></a>
# [1.0.0-beta.1](https://github.com/webpack-contrib/compression-webpack-plugin/compare/v1.0.0-beta.0...v1.0.0-beta.1) (2017-07-03)


### Code Refactoring

* Drops optional Zopfli dependency ([#65](https://github.com/webpack-contrib/compression-webpack-plugin/issues/65)) ([328048a](https://github.com/webpack-contrib/compression-webpack-plugin/commit/328048a))


### BREAKING CHANGES

* The optional dependency for Zopfli was causing issues in consumers CI / CD chains, this option has now been removed.

MIGRATION: Zopfli is now in it's own plugin the options have remained the same. For those using the Zopfli option in `compression-webpack-plugin` swap it out for `https://github.com/webpack-contrib/zopfli-webpack-plugin`



<a name="1.0.0-beta.0"></a>
# [1.0.0-beta.0](https://github.com/webpack-contrib/compression-webpack-plugin/compare/v0.4.0...v1.0.0-beta.0) (2017-06-24)


### Code Refactoring

* apply webpack-defaults ([#54](https://github.com/webpack-contrib/compression-webpack-plugin/issues/54)) ([f6f8c6c](https://github.com/webpack-contrib/compression-webpack-plugin/commit/f6f8c6c))


### BREAKING CHANGES

* Enforces `peerDependencies` of `"webpack": ">= 3.0.0-rc.0 || ^3.0.0"`.
* Enforces `engines` of `"node": ">=4.3.0 < 5.0.0 || >= 5.10`
* Remove loose dependency on Node Zopfli, which has been extracted to it's own plugin https://github.com/webpack-contrib/zopfli-webpack-plugin

Migration:

- `npm i -D zopfli-webpack-plugin`
- The Zopfli API has remained the same, those who were using the Zopfli option in this plugin should just need to switch plugins.



<a name="0.4.0"></a>
# [0.4.0](https://github.com/webpack/compression-webpack-plugin/compare/v0.3.2...v0.4.0) (2017-04-08)


### Features

* add option to change the filename ([#51](https://github.com/webpack/compression-webpack-plugin/issues/51)) ([fb7bd81](https://github.com/webpack/compression-webpack-plugin/commit/fb7bd81))
* add option to delete original assets ([#44](https://github.com/webpack/compression-webpack-plugin/issues/44)) ([24f15f2](https://github.com/webpack/compression-webpack-plugin/commit/24f15f2))



<a name="0.3.2"></a>
## 0.3.2 (2016-09-13)


### Chores

* Update node-zopfli version ([2d3dd44](https://github.com/webpack-contrib/compression-webpack-plugin/commit/2d3dd44))


<a name="0.3.1"></a>
## 0.3.1 (2016-03-26)


### Bug Fixes

* TypeError Invalid non-strig/buffer chunk ([53ec8a9](https://github.com/webpack/compression-webpack-plugin/commit/53ec8a9))

<a name="0.3.0"></a>
## 0.3.0 (2016-01-23)


### Bug Fixes

* Correct zopfli options ([1f3b595](https://github.com/webpack/compression-webpack-plugin/commit/1f3b595))
* plugin options syntax ([437bdff](https://github.com/webpack/compression-webpack-plugin/commit/437bdff))

### Features

* Add compression level option ([9d05172](https://github.com/webpack/compression-webpack-plugin/commit/9d05172))
* Add node-zopfli option ([2c22b1c](https://github.com/webpack/compression-webpack-plugin/commit/2c22b1c))
* Permit {path} and {query} in asset name ([12d167c](https://github.com/webpack/compression-webpack-plugin/commit/12d167c))

<a name="0.2.0"></a>
## 0.2.0 (2015-04-08)


### Features

* use webpack RawSource ([3c85a2b](https://github.com/webpack/compression-webpack-plugin/commit/3c85a2b))


<a name="0.1.2"></a>
## 0.1.2 (2015-04-08)


### Bug Fixes

* Double compression on worker-loader bundles ([7ce2b32](https://github.com/webpack/compression-webpack-plugin/commit/7ce2b32))
* Remove unneeded module.exports ([6f4e60d](https://github.com/webpack/compression-webpack-plugin/commit/6f4e60d))
