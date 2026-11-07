import { describe, expect, it } from "vitest";
import { inspectComponent, listComponents, loadManifest, searchComponents } from "./query.mjs";

const manifest = loadManifest();

describe("AI component discovery", () => {
  it("lists only imports that exist in the committed manifest", () => {
    const listed = listComponents(manifest);
    expect(listed.length).toBe(manifest.components.length);
    for (const item of listed) {
      expect(item.import).toMatch(/^@lufia\/design-system\//);
    }
  });

  it("retrieves relevant components without returning the full manifest", () => {
    const results = searchComponents(manifest, "searchable async");
    expect(results[0]?.name).toBe("Combobox");
    expect(results.length).toBeLessThanOrEqual(8);
  });

  it("matches exact component names and handles missing queries", () => {
    expect(searchComponents(manifest, "Modal")[0]?.name).toBe("Modal");
    expect(searchComponents(manifest, "   ")).toEqual([]);
    expect(inspectComponent(manifest, "not-real")).toBeNull();
  });

  it("ranks natural-language task descriptions", () => {
    expect(searchComponents(manifest, "show a toast notification")[0]?.name).toBe("Toast");
    const top3 = searchComponents(manifest, "confirm before deleting", 3).map((item) => item.name);
    expect(top3).toContain("ConfirmDialog");
  });

  it("drops stopwords and one-character terms instead of matching everything", () => {
    expect(searchComponents(manifest, "a")).toEqual([]);
    expect(searchComponents(manifest, "the of to")).toEqual([]);
    expect(searchComponents(manifest, "a", 20).length).toBeLessThan(manifest.components.length);
  });

  it("keeps an exact component name first even when other terms match elsewhere", () => {
    expect(searchComponents(manifest, "Modal overlay dialog")[0]?.name).toBe("Modal");
  });

  it("reports real props, import paths and Storybook docs", () => {
    const button = inspectComponent(manifest, "Button");
    expect(button?.import).toBe("@lufia/design-system/components/Button");
    expect(button?.exports.find((item) => item.name === "Button")?.props).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "variant",
          type: '"primary" | "secondary" | "ghost" | "danger"',
        }),
      ]),
    );
    expect(button?.storybook).toContain("lufia-design-system/");
    expect(button?.usage?.code).toContain("<Button");
  });

  it("does not manufacture undocumented properties", () => {
    const combobox = inspectComponent(manifest, "Combobox");
    const names = combobox?.exports.find((item) => item.name === "Combobox")?.props.map((prop) => prop.name);
    expect(names).toContain("onQueryChange");
    expect(names).not.toContain("onSelect");
  });
});
