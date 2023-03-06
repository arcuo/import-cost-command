import * as esbuild from "esbuild";
import { compileImportString } from "./compileImportStrings";
import { Language } from "./importInfo";
import { getPackageRoot } from "./package";
import { ImportInfo } from "./types";

export async function createImportBuild<
  TBuildOptions extends esbuild.BuildOptions | undefined
>(
  importInfo: ImportInfo,
  currentFilePath: string,
  language: Language,
  esbuildOptions?: TBuildOptions
) {
  const importFileString = compileImportString(importInfo);
  const packageRoot = getPackageRoot(currentFilePath);

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

  const options = {
    ...defaultOptions,
    ...esbuildOptions,
  } as OptionType<typeof defaultOptions, TBuildOptions>;

  const results = await esbuild.build(options);

  return results;
}

type OptionType<Default, Optional = undefined> = Optional extends undefined ? Default : Optional extends object
? {
    [key in
      | keyof Optional
      | keyof Default]: key extends keyof Optional
      ? Optional[key]
      : key extends keyof Default
      ? (Default)[key]
      : never;
  }
: never;
