import { describe, expect, test } from "vitest";
import { getPackageInfoFromString } from "../src/parse";

const pkgName = "testPackage";

const importStatements = [
  [
    `import { parse } from '${pkgName}'`,
    `import {parse} from '${pkgName}';\nconsole.log({parse});`,
  ], // One named import
  [
    `import { parse, getPackageInfoFromString } from '${pkgName}'`,
    `import {getPackageInfoFromString, parse} from '${pkgName}';\nconsole.log({getPackageInfoFromString, parse});`,
  ], // Multiple named imports
  [
    `import * as ${pkgName} from '${pkgName}'`,
    `import * as ${pkgName} from '${pkgName}';\nconsole.log(${pkgName});`,
  ], // Namespace import
  [
    `import * as ${pkgName}2 from '${pkgName}'`,
    `import * as ${pkgName}2 from '${pkgName}';\nconsole.log(${pkgName}2);`,
  ], // Namespace import with alias
  [
    `import ${pkgName} from '${pkgName}'`,
    `import ${pkgName} from '${pkgName}';\nconsole.log(${pkgName});`,
  ], // Default import
  [
    `import ${pkgName}2 from '${pkgName}'`,
    `import ${pkgName}2 from '${pkgName}';\nconsole.log(${pkgName}2);`,
  ], // Default import with alias
  [
    `import ${pkgName}, { parse } from '${pkgName}'`,
    `import ${pkgName}, {parse} from '${pkgName}';\nconsole.log(${pkgName}, {parse});`,
  ], // Default and named imports
  [
    `import ${pkgName}, * as ${pkgName}Rest from '${pkgName}'`,
    `import ${pkgName}, * as ${pkgName}Rest from '${pkgName}';\nconsole.log(${pkgName}, ${pkgName}Rest);`,
  ], // Default and namespace imports
  [
    `import '${pkgName}'`,
    `import * as tmp from '${pkgName}';\nconsole.log(tmp);`,
  ], // No imports
] as const;

describe("parse", () => {
  test("check valid import statements", () => {
    importStatements.forEach(([statement, parsedString]) => {
      const packages = getPackageInfoFromString(statement, "typescript");
      expect(packages).toEqual([
        {
          name: pkgName,
          string: parsedString,
        },
      ]);
    });
  });

  const validRequireStatements = [
    [`const { parse } = require('${pkgName}')`, `require('${pkgName}')`],
    [`const ${pkgName} = require('${pkgName}')`, `require('${pkgName}')`],
  ] as const;

  test("check valid require statements", () => {
    validRequireStatements.forEach(([statement, parsedString]) => {
      const packages = getPackageInfoFromString(statement, "typescript");
      expect(packages).toEqual([
        {
          name: pkgName,
          string: parsedString,
        },
      ]);
    });
  });

  const validImportCallStatements = [
    [
      `import('${pkgName}')`,
      `import('${pkgName}').then(res => console.log(res));`,
    ],
    [
      `() => import('${pkgName}')`,
      `import('${pkgName}').then(res => console.log(res));`,
    ],
    [
      `import('${pkgName}').then(res => {});`,
      `import('${pkgName}').then(res => console.log(res));`,
    ],
  ] as const;

  test("check valid import call statements", () => {
    validImportCallStatements.forEach(([statement, parsedString]) => {
      const packages = getPackageInfoFromString(statement, "typescript");
      expect(packages).toEqual([
        {
          name: pkgName,
          string: parsedString,
        },
      ]);
    });
  });

  const invalidStatements = [
    [`import`, 'Unexpected token, expected "{" (1:6)'], // just import statement
    [`import { parse } from; '${pkgName}'`, "Unexpected token (1:21)"], // added wrong semicolon
    [`require()`, "Unexpected argument type"], // no args
    [`require(test)`, "Unexpected argument type"], // just import statement
  ] as const;

  test("check invalid statements", () => {
    invalidStatements.forEach(([statement, error]) => {
      expect(() =>
        getPackageInfoFromString(statement, "typescript")
      ).toThrowError(error);
    });
  });

  test("skip local imports imports", () => {
    const statement = `import { parse } from '${pkgName}';\nimport { something } from './somewhere'; \nimport { anything } from '../somewhere';`;
    const packages = getPackageInfoFromString(statement, "typescript");
    expect(packages).toEqual([
      {
        name: pkgName,
        string: `import {parse} from '${pkgName}';\nconsole.log({parse});`,
      },
    ]);
  });
});
