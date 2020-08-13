import { RawSource } from 'webpack-sources';

export default class CopyPluginWithAssetInfo {
  apply(compiler) {
    const plugin = { name: this.constructor.name };

    compiler.hooks.thisCompilation.tap(plugin, (compilation) => {
      compilation.hooks.additionalAssets.tap(plugin, () => {
        // eslint-disable-next-line no-param-reassign
        compilation.emitAsset('copied.js', new RawSource('Text'.repeat(100)), {
          copied: true,
        });
      });
    });
  }
}
