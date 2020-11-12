import CopyPluginWithAssetInfo from "./CopyPluginWithAssetInfo";

export default function loader() {
  const callback = this.async();

  const childCompiler = this._compilation.createChildCompiler(
    `preloader`,
    this.options
  );

  new CopyPluginWithAssetInfo().apply(childCompiler);

  childCompiler.runAsChild((error) => {
    if (error) {
      return callback(error);
    }

    return callback(null, "export default 1");
  });
}
