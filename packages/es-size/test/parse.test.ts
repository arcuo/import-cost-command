import { describe, expect, test } from "vitest";
import { compileImportString } from "../src/compileImportStrings";
import { getImportsInfo, Language } from "../src/importInfo";
import { ImportType, SpecifierType } from "../src/types";
import { pkgName, validImportStubs } from "./parse.stubs";

describe("Parsing import statements", () => {
  describe("Create correct import info for valid import, require and dynamic import statements", () => {
    validImportStubs.forEach(
      ({ input, importInfo, importString, testDescription }) => {
        test(testDescription, () => {
          const importInfos = getImportsInfo(input, Language.TS);
          expect(importInfos).toEqual([importInfo]);

          const importStrings = importInfos.map((info) =>
            compileImportString(info)
          );
          expect(importStrings).toEqual([importString]);
        });
      }
    );
  });

  const invalidStatements = [
    [`import`, 'Unexpected token, expected "{" (1:6)'], // just import statement
    [`import { parse } from; '${pkgName}'`, "Unexpected token (1:21)"], // added wrong semicolon
    [`require()`, "Unexpected argument type"], // no args
    [`require(test)`, "Unexpected argument type"], // just import statement
  ] as const;

  test("check invalid statements", () => {
    invalidStatements.forEach(([statement, error]) => {
      expect(() => getImportsInfo(statement, "typescript")).toThrowError(error);
    });
  });

  test("skip local imports imports", () => {
    const statement = `import { parse } from '${pkgName}';\nimport { something } from './somewhere'; \nimport { anything } from '../somewhere';`;
    const importInfo = getImportsInfo(statement, "typescript");
    expect(importInfo).toEqual([
      {
        package: pkgName,
        specifiers: [
          {
            name: "parse",
            type: SpecifierType.NAMED,
          },
        ],
        type: ImportType.IMPORT,
      },
    ]);
  });
});
