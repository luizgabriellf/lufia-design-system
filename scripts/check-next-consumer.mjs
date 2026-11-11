import { execFileSync, spawn } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { checkSmoke, loadManifest, planSmoke, smokeIds } from "./consumer-smoke.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const fixture = join(root, "tests/consumer/next-app");
const workspace = mkdtempSync(join(tmpdir(), "lufia-next-smoke-"));
const app = join(workspace, "app");
const environment = { ...process.env, NEXT_TELEMETRY_DISABLED: "1", HUSKY: "0" };

function run(command, args, cwd) {
  execFileSync(command, args, { cwd, env: environment, stdio: "inherit" });
}

async function availablePort() {
  const listener = createServer();
  return new Promise((resolvePort, reject) => {
    listener.once("error", reject);
    listener.listen(0, "127.0.0.1", () => {
      const address = listener.address();
      if (!address || typeof address === "string") {
        listener.close();
        reject(new Error("Could not reserve an HTTP port"));
        return;
      }
      listener.close(() => resolvePort(address.port));
    });
  });
}

async function getPage(server, url) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (server.exitCode !== null) throw new Error("Next.js server exited before serving the app");
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1500) });
      if (response.ok) return response.text();
    } catch {
      // The production server may not have started accepting connections yet.
    }
    await new Promise((done) => setTimeout(done, 500));
  }
  throw new Error(`Next.js did not serve a successful response at ${url}`);
}

let server;

try {
  if (!existsSync(join(root, "dist/index.js"))) {
    // CI downloads the dist/ the verify job built; locally run npm run build first.
    throw new Error("dist/ is missing: run npm run build (or download the build artifact) first");
  }

  // The generated smoke page must match the manifest before it is installed (npm run build:consumer-smoke).
  const smokeProblems = checkSmoke();
  if (smokeProblems.length > 0) throw new Error(smokeProblems.join("\n"));

  cpSync(fixture, app, { recursive: true });

  // Install exactly the public package surface: a packed tarball, not source files.
  const packOutput = execFileSync("npm", ["pack", "--json", "--ignore-scripts", "--pack-destination", app], {
    cwd: root,
    env: environment,
    encoding: "utf8",
  });
  const [{ filename, files }] = JSON.parse(packOutput);
  const packed = new Set(files.map((file) => file.path));
  for (const required of ["dist/ai/components.json", "dist/ai/llms.txt", "dist/cli/lufia-ai.js"]) {
    if (!packed.has(required)) throw new Error(`The packed tarball is missing ${required}`);
  }
  const pkgPath = join(app, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  pkg.dependencies["@lufia/design-system"] = `file:./${filename}`;
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

  // --ignore-scripts: no lifecycle scripts of the fixture dependencies run on CI or a developer machine.
  run("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund"], app);

  // The shipped lookup CLI resolves through the installed bin and answers from the installed version's manifest.
  const shown = JSON.parse(
    execFileSync("npx", ["--no-install", "lufia-ai", "show", "Button", "--json"], {
      cwd: app,
      env: environment,
      encoding: "utf8",
    }),
  );
  if (shown.name !== "Button" || !shown.import.startsWith("@lufia/design-system/")) {
    throw new Error("npx lufia-ai show Button did not return the Button manifest entry");
  }
  const installedVersion = execFileSync("npx", ["--no-install", "lufia-ai", "version"], {
    cwd: app,
    env: environment,
    encoding: "utf8",
  }).trim();
  if (installedVersion !== JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version) {
    throw new Error(`lufia-ai version ${installedVersion} does not match the packed package`);
  }

  run("npm", ["run", "build"], app);

  const port = await availablePort();
  server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], {
    cwd: app,
    env: environment,
    stdio: "inherit",
  });

  const html = await getPage(server, `http://127.0.0.1:${port}`);
  for (const text of [
    "Lufia consumer smoke",
    "Server badge",
    "Client button",
    "Open modal",
    "Email notifications",
    "Shell state: rail",
  ]) {
    if (!html.includes(text)) throw new Error(`Server HTML is missing: ${text}`);
  }

  // The icon subpath renders in a Server Component.
  if (!/<svg[^>]*data-lufia-icon="close"/.test(html) || !html.includes('aria-label="Server icon"')) {
    throw new Error("The package icons from @lufia/design-system/icons were not server-rendered");
  }

  // Markup that only the package's own components produce, rendered from a Server Component.
  if (!/<button[^>]*role="switch"[^>]*aria-checked="true"/.test(html)) {
    throw new Error('The package Switch was not server-rendered with role="switch" and aria-checked="true"');
  }
  if (!/<button[^>]*data-variant="primary"[^>]*data-size="md"/.test(html)) {
    throw new Error("The package Button data-variant and data-size attributes are missing from the HTML");
  }
  // CSS module class names are hashed, so read the Switch's own class from the markup.
  const switchClass = /<button[^>]*role="switch"[^>]*class="([^"]+)"/.exec(html)?.[1];
  if (!switchClass) throw new Error("The package Switch markup carries no CSS module class");

  // The linked CSS must be the package's: token variables and a component module class.
  const stylesheets = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]*>/g)]
    .map(([tag]) => /href="([^"]+)"/.exec(tag)?.[1])
    .filter(Boolean);
  if (!stylesheets.length) throw new Error("The consumer HTML links no CSS stylesheet");
  let css = "";
  for (const href of stylesheets) {
    const response = await fetch(new URL(href, `http://127.0.0.1:${port}`));
    if (!response.ok) throw new Error(`Could not fetch stylesheet ${href}: ${response.status}`);
    css += await response.text();
  }
  if (!css.includes("--lufia-")) throw new Error("The linked CSS contains no --lufia- token variables");
  if (!css.includes(`.${switchClass}`))
    throw new Error(`The linked CSS has no Switch module class .${switchClass}`);

  // Every manifest component, rendered by the generated /smoke page: Server Components for the ones without
  // "use client", the client boundary for the rest. Each section id is in the server HTML.
  const smokeHtml = await getPage(server, `http://127.0.0.1:${port}/smoke`);
  const ids = smokeIds(planSmoke(loadManifest()));
  const missing = ids.filter((id) => !smokeHtml.includes(`data-smoke="${id}"`));
  if (missing.length > 0) {
    throw new Error(`The /smoke page did not server-render: ${missing.join(", ")}`);
  }

  console.log(
    `Next.js consumer smoke passed: packed package, production build, SSR HTTP response and ${ids.length} manifest sections.`,
  );
} finally {
  if (server?.exitCode === null) server.kill("SIGTERM");
  rmSync(workspace, { recursive: true, force: true, maxRetries: 3, retryDelay: 250 });
}
