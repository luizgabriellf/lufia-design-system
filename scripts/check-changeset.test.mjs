import { describe, expect, it } from "vitest";
import { changesetProblem, isChangeset, isPublishedSource } from "./check-changeset.mjs";

describe("changeset gate", () => {
  it("counts only published source", () => {
    expect(isPublishedSource("src/components/Button/Button.tsx")).toBe(true);
    expect(isPublishedSource("src/components/Button/Button.module.css")).toBe(true);
    expect(isPublishedSource("src/components/Button/Button.stories.tsx")).toBe(false);
    expect(isPublishedSource("src/components/Button/Button.test.tsx")).toBe(false);
    expect(isPublishedSource("src/components/Button/Button.mdx")).toBe(false);
    expect(isPublishedSource("src/docs/taxonomy.ts")).toBe(false);
    expect(isPublishedSource("src/test/setup.ts")).toBe(false);
    expect(isPublishedSource("scripts/postbuild.mjs")).toBe(false);
  });

  it("recognises a changeset but not the readme", () => {
    expect(isChangeset(".changeset/quiet-owls-sing.md")).toBe(true);
    expect(isChangeset(".changeset/README.md")).toBe(false);
    expect(isChangeset(".changeset/config.json")).toBe(false);
  });

  it("fails when source changes without an added changeset", () => {
    const changed = ["src/components/Button/Button.tsx"];
    expect(changesetProblem({ changed, added: [] })).toMatch(/adds no \.changeset/);
    expect(changesetProblem({ changed, added: [".changeset/a-b-c.md"] })).toBeNull();
  });

  it("passes for tooling-only changes and for release or bot branches", () => {
    expect(changesetProblem({ changed: ["scripts/x.mjs", "AGENTS.md"], added: [] })).toBeNull();
    const changed = ["src/components/Button/Button.tsx"];
    expect(changesetProblem({ changed, added: [], headRef: "changeset-release/main" })).toBeNull();
    expect(changesetProblem({ changed, added: [], headRef: "dependabot/npm_and_yarn/x" })).toBeNull();
  });
});
