import * as fs from "fs";
import { dirname, join, parse, resolve } from "path";

/** Find package in node_modules and output version */
export function getPackageVersion(packageName: string) {}

export function getPackageFolderFromNodeModules(packageName: string) {}

export function getNodeModulesFolderPath(currentFileName: string) {
  let currentDir = dirname(currentFileName);
  const { root } = parse(currentDir);

  while (currentDir !== root) {
    if (fs.existsSync(join(currentDir, "node_modules"))) {
      return parse(currentDir);
    } else {
      currentDir = resolve(currentDir, "..");
    }
  }
}
