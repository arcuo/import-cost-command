import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src"],
  outDir: "out",
  clean: true,
  tsconfig: "./tsconfig.json",
  format: ["cjs"],
  sourcemap: true,
  external: ["vscode"],
  target: "es2020",
});
