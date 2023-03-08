import * as esbuild from "esbuild";
import { compileImportString } from "./compileImportStrings";
import { Language } from "./importInfo";
import { getPackageRoot } from "./package";
import { ImportInfo } from "./types";

/**
 * Creates an esbuild build for the given importInfo
 * @param importInfo The importInfo to build
 * @param currentFilePath The current file path. Used to set the resolveDir for esbuild by finding the root of the package.
 * @param language The language of the current file (ts | js)
 * @param esbuildOptions The esbuild options. Will be merged with the default options.
 *
 * @returns The esbuild build result. Checkout esbuild docs for more info.
 *
 * @param result.errors The errors from the build
 * @param result.warnings The warnings from the build
 * @param result.metafile The metafile from the build
 * @param result.outputFiles The output files from the build
 */
export async function createImportBuild<
  TBuildOptions extends esbuild.BuildOptions | undefined
>(
  importInfo: ImportInfo,
  currentFilePath: string,
  language: Language,
  options?: {
    esbuildOptions?: TBuildOptions;
    packageRoot?: string;
  }
) {
  const importFileString = compileImportString(importInfo);
  const packageRoot = options?.packageRoot ?? getPackageRoot(currentFilePath);

  const defaultOptions = {
    stdin: {
      contents: importFileString,
      sourcefile: "importing_file.js",
      loader: language === Language.TS ? "ts" : "js",
      resolveDir: packageRoot,
    },
    bundle: true,
    write: false,
    outdir: "out",
    treeShaking: true,
    minify: true,
    metafile: true,
  } as const;

  const BuildOptions = {
    ...defaultOptions,
    ...options?.esbuildOptions,
  } as OptionType<typeof defaultOptions, TBuildOptions>;

  const { errors, warnings, metafile, outputFiles } = await esbuild.build(
    BuildOptions
  );

  return { errors, warnings, metafile, outputFiles };
}

/** Dynamic typing for the esbuild output. Gives typesafety to the return type for the esbuild output */
type OptionType<Default, Optional = undefined> = Optional extends undefined
  ? Default
  : Optional extends object
  ? {
      [key in keyof Optional | keyof Default]: key extends keyof Optional
        ? Optional[key]
        : key extends keyof Default
        ? Default[key]
        : never;
    }
  : never;
