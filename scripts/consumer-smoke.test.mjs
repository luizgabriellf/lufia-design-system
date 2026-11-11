import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { checkSmoke, deriveValue, isClientEntry, planSmoke, renderSmoke } from "./consumer-smoke.mjs";

const component = (name, props = [], entryName = name) => ({
  name: entryName,
  source: `src/components/${entryName}`,
  entry: { subpath: `@scope/pkg/components/${entryName}` },
  exports: [{ name, kind: "component", props }],
});
const required = (name, type) => ({ name, type, required: true });
const plan = (components, options = {}) =>
  planSmoke({ components }, { isClient: () => false, fixtures: {}, ...options });

describe("consumer smoke page", () => {
  it("matches the committed manifest", () => {
    expect(checkSmoke()).toEqual([]);
  });

  it("fails on a component whose required props are neither derivable nor in a fixture", () => {
    const result = plan([component("List", [required("items", "readonly Item[]")])]);
    expect(result.problems).toEqual([expect.stringContaining("List")]);
  });

  it("uses a fixture for what cannot be derived, and rejects a stale fixture", () => {
    const list = component("List", [required("items", "readonly Item[]")]);
    const fixtures = { List: { items: "[]" }, Gone: { items: "[]" } };
    const result = plan([list], { fixtures });
    expect(result.problems).toEqual([expect.stringContaining("Gone")]);
    expect(result.sections.server[0].props).toEqual({ items: "[]" });
  });

  it("derives scalar props and renders a component with required callbacks through the client boundary", () => {
    const result = plan([
      component("Label", [required("text", "string"), required("tone", '"a" | "b"')]),
      component("Sort", [required("onSort", "() => void")]),
    ]);
    expect(result.problems).toEqual([]);
    expect(result.sections.server.map((section) => [section.id, section.props])).toEqual([
      ["Label", { text: '"x"', tone: '"a"' }],
    ]);
    expect(result.sections.client.map((section) => section.id)).toEqual(["Sort"]);
  });

  it("puts client entries behind the boundary and hook-only entries in as namespace imports", () => {
    const hook = {
      name: "useThing",
      source: "src/components/useThing",
      entry: { subpath: "@scope/pkg/x" },
      exports: [],
    };
    const result = plan([component("Panel"), hook], { isClient: () => true });
    expect(result.sections.server).toEqual([]);
    expect(result.sections.client.map((section) => section.id)).toEqual(["Panel", "useThing"]);
    const files = renderSmoke(result);
    expect(files.get("tests/consumer/next-app/app/smoke/boundary.jsx")).toContain('"use client"');
    expect(files.get("tests/consumer/next-app/app/smoke/page.jsx")).toContain(
      'import ClientSmoke from "./boundary"',
    );
  });

  it("derives no callback for a Server Component", () => {
    expect(deriveValue("() => void", { client: true })).toBe("() => {}");
    expect(deriveValue("() => void", { client: false })).toBeUndefined();
    expect(deriveValue("ReactNode | ((control: Control) => ReactNode)", { client: false })).toBe('"x"');
  });

  describe("client detection", () => {
    let root;
    afterEach(() => root && rmSync(root, { recursive: true, force: true }));
    const entryWith = (files) => {
      root = mkdtempSync(path.join(tmpdir(), "lufia-smoke-"));
      mkdirSync(path.join(root, "src/components/X"), { recursive: true });
      for (const [file, content] of Object.entries(files))
        writeFileSync(path.join(root, "src/components/X", file), content);
      return { source: "src/components/X" };
    };

    it("reads the directive from the shipped sources only", () => {
      expect(isClientEntry(entryWith({ "X.tsx": '"use client";\nexport const X = 1;' }), root)).toBe(true);
      expect(isClientEntry(entryWith({ "X.tsx": "// note\n'use client';\n" }), root)).toBe(true);
      expect(isClientEntry(entryWith({ "X.tsx": "export const X = 1;" }), root)).toBe(false);
      expect(
        isClientEntry(entryWith({ "X.tsx": "export const X = 1;", "X.test.tsx": '"use client";' }), root),
      ).toBe(false);
    });
  });
});
