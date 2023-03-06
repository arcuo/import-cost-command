import { describe, expect, test } from "vitest";
import {
  getNodeModulesFolderPath,
  getPackageFolder,
  getPackageVersion,
  PackageVersionError,
} from "../src/packageVersion";

describe("Test packageVersion functions", () => {
  describe("Test getNodeModulesFolderPath", () => {
    test("Get node_modules from this current file", () => {
      const dir = getNodeModulesFolderPath(__filename);
      if (dir) {
        const endPath = dir.split("/").slice(-4).join("/");
        expect(endPath).toBe(
          "import-cost-command/packages/es-size/node_modules"
        );
      }
    });

    test("Get node_modules in same folder as tested file", () => {
      const ezSizePath = __dirname + "/../package.json";
      const dir = getNodeModulesFolderPath(ezSizePath);
      if (dir) {
        const endPath = dir.split("/").slice(-4).join("/");
        expect(endPath).toBe(
          "import-cost-command/packages/es-size/node_modules"
        );
      }
    });

    test("Exceeding max iterations should throw PackageVersionError", () => {
      expect(() => getNodeModulesFolderPath(__filename, 0)).toThrowError(
        PackageVersionError
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
      ).toThrowError(PackageVersionError);
    });
  });

  describe("Test getPackageVersion", () => {
    test("Get package version from a file", () => {
      const packageVersion = getPackageVersion("@babel/parser", __filename);
      expect(packageVersion).toMatch(/7.21.\d+/);
    });
  });
});
