import { defineConfig } from "tsup";

// Unbundled: every source file becomes one output file. This keeps "use client" directives on the
// modules that need them, keeps tree-shaking per file, and leaves CSS Modules to the consumer's
// bundler (copied next to the JS by scripts/postbuild.mjs).
export default defineConfig({
  entry: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.{stories,test}.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/test/**",
    "!src/docs/**",
  ],
  bundle: false,
  format: ["esm"],
  dts: false, // declarations come from `tsc -p tsconfig.types.json` (see the build script): far less memory than the dts bundler
  clean: false,
  sourcemap: false,
  target: "es2022",
  outDir: "dist",
  tsconfig: "tsconfig.build.json",
});
