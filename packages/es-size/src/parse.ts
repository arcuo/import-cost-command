/** Parse strings as JS or TS to detect packages and provide info */
import { parse as _parse } from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";

export const Language = {
  TS: "typescript",
  JS: "javascript",
} as const;

export type Language = (typeof Language)[keyof typeof Language];

export type PackageInfo = {
  name: string;
  string: string;
};

const PARSE_JS_PLUGINS = ["flow"] as const;
const PARSE_TS_PLUGINS = ["typescript"] as const;

function parse(input: string, language: Language) {
  const plugins =
    language === Language.TS ? PARSE_TS_PLUGINS : PARSE_JS_PLUGINS;
  return _parse(input, {
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

function isLocalImport(node: t.ImportDeclaration) {
  return /^(\.+\/)/.test(node.source.value);
}

function isLocalRequire(node: t.CallExpression) {
  return (
    node.arguments.length === 1 &&
    t.isStringLiteral(node.arguments[0]) &&
    /^(\.+\/)/.test(node.arguments[0].value)
  );
}

export function getPackageInfoFromString(
  input: string,
  lang: Language
): PackageInfo[] {
  const packages: PackageInfo[] = [];

  const ast = parse(input, lang);

  traverse(ast, {
    ImportDeclaration({ node }) {
      if (isLocalImport(node)) return;

      if (node.importKind !== "type") {
        packages.push({
          name: node.source.value,
          string: compileImportString(node),
        });
      }
    },
    CallExpression({ node }) {
      if (isLocalRequire(node)) return;

      if ("name" in node.callee && node.callee.name === "require") {
        packages.push({
          name: getPackageName(node),
          string: compileRequireString(node),
        });
      } else if (node.callee.type === "Import") {
        packages.push({
          name: getPackageName(node),
          string: compileImportExpressionString(node),
        });
      }
    },
  });

  return packages;
}

function compileImportString(node: t.ImportDeclaration) {
  let importSpecifiers: string | undefined;
  let importString: string;

  if (node.specifiers && node.specifiers.length > 0) {
    importString = [...node.specifiers]
      .sort((s1, s2) => {
        // Import specifiers are in statement order, which for mixed imports must be either "defaultImport, * as namespaceImport"
        // or "defaultImport, { namedImport [as alias]... } according to current ECMA-262.

        // Given that two equivalent import statements can only differ in the order of the items in a NamedImports block,
        // we only need to sort these items in relation to each other to normalize the statements for caching purposes.
        // Where the node is anything other than ImportSpecifier (Babel terminology for NamedImports), preserve the original statement order.
        if (t.isImportSpecifier(s1) && t.isImportSpecifier(s2)) {
          return (s1.imported as t.Identifier).name <
            (s2.imported as t.Identifier).name
            ? -1
            : 1;
        }
        return 0;
      })
      .map((specifier, i) => {
        if (t.isImportNamespaceSpecifier(specifier)) {
          return `* as ${specifier.local.name}`;
        } else if (t.isImportDefaultSpecifier(specifier)) {
          return specifier.local.name;
        } else if (t.isImportSpecifier(specifier)) {
          if (!importSpecifiers) {
            importSpecifiers = "{";
          }
          importSpecifiers += (specifier.imported as t.Identifier).name;

          const hasMoreSpecifiers =
            node.specifiers[i + 1] &&
            t.isImportSpecifier(node.specifiers[i + 1]);
          if (hasMoreSpecifiers) {
            importSpecifiers += ", ";
            return undefined;
          } else {
            const result = importSpecifiers + "}";
            importSpecifiers = undefined;
            return result;
          }
        } else {
          return undefined;
        }
      })
      .filter((x) => x)
      .join(", ");
  } else {
    importString = "* as tmp";
  }
  return `import ${importString} from '${
    node.source.value
  }';\nconsole.log(${importString.replace("* as ", "")});`;
}

function compileRequireString(node: t.CallExpression) {
  return `require('${getPackageName(node)}')`;
}

function compileImportExpressionString(node: t.CallExpression) {
  return `import('${getPackageName(node)}').then(res => console.log(res));`;
}

function getPackageName(node: t.CallExpression) {
  let packageName: string | undefined;
  const firstArgument = node.arguments[0];

  if (t.isTemplateLiteral(firstArgument)) {
    packageName = firstArgument.quasis[0]?.value.raw;
  } else if (t.isStringLiteral(firstArgument)) {
    packageName = firstArgument.value;
  }

  if (!packageName) throw new Error("Unexpected argument type");
  return packageName;
}
