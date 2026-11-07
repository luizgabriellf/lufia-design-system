import { spawn, spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
let stage;
let entry;

// Rebuild the published layout (dist/cli, dist/ai, package.json) from the sources, exactly as postbuild copies it.
beforeAll(() => {
  stage = mkdtempSync(path.join(tmpdir(), "lufia-ai-test-"));
  mkdirSync(path.join(stage, "dist/ai"), { recursive: true });
  cpSync(path.join(ROOT, "src/cli/lufia-ai.js"), path.join(stage, "dist/cli/lufia-ai.js"));
  cpSync(path.join(ROOT, "src/cli/lufia-ai"), path.join(stage, "dist/cli/lufia-ai"), { recursive: true });
  cpSync(path.join(ROOT, "docs/ai/components.json"), path.join(stage, "dist/ai/components.json"));
  writeFileSync(
    path.join(stage, "package.json"),
    JSON.stringify({ name: "@lufia/design-system", version: "9.9.9", type: "module" }),
  );
  entry = path.join(stage, "dist/cli/lufia-ai.js");
});

afterAll(() => rmSync(stage, { recursive: true, force: true }));

const cli = (...args) => spawnSync(process.execPath, [entry, ...args], { encoding: "utf8" });

describe("lufia-ai CLI", () => {
  it("prints the installed version", () => {
    expect(cli("version").stdout.trim()).toBe("9.9.9");
  });

  it("searches, lists and shows from the shipped manifest", () => {
    const search = JSON.parse(cli("search", "searchable async", "--json", "--limit", "3").stdout);
    expect(search[0].name).toBe("Combobox");
    expect(search.length).toBeLessThanOrEqual(3);
    expect(JSON.parse(cli("list", "--json").stdout).length).toBeGreaterThan(10);
    const show = JSON.parse(cli("show", "button", "--json").stdout);
    expect(show.name).toBe("Button");
    expect(cli("show", "Button").stdout).toContain("Import: @lufia/design-system/");
  });

  it("fails with a message on bad input", () => {
    const unknown = cli("show", "Nope");
    expect(unknown.status).toBe(1);
    expect(unknown.stderr).toContain("Unknown component: Nope");
    expect(cli("search", "x", "--limit", "99").status).toBe(1);
    expect(cli("wat").status).toBe(1);
    const empty = cli("search");
    expect(empty.status).toBe(1);
    expect(empty.stderr).toContain("Missing search query");
    expect(empty.stderr).toContain("Usage:");
  });
});

/** Spawns `lufia-ai mcp`, sends each request line and resolves with the parsed stdout lines plus stderr. */
function mcpSession(lines) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [entry, "mcp"], { stdio: ["pipe", "pipe", "pipe"] });
    let out = "";
    let err = "";
    child.stdout.on("data", (chunk) => (out += chunk));
    child.stderr.on("data", (chunk) => (err += chunk));
    child.on("error", reject);
    child.on("close", () =>
      resolve({
        stderr: err,
        stdoutLines: out.split("\n").filter(Boolean),
        messages: out
          .split("\n")
          .filter(Boolean)
          .map((line) => JSON.parse(line)),
      }),
    );
    child.stdin.end(
      lines.map((line) => (typeof line === "string" ? line : JSON.stringify(line))).join("\n") + "\n",
    );
  });
}

const rpc = (id, method, params) => ({ jsonrpc: "2.0", id, method, params });
const call = (id, name, args) => rpc(id, "tools/call", { name, arguments: args });

