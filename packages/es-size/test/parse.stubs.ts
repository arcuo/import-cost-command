import { ImportInfo, ImportType, SpecifierType } from "../src/types";

export type Stub = {
  input: string;
  importString: string;
  importInfo: ImportInfo;
  testDescription: string;
};

export const pkgName = "testPackage";

export const validImportStubs: Stub[] = [
  {
    input: `import { parse } from '${pkgName}'`,
    importInfo: {
      package: pkgName,
      specifiers: [
        {
          name: "parse",
          type: SpecifierType.NAMED,
        },
      ],
      type: ImportType.IMPORT,
    },
    importString: `import {parse} from '${pkgName}';\nconsole.log({parse});`,
    testDescription: "One named import",
  },
  {
    input: `import { parse, getPackageInfoFromString } from '${pkgName}'`,
    importInfo: {
      package: pkgName,
      specifiers: [
        {
          name: "parse",
          type: SpecifierType.NAMED,
        },
        {
          name: "getPackageInfoFromString",
          type: SpecifierType.NAMED,
        },
      ],
      type: ImportType.IMPORT,
    },
    importString: `import {getPackageInfoFromString, parse} from '${pkgName}';\nconsole.log({getPackageInfoFromString, parse});`,
    testDescription: "Multiple named imports",
  },
  {
    input: `import * as ${pkgName} from '${pkgName}'`,
    importInfo: {
      package: pkgName,
      specifiers: [
        {
          name: pkgName,
          type: SpecifierType.NAMESPACE,
        },
      ],
      type: ImportType.IMPORT,
    },
    importString: `import * as ${pkgName} from '${pkgName}';\nconsole.log(${pkgName});`,
    testDescription: "Namespace import",
  },
  {
    input: `import * as ${pkgName}2 from '${pkgName}'`,
    importInfo: {
      package: pkgName,
      specifiers: [
        {
          name: `${pkgName}2`,
          type: SpecifierType.NAMESPACE,
        },
      ],
      type: ImportType.IMPORT,
    },
    importString: `import * as ${pkgName}2 from '${pkgName}';\nconsole.log(${pkgName}2);`,
    testDescription: "Namespace import with alias",
  },
  {
    input: `import ${pkgName} from '${pkgName}'`,
    importInfo: {
      package: pkgName,
      specifiers: [
        {
          name: pkgName,
          type: SpecifierType.DEFAULT,
        },
      ],
      type: ImportType.IMPORT,
    },
    importString: `import ${pkgName} from '${pkgName}';\nconsole.log(${pkgName});`,
    testDescription: "Default import",
  },
  {
    input: `import ${pkgName}2 from '${pkgName}'`,
    importInfo: {
      package: pkgName,
      specifiers: [
        {
          name: `${pkgName}2`,
          type: SpecifierType.DEFAULT,
        },
      ],
      type: ImportType.IMPORT,
    },
    importString: `import ${pkgName}2 from '${pkgName}';\nconsole.log(${pkgName}2);`,
    testDescription: "Default import with alias",
  },
  {
    input: `import ${pkgName}, { parse } from '${pkgName}'`,
    importInfo: {
      package: pkgName,
      specifiers: [
        {
          name: pkgName,
          type: SpecifierType.DEFAULT,
        },
        {
          name: "parse",
          type: SpecifierType.NAMED,
        },
      ],
      type: ImportType.IMPORT,
    },
    importString: `import ${pkgName}, {parse} from '${pkgName}';\nconsole.log(${pkgName}, {parse});`,
    testDescription: "Default and named imports",
  },
  {
    input: `import ${pkgName}, * as ${pkgName}Rest from '${pkgName}'`,
    importInfo: {
      package: pkgName,
      specifiers: [
        {
          name: pkgName,
          type: SpecifierType.DEFAULT,
        },
        {
          name: `${pkgName}Rest`,
          type: SpecifierType.NAMESPACE,
        },
      ],
      type: ImportType.IMPORT,
    },
    importString: `import ${pkgName}, * as ${pkgName}Rest from '${pkgName}';\nconsole.log(${pkgName}, ${pkgName}Rest);`,
    testDescription: "Default and namespace imports",
  },
  {
    input: `import '${pkgName}'`,
    importInfo: {
      package: pkgName,
      specifiers: [],
      type: ImportType.IMPORT,
    },
    importString: `import * as tmp from '${pkgName}';\nconsole.log(tmp);`,
    testDescription: "No imports",
  },

  {
    input: `const { parse } = require('${pkgName}')`,
    importInfo: {
      package: pkgName,
      type: ImportType.REQUIRE,
    },
    importString: `require('${pkgName}')`,
    testDescription: "Require with destructuring",
  },
  {
    input: `const ${pkgName} = require('${pkgName}')`,
    importInfo: {
      package: pkgName,
      type: ImportType.REQUIRE,
    },
    importString: `require('${pkgName}')`,
    testDescription: "Require with alias",
  },
  {
    input: `import('${pkgName}')`,
    importInfo: {
      package: pkgName,
      type: ImportType.DYNAMIC_IMPORT,
    },
    importString: `import('${pkgName}').then(res => console.log(res));`,
    testDescription: "Dynamic import",
  },
  {
    input: `() => import('${pkgName}')`,
    importInfo: {
      package: pkgName,
      type: ImportType.DYNAMIC_IMPORT,
    },
    importString: `import('${pkgName}').then(res => console.log(res));`,
    testDescription: "Dynamic import in arrow function",
  },
  {
    input: `import('${pkgName}').then(res => {});`,
    importInfo: {
      package: pkgName,
      type: ImportType.DYNAMIC_IMPORT,
    },
    importString: `import('${pkgName}').then(res => console.log(res));`,
    testDescription: "Dynamic import with return then",
  },
];
