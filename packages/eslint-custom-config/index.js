module.exports = {
  extends: ["prettier", "turbo"],
  plugins: ["@typescript-eslint"],
  parser: "@typescript-eslint/parser",
  rules: {
    // "@typescript-eslint/naming-convention": "warn",
    // curly: "warn",
    "@typescript-eslint/semi": "warn",
    eqeqeq: "warn",
    "no-throw-literal": "warn",
  },
  ignorePatterns: ["out", "dist", "**/*.d.ts", "**/eslint-custom-config/index.js"],
};
