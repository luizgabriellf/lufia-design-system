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

  it("labels every component with a status", () => {
    expect(manifest.components.filter((c) => !c.status).map((c) => c.name)).toEqual([]);
  });
});
