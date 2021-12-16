/// <reference types="node" />
export = CompressionPlugin;
/** @typedef {import("schema-utils/declarations/validate").Schema} Schema */
/** @typedef {import("webpack").Compiler} Compiler */
/** @typedef {import("webpack").WebpackPluginInstance} WebpackPluginInstance */
/** @typedef {import("webpack").Compilation} Compilation */
/** @typedef {import("webpack").sources.Source} Source */
/** @typedef {import("webpack").Asset} Asset */
/** @typedef {import("webpack").WebpackError} WebpackError */
/**
 * @template T
 * @typedef {T | { valueOf(): T }} WithImplicitCoercion
 */
/** @typedef {RegExp | string} Rule */
/** @typedef {Rule[] | Rule} Rules */
/**
 * @typedef {{ [key: string]: any }} CustomOptions
 */
/**
 * @template T
 * @typedef {T extends infer U ? U : CustomOptions} InferDefaultType
 */
/**
 * @template T
 * @typedef {InferDefaultType<T>} CompressionOptions
 */
/**
 * @template T
 * @callback AlgorithmFunction
 * @param {Buffer} input
 * @param {CompressionOptions<T>} options
 * @param {(error: Error | null | undefined, result: WithImplicitCoercion<ArrayBuffer | SharedArrayBuffer> | Uint8Array | ReadonlyArray<number> | WithImplicitCoercion<Uint8Array | ReadonlyArray<number> | string> | WithImplicitCoercion<string> | { [Symbol.toPrimitive](hint: 'string'): string }) => void} callback
 */
/**
 * @typedef {{[key: string]: any}} PathData
 */
/**
 * @typedef {string | ((fileData: PathData) => string)} Filename
 */
/**
 * @typedef {boolean | "keep-source-map"} DeleteOriginalAssets
 */
/**
 * @template T
 * @typedef {Object} BasePluginOptions
 * @property {Rules} [test]
 * @property {Rules} [include]
 * @property {Rules} [exclude]
 * @property {number} [threshold]
 * @property {number} [minRatio]
 * @property {DeleteOriginalAssets} [deleteOriginalAssets]
 * @property {Filename} [filename]
 */
/**
 * @typedef {import("zlib").ZlibOptions} ZlibOptions
 */
/**
 * @template T
 * @typedef {T extends ZlibOptions ? { algorithm?: string | AlgorithmFunction<T> | undefined, compressionOptions?: CompressionOptions<T> | undefined } : { algorithm: string | AlgorithmFunction<T>, compressionOptions?: CompressionOptions<T> | undefined }} DefinedDefaultAlgorithmAndOptions
 */
/**
 * @template T
 * @typedef {BasePluginOptions<T> & { algorithm: string | AlgorithmFunction<T>, compressionOptions: CompressionOptions<T>, threshold: number, minRatio: number, deleteOriginalAssets: DeleteOriginalAssets, filename: Filename }} InternalPluginOptions
 */
/**
 * @template [T=ZlibOptions]
 * @implements WebpackPluginInstance
 */
declare class CompressionPlugin<T = import("zlib").ZlibOptions>
  implements WebpackPluginInstance
{
  /**
   * @param {BasePluginOptions<T> & DefinedDefaultAlgorithmAndOptions<T>} [options]
   */
  constructor(
    options?:
      | (BasePluginOptions<T> & DefinedDefaultAlgorithmAndOptions<T>)
      | undefined
  );
  /**
   * @private
   * @type {InternalPluginOptions<T>}
   */
  private options;
  /**
   * @private
   * @type {AlgorithmFunction<T>}
   */
  private algorithm;
  /**
   * @private
   * @param {Buffer} input
   * @returns {Promise<Buffer>}
   */
  private runCompressionAlgorithm;
  /**
   * @private
   * @param {Compiler} compiler
   * @param {Compilation} compilation
   * @param {Record<string, Source>} assets
   * @returns {Promise<void>}
   */
  private compress;
  /**
   * @param {Compiler} compiler
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace CompressionPlugin {
  export {
    Schema,
    Compiler,
    WebpackPluginInstance,
    Compilation,
    Source,
    Asset,
    WebpackError,
    WithImplicitCoercion,
    Rule,
    Rules,
    CustomOptions,
    InferDefaultType,
    CompressionOptions,
    AlgorithmFunction,
    PathData,
    Filename,
    DeleteOriginalAssets,
    BasePluginOptions,
    ZlibOptions,
    DefinedDefaultAlgorithmAndOptions,
    InternalPluginOptions,
  };
}
type WebpackPluginInstance = import("webpack").WebpackPluginInstance;
type Compiler = import("webpack").Compiler;
type BasePluginOptions<T> = {
  test?: Rules | undefined;
  include?: Rules | undefined;
  exclude?: Rules | undefined;
  threshold?: number | undefined;
  minRatio?: number | undefined;
  deleteOriginalAssets?: DeleteOriginalAssets | undefined;
  filename?: Filename | undefined;
};
type DefinedDefaultAlgorithmAndOptions<T> = T extends ZlibOptions
  ? {
      algorithm?: string | AlgorithmFunction<T> | undefined;
      compressionOptions?: CompressionOptions<T> | undefined;
    }
  : {
      algorithm: string | AlgorithmFunction<T>;
      compressionOptions?: CompressionOptions<T> | undefined;
    };
type Schema = import("schema-utils/declarations/validate").Schema;
type Compilation = import("webpack").Compilation;
type Source = import("webpack").sources.Source;
type Asset = import("webpack").Asset;
type WebpackError = import("webpack").WebpackError;
type WithImplicitCoercion<T> =
  | T
  | {
      valueOf(): T;
    };
type Rule = RegExp | string;
type Rules = Rule[] | Rule;
type CustomOptions = {
  [key: string]: any;
};
type InferDefaultType<T> = T extends infer U ? U : CustomOptions;
type CompressionOptions<T> = InferDefaultType<T>;
type AlgorithmFunction<T> = (
  input: Buffer,
  options: CompressionOptions<T>,
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
) => any;
type PathData = {
  [key: string]: any;
};
type Filename = string | ((fileData: PathData) => string);
type DeleteOriginalAssets = boolean | "keep-source-map";
type ZlibOptions = import("zlib").ZlibOptions;
type InternalPluginOptions<T> = BasePluginOptions<T> & {
  algorithm: string | AlgorithmFunction<T>;
  compressionOptions: CompressionOptions<T>;
  threshold: number;
  minRatio: number;
  deleteOriginalAssets: DeleteOriginalAssets;
  filename: Filename;
};
