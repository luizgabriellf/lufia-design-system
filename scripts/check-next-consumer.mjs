import { execFileSync, spawn } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

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
      // The development server may not have started accepting connections yet.
    }
    await new Promise((done) => setTimeout(done, 500));
  }
  throw new Error(`Next.js did not serve a successful response at ${url}`);
}

let server;

try {
  if (!existsSync(join(root, "dist/index.js"))) {
    throw new Error("Run npm run build before the Next.js consumer smoke test");
  }

  cpSync(fixture, app, { recursive: true });

  // Install exactly the public package surface: a packed tarball, not source files.
  const packOutput = execFileSync("npm", ["pack", "--json", "--ignore-scripts", "--pack-destination", app], {
    cwd: root,
    env: environment,
    encoding: "utf8",
  });
  const [{ filename }] = JSON.parse(packOutput);
  const pkgPath = join(app, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  pkg.dependencies["@lufia/design-system"] = `file:./${filename}`;
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

  run("npm", ["install", "--no-audit", "--no-fund"], app);
  run("npm", ["run", "build"], app);

  const port = await availablePort();
  server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], {
    cwd: app,
    env: environment,
    stdio: "inherit",
  });

  const html = await getPage(server, `http://127.0.0.1:${port}`);
  for (const text of ["Lufia consumer smoke", "Server badge", "Client button", "Open modal"]) {
    if (!html.includes(text)) throw new Error(`Server HTML is missing: ${text}`);
  }
  if (!/<link[^>]+rel="stylesheet"/.test(html)) {
    throw new Error("The consumer HTML is missing a CSS stylesheet");
  }

  console.log("Next.js consumer smoke passed: packed package, production build and SSR HTTP response.");
} finally {
  if (server?.exitCode === null) server.kill("SIGTERM");
  rmSync(workspace, { recursive: true, force: true, maxRetries: 3, retryDelay: 250 });
}
