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
    // `disabled` is native in one form and declared in the other with the same type: not branch-specific.
    for (const branch of button.variants.branches) {
      expect(branch.props.map((p) => p.name)).not.toContain("disabled");
    }
    expect(link.props.find((p) => p.name === "download")).toMatchObject({ native: true });
    expect(button.variants.nativeTypesDiffer).toBe(true);
  });

  it("names the forms of an Omit-wrapped union by what selects them, and flags type-only differences", () => {
    const icon = component("IconButton").exports.find((e) => e.name === "IconButton");
    expect(icon.variants.branches.map((b) => b.name)).toEqual(["href: undefined", "href: string"]);
    const bar = component("AppShell").exports.find((e) => e.name === "MobileFloatBarButton");
    for (const branch of bar.variants.branches) {
      expect(branch.props.find((p) => p.name === "onClick")).toMatchObject({ onlyTypeDiffers: true });
    }
  });

  it("keeps `| undefined` on a required return member", () => {
    const hook = component("FormField").exports.find((e) => e.name === "useFormFieldControl");
    const member = (name) => hook.returnMembers.find((m) => m.name === name);
    expect(member("disabled")).toMatchObject({ type: "true | undefined", required: true });
    expect(member("id").type).toBe("string | undefined");
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
