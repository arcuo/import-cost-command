import { describe, expect, expectTypeOf, test } from "vitest";
import { createImportBuild } from "../src/esbuild";
import { getImportsInfo, Language } from "../src/importInfo";
import { zipBytes } from "../src/zip";

const importTestStub = `import { parse as babelParse } from "@babel/parser";`;

describe("esbuild", () => {
  test("run build", async () => {
    const [importInfo, ...rest] = getImportsInfo(importTestStub, Language.TS);
    const results = await createImportBuild(
      importInfo!,
      __filename,
      Language.TS
    );

    expect(results.errors).toEqual([]);
    expect(results.warnings).toEqual([]);
    expect(results.metafile).toBeDefined();
    expect(results.outputFiles).toBeDefined();
    expect(results.metafile?.outputs["out.js"]).toBeDefined();
  });

  test("zip output bytes", async () => {
    const [importInfo, ...rest] = getImportsInfo(importTestStub, Language.TS);
    const results = await createImportBuild(
      importInfo!,
      __filename,
      Language.TS
    );

    const zippedBytes = zipBytes(results.outputFiles![0]!.contents);

    expect(zippedBytes).toBeDefined();
    expect(zippedBytes.buffer).toBeDefined();
    expect(zippedBytes.byteLength).toBeDefined();
    expect(zippedBytes.byteLength).lessThan(
      results.metafile!.outputs["out.js"]!.bytes
    );
    expectTypeOf(zippedBytes).toEqualTypeOf<{
      buffer: Buffer;
      byteLength: number;
    }>();
  });
});
