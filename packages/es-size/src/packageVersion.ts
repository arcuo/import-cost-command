import { existsSync } from "fs";
import { dirname, join, parse, resolve } from "path";

export class PackageVersionError extends Error {
  type = "PackageVersionError";
}

/** 
 * Find package in node_modules and output version
 * @param packageName The name of the package to find
 * @param currentFilePath The file path to start searching from
 * @param _packageFolder The package folder to search in. If not provided, will be found from currentFilePath
 */
export function getPackageVersion(
  packageName: string,
  currentFilePath: string,
  _packageFolder?: string
) {
  const packageFolder = _packageFolder ?? getPackageFolder(packageName, currentFilePath);
  const packageJsonPath = join(packageFolder, "package.json");
  const packageJson = require(packageJsonPath);
  return packageJson.version;
}

/** 
 * Get the package folder from a file inside the project
 * @param packageName The name of the package to find
 * @param currentFilePath The file path to start searching from
 * @param _nodeModulesPath The node_modules folder to search in. If not provided, will be found from currentFilePath
 */
export function getPackageFolder(packageName: string, currentFilePath: string, _nodeModulesPath?: string) {
  const nodeModulesPath = _nodeModulesPath ?? getNodeModulesFolderPath(currentFilePath);
  let currentDir = nodeModulesPath;

  packageName.split("/").forEach((packagePart) => {
    if (existsSync(join(currentDir, packagePart))) {
      currentDir = join(currentDir, packagePart);
    } else {
      throw new PackageVersionError(
        `Could not find package ${packageName} in node_modules`
      );
    }
  });

  return currentDir;
}

/** 
 * From a file inside a node project, find the node_modules folder for the project by iterating outwards from the file. 
 * @param filePath The file path to start searching from
 * @param maxIterations The maximum number of iterations to search for node_modules folder
*/
export function getNodeModulesFolderPath(filePath: string, maxIterations = 10) {
  let currentDir = dirname(filePath);
  const { root } = parse(currentDir);
  let iter = 1;

  while (currentDir !== root && iter < maxIterations) {
    if (existsSync(join(currentDir, "node_modules"))) {
      const path = parse(currentDir);
      return join(path.dir, path.base, "node_modules");
    } else {
      currentDir = resolve(currentDir, "..");
      iter++;
    }
  }

  throw new PackageVersionError("Could not find node_modules folder");
}
