import { ImportInfo, ImportType, SpecifierType } from "./types";

function compileImportString(importInfo: ImportInfo) {
  let importSpecifiers: string | undefined;
  let importString: string;

  // Import specifiers are in statement order, which for mixed imports must be either "defaultImport, * as namespaceImport"
  // or "defaultImport, { namedImport [as alias]... } according to current ECMA-262.

  // Given that two equivalent import statements can only differ in the order of the items in a NamedImports block,
  // we only need to sort these items in relation to each other to normalize the statements for caching purposes.
  // Where the node is anything other than ImportSpecifier (Babel terminology for NamedImports), preserve the original statement order.
  switch (importInfo.type) {
    case ImportType.IMPORT: {
      if (
        importInfo.specifiers !== undefined &&
        importInfo.specifiers.length > 0
      ) {
        importString = [...importInfo.specifiers]
          .sort((s1, s2) => {
            if (
              s1.type === SpecifierType.NAMED &&
              s2.type === SpecifierType.NAMED
            )
              return s1.name < s2.name ? -1 : 1;
            return 0;
          })
          .map((specifier, i, specifiers) => {
            switch (specifier.type) {
              case SpecifierType.NAMESPACE: {
                return `* as ${specifier.name}`;
              }
              case SpecifierType.DEFAULT: {
                return specifier.name;
              }
              case SpecifierType.NAMED: {
                if (!importSpecifiers) {
                  importSpecifiers = "{";
                }
                importSpecifiers += specifier.name;

                const hasMoreSpecifiers =
                  specifiers[i + 1]?.type === SpecifierType.NAMED;
                if (hasMoreSpecifiers) {
                  importSpecifiers += ", ";
                  return undefined;
                } else {
                  const result = importSpecifiers + "}";
                  importSpecifiers = undefined;
                  return result;
                }
              }
              default: {
                return undefined;
              }
            }
          })
          .filter((x) => x)
          .join(", ");
      } else {
        importString = "* as tmp";
      }

      return `import ${importString} from '${
        importInfo.package
      }';\nconsole.log(${importString.replace("* as ", "")});`;
    }
    case ImportType.REQUIRE: {
      return compileRequireString(importInfo);
    }
    case ImportType.DYNAMIC_IMPORT: {
      return compileImportExpressionString(importInfo);
    }
    default: {
      return "";
    }
  }
}

function compileRequireString(importInfo: ImportInfo) {
  return `require('${importInfo.package}')`;
}

function compileImportExpressionString(importInfo: ImportInfo) {
  return `import('${importInfo.package}').then(res => console.log(res));`;
}

export { compileImportString };
