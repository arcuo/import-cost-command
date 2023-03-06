import { describe, test } from "vitest";
import { createImportBuild } from "../src/esbuild";
import { getImportsInfo, Language } from "../src/importInfo";

const importTestStub = `import { parse as babelParse } from "@babel/parser";`;

describe("esbuild", () => {
  test("run build", async () => {
    const [importInfo, ...rest] = getImportsInfo(importTestStub, Language.TS);
    const results = await createImportBuild(
      importInfo!,
      __filename,
      Language.TS
    );
  });
});
