/** Parse strings as JS or TS to detect packages and provide info */
import { parse as babelParse } from "@babel/parser";
import traverse from "@babel/traverse";
import * as types from "@babel/types";
import { ImportInfo, ImportType, SpecifierInfo, SpecifierType } from "./types";

export const Language = {
  TS: "typescript",
  JS: "javascript",
} as const;

export type Language = (typeof Language)[keyof typeof Language];

const PARSE_JS_PLUGINS = ["flow"] as const;
const PARSE_TS_PLUGINS = ["typescript"] as const;

function getAST(input: string, language: Language) {
  const plugins =
    language === Language.TS ? PARSE_TS_PLUGINS : PARSE_JS_PLUGINS;
  return babelParse(input, {
    sourceType: "module",
    plugins: [
      ["decorators", { decoratorsBeforeExport: true }],

      "jsx",
      "doExpressions",
      "objectRestSpread",
      "classProperties",
      "asyncGenerators",
      "functionBind",
      "functionSent",
      "dynamicImport",
      ...plugins,
    ],
  });
}

function isLocalImport(node: types.ImportDeclaration) {
  return /^(\.+\/)/.test(node.source.value);
}

function isLocalRequire(node: types.CallExpression) {
  return (
    node.arguments.length === 1 &&
    types.isStringLiteral(node.arguments[0]) &&
    /^(\.+\/)/.test(node.arguments[0].value)
  );
}

/** Take string as input and parse with babel to extract info on imports in the form of module imports or. */
export function getImportsInfo(input: string, language: Language) {
  const imports: ImportInfo[] = [];
  const ast = getAST(input, language);

  traverse(ast, {
    ImportDeclaration({ node }) {
      if (isLocalImport(node)) return;

      if (node.importKind !== "type") {
        const importInfo: ImportInfo = {
          package: node.source.value,
          specifiers: node.specifiers
            ? (node.specifiers
                ?.map((specifier) => {
                  return getSpecifierInfo(specifier);
                })
                .filter(Boolean) as SpecifierInfo[])
            : [],
          type: ImportType.IMPORT,
        };

        imports.push(importInfo);
      }
    },
    CallExpression({ node }) {
      if (isLocalRequire(node)) return;

      if ("name" in node.callee && node.callee.name === "require") {
        const importInfo: ImportInfo = {
          package: getPackageNameFromCallExpression(node),
          type: ImportType.REQUIRE,
        };

        imports.push(importInfo);
      } else if (node.callee.type === "Import") {
        const importInfo: ImportInfo = {
          package: getPackageNameFromCallExpression(node),
          type: ImportType.DYNAMIC_IMPORT,
        };

        imports.push(importInfo);
      }
    },
  });

  return imports;
}

type Specifier =
  | types.ImportDefaultSpecifier
  | types.ImportNamespaceSpecifier
  | types.ImportSpecifier;

function getSpecifierInfo(specifier: Specifier): SpecifierInfo | undefined {
  if (types.isImportDefaultSpecifier(specifier)) {
    return {
      name: specifier.local.name,
      type: SpecifierType.DEFAULT,
    };
  } else if (types.isImportSpecifier(specifier)) {
    return {
      name: (specifier.imported as types.Identifier).name,
      type: SpecifierType.NAMED,
    };
  } else if (types.isImportNamespaceSpecifier(specifier)) {
    return {
      name: specifier.local.name,
      type: SpecifierType.NAMESPACE,
    };
  } else {
    return undefined;
  }
}

export function getPackageNameFromCallExpression(node: types.CallExpression) {
  let packageName: string | undefined;
  const firstArgument = node.arguments[0];

  if (types.isTemplateLiteral(firstArgument)) {
    packageName = firstArgument.quasis[0]?.value.raw;
  } else if (types.isStringLiteral(firstArgument)) {
    packageName = firstArgument.value;
  }

  if (!packageName) {
    throw new Error("Unexpected argument type");
  }
  return packageName;
}
