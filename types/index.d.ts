/// <reference types="node" />
export default CompressionPlugin;
export type Schema = import("schema-utils/declarations/validate").Schema;
export type Compiler = import("webpack").Compiler;
export type WebpackPluginInstance = import("webpack").WebpackPluginInstance;
export type Compilation = import("webpack").Compilation;
export type Source = import("webpack").sources.Source;
export type Asset = import("webpack").Asset;
export type WebpackError = import("webpack").WebpackError;
export type WithImplicitCoercion<T> =
  | T
  | {
      valueOf(): T;
    };
export type Rule = RegExp | string;
export type Rules = Rule[] | Rule;
export type CustomOptions = {
  [key: string]: any;
};
export type InferDefaultType<T> = T extends infer U ? U : CustomOptions;
export type CompressionOptions<T> = InferDefaultType<T>;
export type AlgorithmFunction<T> = (
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
export type PathData = {
  [key: string]: any;
};
export type Filename = string | ((fileData: PathData) => string);
export type DeleteOriginalAssets = boolean | "keep-source-map";
export type BasePluginOptions<T> = {
  test?: Rules | undefined;
  include?: Rules | undefined;
  exclude?: Rules | undefined;
  algorithm?: string | AlgorithmFunction<T> | undefined;
  compressionOptions?: InferDefaultType<T> | undefined;
  threshold?: number | undefined;
  minRatio?: number | undefined;
  deleteOriginalAssets?: DeleteOriginalAssets | undefined;
  filename?: Filename | undefined;
};
export type InternalPluginOptions<T> = BasePluginOptions<T> & {
  compressionOptions: CompressionOptions<T>;
  threshold: number;
  minRatio: number;
  deleteOriginalAssets: DeleteOriginalAssets;
  filename: Filename;
};
export type ZlibOptions = import("zlib").ZlibOptions;
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
 * @property {string | AlgorithmFunction<T>} [algorithm]
 * @property {CompressionOptions<T>} [compressionOptions]
 * @property {number} [threshold]
 * @property {number} [minRatio]
 * @property {DeleteOriginalAssets} [deleteOriginalAssets]
 * @property {Filename} [filename]
 */
/**
 * @template T
 * @typedef {BasePluginOptions<T> & { compressionOptions: CompressionOptions<T>, threshold: number, minRatio: number, deleteOriginalAssets: DeleteOriginalAssets, filename: Filename }} InternalPluginOptions
 */
/**
 * @typedef {import("zlib").ZlibOptions} ZlibOptions
 */
/**
 * @template [T=ZlibOptions]
 * @implements WebpackPluginInstance
 */
declare class CompressionPlugin<T = import("zlib").ZlibOptions>
  implements WebpackPluginInstance
{
  /**
   * @param {BasePluginOptions<T>} [options]
   */
  constructor(options?: BasePluginOptions<T> | undefined);
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
