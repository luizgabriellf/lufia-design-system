// Serves a built directory (default storybook-static) on loopback for the browser tests.
// Usage: node scripts/serve-static.mjs [dir] [port]
import { createReadStream, existsSync, realpathSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";

const root = resolve(process.argv[2] ?? "storybook-static");
const realRoot = existsSync(root) ? realpathSync(root) : root;
const port = Number(process.argv[3] ?? 6006);

if (!existsSync(root)) {
  console.error(`serve-static: ${root} does not exist; run npm run build-storybook first`);
  process.exit(1);
}

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".wasm": "application/wasm",
  ".map": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
};

createServer((request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
  } catch {
    response.writeHead(400).end();
    return;
  }
  let file = normalize(join(root, pathname));
  // Refuse anything that resolves outside the served directory.
  if (file !== root && !file.startsWith(root + sep)) {
    response.writeHead(403).end();
    return;
  }
  if (!existsSync(file)) {
    response.writeHead(404, { "content-type": "text/plain" }).end("Not found");
    return;
  }
  if (statSync(file).isDirectory()) {
    if (!pathname.endsWith("/")) {
      response.writeHead(301, { location: `${pathname}/` }).end();
      return;
    }
    file = join(file, "index.html");
    if (!existsSync(file)) {
      response.writeHead(404, { "content-type": "text/plain" }).end("Not found");
      return;
    }
  }
  // A symlink inside the root must not lead outside it.
  const real = realpathSync(file);
  if (!real.startsWith(realRoot + sep)) {
    response.writeHead(403).end();
    return;
  }
  const stream = createReadStream(real);
  stream.once("error", () => {
    if (!response.headersSent) response.writeHead(500, { "content-type": "text/plain" });
    response.end("Read error");
  });
  stream.once("open", () => {
    response.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" });
    stream.pipe(response);
  });
}).listen(port, "127.0.0.1", () => {
  console.log(`serve-static: ${root} on http://127.0.0.1:${port}`);
});
