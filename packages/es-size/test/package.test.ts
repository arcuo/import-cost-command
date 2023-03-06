import { describe, expect, test } from "vitest";
import {
  getPackageRoot,
  getPackageFolder,
  getPackageVersion,
  PackageError,
} from "../src/package";

describe("Test packageVersion functions", () => {
  describe("Test getPackageRoot", () => {
    test("Get package root from this current file", () => {
      const dir = getPackageRoot(__filename);
      if (dir) {
        const endPath = dir.split("/").slice(-3).join("/");
        expect(endPath).toBe(
          "import-cost-command/packages/es-size"
        );
      }
    });

    test("Get root if current file is in the root", () => {
      const ezSizePath = __dirname + "/../package.json";
      const dir = getPackageRoot(ezSizePath);
      if (dir) {
        const endPath = dir.split("/").slice(-3).join("/");
        expect(endPath).toBe(
          "import-cost-command/packages/es-size"
        );
      }
    });

    test("Exceeding max iterations should throw PackageVersionError", () => {
      expect(() => getPackageRoot(__filename, 0)).toThrowError(
        PackageError
      );
    });
  });

  describe("Test getPackageFolderFromNodeModules", () => {
    test("Get package folder from a file", () => {
      const packageFolder = getPackageFolder("@babel/parser", __filename);
      const endPath = packageFolder.split("/").slice(-6).join("/");
      expect(endPath).toBe(
        "import-cost-command/packages/es-size/node_modules/@babel/parser"
      );
    });

    test("Throw error if package cannot be found", () => {
      expect(() =>
        getPackageFolder("non-existent-package", __filename)
      ).toThrowError(PackageError);
    });
  });

  describe("Test getPackageVersion", () => {
    test("Get package version from a file", () => {
      const packageVersion = getPackageVersion("@babel/parser", __filename);
      expect(packageVersion).toMatch(/7.21.\d+/);
    });
  });
});