describe("lufia-ai mcp", () => {
  it("handshakes, lists tools and answers tools/call over stdio", async () => {
    const { messages, stderr } = await mcpSession([
      rpc(1, "initialize", {
        protocolVersion: "2025-11-25",
        capabilities: {},
        clientInfo: { name: "test", version: "0" },
      }),
      { jsonrpc: "2.0", method: "notifications/initialized" },
      rpc(2, "ping"),
      rpc(3, "tools/list"),
      call(4, "search_components", { query: "searchable async", limit: 2 }),
      call(5, "get_component", { name: "Button" }),
      call(6, "list_components", {}),
    ]);
    // The notification gets no response: six requests, six messages.
    expect(messages.map((m) => m.id)).toEqual([1, 2, 3, 4, 5, 6]);
    const [init, ping, tools, search, get, list] = messages;
    expect(init.result.protocolVersion).toBe("2025-11-25");
    expect(init.result.capabilities.tools).toBeDefined();
    expect(init.result.serverInfo.name).toBe("lufia-ai");
    expect(ping.result).toEqual({});
    expect(tools.result.tools.map((t) => t.name)).toEqual([
      "search_components",
      "get_component",
      "list_components",
    ]);
    const found = JSON.parse(search.result.content[0].text);
    expect(found[0].name).toBe("Combobox");
    expect(found).toHaveLength(2);
    expect(JSON.parse(get.result.content[0].text).name).toBe("Button");
    expect(JSON.parse(list.result.content[0].text).length).toBeGreaterThan(10);
    expect(stderr).toContain("ready on stdio");
  });

  it("falls back to a supported version in the legacy handshake", async () => {
    const { messages } = await mcpSession([rpc(1, "initialize", { protocolVersion: "1999-01-01" })]);
    expect(messages[0].result.protocolVersion).toBe("2025-11-25");
    expect(messages[0].result).not.toHaveProperty("resultType");
  });

  // Shapes below follow the 2026-07-28 schema (schema/2026-07-28/schema.ts): `resultType` on every result (Result),
  // `ttlMs` (integer >= 0) and `cacheScope` on CacheableResult (~l.1081, used by ListToolsResult ~l.1779 and
  // DiscoverResult ~l.678), no top-level serverInfo: identity lives in result `_meta` (examples/DiscoverResultResponse).
  describe("2026-07-28 stateless mode", () => {
    const meta = { _meta: { "io.modelcontextprotocol/protocolVersion": "2026-07-28" } };
    const identity = { name: "lufia-ai", version: "9.9.9" };

    it("answers discover, tools/list and tools/call without a handshake", async () => {
      const { messages } = await mcpSession([
        rpc(1, "server/discover", {}),
        rpc(2, "tools/list", meta),
        rpc(3, "tools/call", { ...meta, name: "get_component", arguments: { name: "Button" } }),
        rpc(4, "tools/call", { ...meta, name: "get_component", arguments: { name: "Nope" } }),
      ]);
      const [discover, list, get, missing] = messages.map((m) => m.result);
      for (const result of [discover, list, get, missing]) {
        expect(result.resultType).toBe("complete");
        expect(result._meta["io.modelcontextprotocol/serverInfo"]).toEqual(identity);
        expect(result).not.toHaveProperty("serverInfo");
      }
      expect(discover.supportedVersions).toContain("2026-07-28");
      expect(discover.capabilities.tools).toEqual({});
      for (const cached of [discover, list]) {
        expect(Number.isInteger(cached.ttlMs) && cached.ttlMs >= 0).toBe(true);
        expect(["public", "private"]).toContain(cached.cacheScope);
      }
      expect(list.tools.map((t) => t.name)).toContain("search_components");
      expect(JSON.parse(get.content[0].text).name).toBe("Button");
      expect(missing.isError).toBe(true);
    });

    it("rejects an unsupported _meta version with -32022 and the supported list", async () => {
      const { messages } = await mcpSession([
        rpc(1, "tools/list", { _meta: { "io.modelcontextprotocol/protocolVersion": "2031-01-01" } }),
      ]);
      expect(messages[0].error.code).toBe(-32022);
      expect(messages[0].error.data.requested).toBe("2031-01-01");
      expect(messages[0].error.data.supported).toContain("2026-07-28");
    });

    it("no longer answers ping", async () => {
      const { messages } = await mcpSession([rpc(1, "ping", meta)]);
      expect(messages[0].error.code).toBe(-32601);
    });
  });

  it("returns JSON-RPC errors for unknown methods, tools and bad arguments", async () => {
    const { messages, stdoutLines } = await mcpSession([
      rpc(1, "resources/list"),
      call(2, "delete_everything", {}),
      call(3, "search_components", {}),
      call(4, "search_components", { query: "x", limit: 500 }),
      call(5, "get_component", { name: 42 }),
      rpc(6, "tools/call", { arguments: {} }),
      "{not json",
      JSON.stringify([1]),
      "[]",
      call(7, "get_component", { name: "Nope" }),
    ]);
    expect(messages[0].error.code).toBe(-32601);
    for (const index of [1, 2, 3, 4, 5]) expect(messages[index].error.code).toBe(-32602);
    expect(messages[6].error.code).toBe(-32700);
    expect(messages[7]).toBeInstanceOf(Array);
    expect(messages[7][0].error.code).toBe(-32600);
    // An unknown component is a tool-level error, not a protocol error.
    expect(messages[8].error.code).toBe(-32600);
    expect(messages[9].result.isError).toBe(true);
    // Every stdout line is a protocol message.
    expect(stdoutLines.every((line) => line.startsWith("{") || line.startsWith("["))).toBe(true);
  });
});
