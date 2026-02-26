import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "repos/index": "src/repos/index.ts",
    "branches/index": "src/branches/index.ts",
    "issues/index": "src/issues/index.ts",
    "pulls/index": "src/pulls/index.ts",
    "releases/index": "src/releases/index.ts",
    "orgs/index": "src/orgs/index.ts",
  },
  format: ["cjs", "esm"],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
});
