import { describe, expect, it } from "vitest";
import {
  changesetProblem,
  isChangeset,
  isPublishedSource,
  shippedManifestChanged,
} from "./check-changeset.mjs";

describe("changeset gate", () => {
  it("counts only published source", () => {
    expect(isPublishedSource("src/components/Button/Button.tsx")).toBe(true);
    expect(isPublishedSource("src/components/Button/Button.module.css")).toBe(true);
    expect(isPublishedSource("src/components/Button/Button.stories.tsx")).toBe(false);
    expect(isPublishedSource("src/components/Button/Button.test.tsx")).toBe(false);
    expect(isPublishedSource("src/components/Button/Button.mdx")).toBe(false);
    expect(isPublishedSource("src/docs/taxonomy.ts")).toBe(false);
    expect(isPublishedSource("src/test/setup.ts")).toBe(false);
    expect(isPublishedSource("scripts/check-changeset.mjs")).toBe(false);
  });

  it("counts tokens and the build inputs that shape the package", () => {
    expect(isPublishedSource("tokens/color.json")).toBe(true);
    expect(isPublishedSource("scripts/postbuild.mjs")).toBe(true);
    expect(isPublishedSource("scripts/build-tokens.mjs")).toBe(true);
    expect(isPublishedSource("tsup.config.ts")).toBe(true);
  });

  it("fails a tokens-only pull request without a changeset", () => {
    expect(changesetProblem({ changed: ["tokens/color.json"], added: [] })).toMatch(/adds no \.changeset/);
  });

  it("counts a shipped package.json field but not a devDependency bump", () => {
    const base = { exports: { ".": "./a.js" }, devDependencies: { vite: "1.0.0" }, scripts: { a: "x" } };
    expect(shippedManifestChanged(base, { ...base, devDependencies: { vite: "2.0.0" } })).toBe(false);
    expect(shippedManifestChanged(base, { ...base, scripts: { a: "y" } })).toBe(false);
    expect(shippedManifestChanged(base, { ...base, exports: { ".": "./b.js" } })).toBe(true);
    expect(shippedManifestChanged(base, { ...base, peerDependencies: { react: "^19" } })).toBe(true);
    expect(changesetProblem({ changed: ["package.json"], added: [], manifestChanged: true })).toMatch(
      /package\.json/,
    );
    expect(changesetProblem({ changed: ["package.json"], added: [], manifestChanged: false })).toBeNull();
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
    const same = { headRepo: "o/r", baseRepo: "o/r" };
    expect(changesetProblem({ changed, added: [], headRef: "changeset-release/main", ...same })).toBeNull();
    expect(
      changesetProblem({ changed, added: [], headRef: "dependabot/npm_and_yarn/x", ...same }),
    ).toBeNull();
    expect(changesetProblem({ changed, added: [], actor: "dependabot[bot]", ...same })).toBeNull();
  });

  it("does not trust a branch name from a fork or without repository info", () => {
    const changed = ["src/components/Button/Button.tsx"];
    const fork = { headRef: "changeset-release/main", headRepo: "evil/r", baseRepo: "o/r" };
    expect(changesetProblem({ changed, added: [], ...fork })).toMatch(/adds no/);
    expect(changesetProblem({ changed, added: [], headRef: "dependabot/x" })).toMatch(/adds no/);
  });
});
