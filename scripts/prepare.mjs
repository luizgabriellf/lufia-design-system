// Runs on `npm install`.
// - In a clone: installs the git hooks (husky).
// - When installed from a git tag there is no dist/ yet, so build it (devDependencies are present for prepare).
//   CI jobs that download a prebuilt dist/ (or never need one) set LUFIA_SKIP_PREPARE_BUILD=1 to skip that build.
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

if (existsSync(".git") && existsSync("node_modules/husky")) {
  execSync("npx husky", { stdio: "inherit" });
}
if (
  !process.env.LUFIA_SKIP_PREPARE_BUILD &&
  !existsSync("dist/index.js") &&
  existsSync("node_modules/tsup")
) {
  execSync("npm run build", { stdio: "inherit" });
}
