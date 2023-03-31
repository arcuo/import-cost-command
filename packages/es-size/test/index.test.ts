import { describe, expect, test } from "vitest";
import { getImportSize } from "../src";
import { PackageError } from "../src/package";

const importTestStub = `import { parse as babelParse } from "@babel/parser";`;
const filePath = __filename;

describe("Output methods", () => {
  describe("getImportSize", () => {
    test("Working example", async () => {
      const { size, gzip } = await getImportSize(importTestStub, filePath);
      expect(size).toBeDefined();
      expect(gzip).toBeDefined();
    });

    test("Throws error on no imports", async () => {
      expect(
        async () => await getImportSize("", filePath)
      ).rejects.toThrowError(new Error("No imports found"));
    });

    test("Throws error on no imports path cannot find node modules", async () => {
      try {
        expect(
          async () => await getImportSize(importTestStub, "/")
        ).rejects.toThrowError(
          new PackageError("Could not find node_modules folder")
        );

        expect(
          async () => await getImportSize(importTestStub, "../../")
        ).rejects.toThrowError();
      } catch {}
    });
  });
});
