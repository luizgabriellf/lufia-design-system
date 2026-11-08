// @vitest-environment node
import { readFileSync } from "node:fs";

// What a React Server Component sees: `react` without the client APIs (createContext, hooks). Anything that reaches for
// them while the module loads fails here, as it would in the server layer.
vi.mock("react", () => ({}));

const pkg = JSON.parse(readFileSync("package.json", "utf8")) as {
  exports: Record<string, { types: string; import: string }>;
};

describe("app-shell-state entry", () => {
  it("is a subpath of the package that points at the pure state module", () => {
    const entry = pkg.exports["./app-shell-state"];
    expect(entry).toEqual({
      types: "./dist/components/AppShell/shellState.d.ts",
      import: "./dist/components/AppShell/shellState.js",
    });
  });

  it("imports nothing, so it loads without React", async () => {
    const source = readFileSync("src/components/AppShell/shellState.ts", "utf8");
    expect(source).not.toMatch(/^\s*(import|export)\s[^;]*\sfrom\s/m);
    expect(source).not.toMatch(/^"use client"/m);
    const { parseShellState, serializeShellState } = await import("./shellState");
    expect(parseShellState(serializeShellState({ collapsed: true, openGroups: ["a"] }))).toEqual({
      collapsed: true,
      openGroups: ["a"],
    });
  });

  it("keeps the navigation helpers loadable without React too", async () => {
    const navigation = await import("./navigation");
    expect(navigation.parseShellState("c=1").collapsed).toBe(true);
    expect(
      navigation.findActiveNavKey([{ key: "g", items: [{ key: "a", label: "A", href: "/a" }] }], "/a"),
    ).toBe("a");
  });
});
