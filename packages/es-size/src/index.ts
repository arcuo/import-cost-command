import { filesize } from "filesize";
import { createImportBuild } from "./esbuild";
import { getImportsInfo, Language } from "./importInfo";
import { zipBytes } from "./zip";

async function getImportSize(
  importString: string,
  filePath: string,
  options: { language: Language } = {
    language: Language.TS,
  }
) {
  const importInfo = getImportsInfo(importString, options.language)[0];

  if (!importInfo) {
    throw new Error("No imports found");
  }

  const buildResult = await createImportBuild(
    importInfo,
    filePath,
    options.language
  );

  console.log("buildResult:", buildResult);

  if (buildResult.errors.length) {
    throw new Error(buildResult.errors.join(", "));
  }

  if (!buildResult.outputFiles || !buildResult.outputFiles[0]) {
    throw new Error("Could not find build output");
  }

  const outputBytes = buildResult.outputFiles[0].contents;
  const gzip = zipBytes(outputBytes);

  const size = outputBytes.byteLength;
  const gzipSize = gzip.byteLength;

  return {
    size: filesize(size),
    gzip: filesize(gzipSize),
  };
}

export { getImportSize };
