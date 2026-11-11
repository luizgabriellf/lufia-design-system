import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AGENT_INDEX_END,
  AGENT_INDEX_FILE,
  AGENT_INDEX_MAX_BYTES,
  AGENT_INDEX_START,
  renderAgentIndex,
} from "./agent-index.mjs";

const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../docs/ai");
const read = (file) => readFileSync(path.join(DIR, file), "utf8");
const manifest = JSON.parse(read("components.json"));
const index = renderAgentIndex(manifest);
const bytes = (text) => Buffer.byteLength(text, "utf8");

/** A manifest of `count` components with `props` optional props each, for the budget tests. */
const synthetic = (count, props) => ({
  package: "@scope/pkg",
  components: Array.from({ length: count }, (_, i) => ({
    name: `Component${i}`,
    category: "Actions",
    status: "beta",
    entry: { subpath: `@scope/pkg/components/Component${i}` },
    exports: [
      {
        name: `Component${i}`,
        kind: "component",
        props: Array.from({ length: props }, (__, p) => ({ name: `property${p}`, required: false })),
      },
    ],
  })),
});

describe("agent index", () => {
  it("fits the 8 KB cap", () => {
    expect(AGENT_INDEX_MAX_BYTES).toBe(8192);
    expect(bytes(index)).toBeLessThanOrEqual(AGENT_INDEX_MAX_BYTES);
  });

  it("is deterministic: same manifest, same bytes, whatever the property order of the input", () => {
    expect(renderAgentIndex(manifest)).toBe(index);
    expect(renderAgentIndex(JSON.parse(JSON.stringify(manifest)))).toBe(index);
    const reordered = JSON.parse(JSON.stringify(manifest), (_, value) =>
      value && typeof value === "object" && !Array.isArray(value)
        ? Object.fromEntries(Object.entries(value).reverse())
        : value,
    );
    expect(renderAgentIndex(reordered)).toBe(index);
    expect(index).not.toMatch(/\d{4}-\d{2}-\d{2}|\bv?\d+\.\d+\.\d+\b/);
  });

  it("matches the committed file", () => {
    expect(read(AGENT_INDEX_FILE)).toBe(index);
  });

  it("is one block between the markers", () => {
    expect(index.startsWith(`${AGENT_INDEX_START}\n`)).toBe(true);
    expect(index.endsWith(`${AGENT_INDEX_END}\n`)).toBe(true);
  });

  it("lists every component once, with its status and import path", () => {
    const lines = index
      .slice(index.indexOf("\n### "))
      .split("\n")
      .filter((line) => line.startsWith("- "));
    expect(lines).toHaveLength(manifest.components.length);
    for (const c of manifest.components) {
      const line = lines.find((l) => new RegExp(`^- ${c.name}(?=[ :]|$)`).test(l));
      expect(line, c.name).toBeDefined();
      expect(line.includes(`(${c.status})`), `${c.name} status`).toBe(c.status !== "beta");
      const standard = c.entry.subpath === `${manifest.package}/components/${c.name}`;
      expect(/\[[\w/-]+\]/.test(line), `${c.name} path`).toBe(!standard);
      if (!standard) expect(`${manifest.package}/${/\[([\w/-]+)\]/.exec(line)[1]}`).toBe(c.entry.subpath);
    }
  });

  it("puts required props first and skips the props every component has", () => {
    expect(index).toMatch(/^- Modal: open\* onClose\* title\* description /m);
    expect(index).toMatch(/^- Reveal \[motion\]: show\* /m);
    expect(index).toMatch(/^- Toast: <ToastProvider> .*\| also useOptionalToast useToast$/m);
    expect(index).toMatch(/^- useMediaQuery: \(query, options\?\)$/m);
    expect(index).not.toMatch(/[ :](className|ref|style|children)\*?( |$)/m);
  });

  it("lists fewer props per component rather than exceed the cap", () => {
    const roomy = renderAgentIndex(synthetic(20, 20));
    expect(roomy).toMatch(/^- Component0: (property\d+ ){12}\+8$/m);
    const tight = renderAgentIndex(synthetic(150, 20));
    expect(bytes(tight)).toBeLessThanOrEqual(AGENT_INDEX_MAX_BYTES);
    expect(tight).toMatch(/^- Component149: /m);
    expect(tight).not.toMatch(/^- Component0: (property\d+ ){12}/m);
  });

  it("throws when even the bare list does not fit", () => {
    expect(() => renderAgentIndex(synthetic(2000, 1))).toThrow(/does not fit 8192 bytes/);
  });
});
