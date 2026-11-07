import { beforeAll, describe, expect, it } from "vitest";
import { buildManifest } from "./build-manifest.mjs";

describe("component manifest", () => {
  let manifest;
  beforeAll(() => {
    manifest = buildManifest();
  }, 120_000);

  const component = (name) => manifest.components.find((c) => c.name === name);
  const prop = (name, propName) =>
    component(name)
      .exports.find((e) => e.name === name)
      .props.find((p) => p.name === propName);

  it("writes out the literals of a union alias", () => {
    expect(prop("Button", "variant").type).toBe('"primary" | "secondary" | "ghost" | "danger"');
    expect(component("Button").aliases.ButtonVariant).toBe('"primary" | "secondary" | "ghost" | "danger"');
  });

  it("lists the members of the object a hook returns", () => {
    const hook = component("Toast").exports.find((e) => e.name === "useToast");
    expect(hook.returnMembers.map((m) => m.name)).toEqual([
      "show",
      "info",
      "success",
      "warning",
      "error",
      "dismiss",
      "clear",
    ]);
    expect(hook.returnMembers.find((m) => m.name === "dismiss").type).toBe("(id: string) => void");
    const boolean = component("usePrefersReducedMotion").exports.find(
      (e) => e.name === "usePrefersReducedMotion",
    );
    expect(boolean.returnMembers).toBeNull();
  });

  it("describes the forms of a discriminated union of props", () => {
    const button = component("Button").exports.find((e) => e.name === "Button");
    expect(button.variants.discriminant).toBe("href");
    const link = button.variants.branches.find((b) => b.name === "AsLink");
    expect(link.props.find((p) => p.name === "href")).toMatchObject({ type: "string", required: true });
    expect(prop("Button", "href").required).toBe(false);
    expect(component("Select").exports.find((e) => e.name === "Select").variants).toBeUndefined();
  });

  it("uses the word dropdown for Select and Combobox", () => {
    expect(component("Select").summary).toMatch(/dropdown/);
    expect(component("Combobox").summary).toMatch(/dropdown/);
  });

  it("labels every component with a status", () => {
    expect(manifest.components.filter((c) => !c.status).map((c) => c.name)).toEqual([]);
  });
});
