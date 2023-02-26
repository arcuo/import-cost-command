export const ImportType = {
  IMPORT: "import",
  REQUIRE: "require",
  DYNAMIC_IMPORT: "dynamicImport",
} as const;
export type ImportType = (typeof ImportType)[keyof typeof ImportType];

export const SpecifierType = {
  DEFAULT: "default",
  NAMED: "named",
  NAMESPACE: "namespace",
} as const;
export type SpecifierType = (typeof SpecifierType)[keyof typeof SpecifierType];

export type SpecifierInfo = {
  name: string;
  type: SpecifierType;
};

export type ImportInfo = {
  package: string;
  specifiers?: SpecifierInfo[];
  type: ImportType;
};
