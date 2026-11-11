# AI layer

Files that let coding agents use and change this repository without guessing. Everything here is product-agnostic.

| File                           | Audience                  | Origin                                                                                                         |
| ------------------------------ | ------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `AGENTS.md` (repository root)  | Agents changing the repo  | Hand-written; `CLAUDE.md`, `.github/copilot-instructions.md` and `.cursor/rules/design-system.mdc` point to it |
| `docs/ai/CONSUMING.md`         | Agents using the package  | Hand-written                                                                                                   |
| `docs/ai/components.json`      | Both                      | Generated from the TypeScript types, MDX and stories                                                           |
| `docs/ai/components/<Name>.md` | Both                      | Generated, one spec per exported component                                                                     |
| `docs/ai/llms.txt`             | Agents browsing the site  | Generated index, format from llmstxt.org                                                                       |
| `docs/ai/llms-full.txt`        | Agents that want one file | Generated: consuming guide, motion rules and every spec                                                        |
| `docs/ai/agent-index.md`       | Agents using the package  | Generated: every component, its import path, status and key props, in at most 8 KB                             |
| `src/cli/lufia-ai/`            | Agents using the package  | Hand-written plain ESM: lookup core, MCP server; `src/cli/lufia-ai.js` is the `lufia-ai` bin                   |

## How the manifest is generated

`scripts/ai/build-manifest.mjs` uses the TypeScript compiler API. For each component directory re-exported from
`src/index.ts` it reads the exports of the directory's index barrel and, per export:

- a component: the props of its first parameter (JSDoc as description, `@default` or the destructuring default as default,
  union members merged, native element attributes counted but not listed);
- a hook or function: its signature and parameters; for a hook that returns an object type (`T` or `T | null`), also the
  members of that type (`returnMembers`: name, type, required, JSDoc), so `useToast()` lists `show`, `dismiss` and the rest;
- props typed as a union of forms (for example a button that is a `<button>` or, with `href`, a link): the flat `props`
  list stays, and `variants` adds the discriminant prop and, per form, the props that set it apart (type, required,
  JSDoc). The spec renders it as a "Variants" section.

It adds the category, summary and WAI-ARIA pattern from `src/docs/taxonomy.ts`, the status, usage example, when-to-use
lists, keyboard table and accessibility notes from the component's `.mdx`, the story ids from its `.stories.tsx`, and the
`--lufia-*` tokens read by its CSS Module. The output has no timestamp and no package version, so it only changes when a
component changes. `scripts/ai/render.mjs` turns the manifest into the specs and llms files.

To improve a spec, improve its source: JSDoc on the props, or a section in the MDX. Never edit the generated files.

## Query CLI

`scripts/ai/query.mjs` is a read-only lookup over `docs/ai/components.json`, so an agent does not have to load the whole
manifest:

```bash
npm run ai:list                          # every component, one line each (--json for structured output)
npm run ai:search -- "confirm deleting"  # ranked matches (--limit 1..20, --json)
npm run ai:show -- Button                # imports, props, example, accessibility, Storybook link
```

Search terms are OR-ed and weighted by where they match (name, summary, guidance, category, prop names); the start of a
word ("drop" in "dropdown", "dialog" in `ConfirmDialog`) counts for more than a match inside a word. Search does no
synonyms, so a summary should use the plain word people search for. Stopwords and
terms under two characters are dropped, a component matching more terms ranks higher, and an exact component name always
comes first. It never infers anything: every prop, type and import comes from the manifest.

## The agent index

`docs/ai/agent-index.md` is a block for a consuming app to paste into its own `AGENTS.md`, where it is always in the
agent's context (the lookup CLI and the MCP server only help when the agent decides to call them). `scripts/ai/agent-index.mjs`
renders it from the manifest: a short legend and the rules, then one line per component, grouped by category
(`scripts/ai/categories.mjs`, the order `llms.txt` uses):

- the import path is `@lufia/design-system/components/<Name>` unless the line carries another subpath in brackets
  (`[motion]`);
- the status is written only when it is not `beta`;
- the key props are the component's own props, required ones first and marked `*`, then in declaration order, with
  `+N` for the ones left out; `className`, `ref`, `style`, `children` and native attributes are never listed. A hook
  lists its arguments; other components and hooks exported from the same path follow `also`.

The block is capped at 8 KB (`AGENT_INDEX_MAX_BYTES`). The renderer lists up to 12 props per component and lowers that
number until the block fits, so the file keeps fitting as components are added; it throws when even the bare list does
not fit. The output depends only on the manifest (no date, no version), and sits between two marker comments so an app
can replace the whole block on upgrade. `scripts/ai/agent-index.test.mjs` covers the cap, the determinism and that every
component is listed.

## Regenerate

```bash
npm run build:ai-docs     # writes docs/ai/components/, components.json, llms.txt, llms-full.txt, agent-index.md
npm run build:agent-index # rewrites only agent-index.md, from the committed components.json (no TypeScript pass)
npm run verify:ai-docs    # the drift gate
```

## The drift gate

`npm run verify:ai-docs` (part of `npm run check` and so of CI) fails when:

- a generated file (the agent index included) differs from a fresh regeneration, is missing, or is stale (a spec for a
  removed component), or the agent index cannot be rendered within its 8 KB cap;
- a component exported from `src/index.ts` is missing from `components.json` or has no spec;
- `AGENTS.md`, this file, `CONSUMING.md` or the Copilot file reference a path or an `npm run` script that does not exist;
- `CLAUDE.md` is not exactly `@AGENTS.md`, or the Cursor rule or Copilot file does not point to `AGENTS.md`;
- the leak gate (`scripts/ai/verify-leaks.mjs`) finds a denylisted identifier in a tracked file or in `dist/`. The denylist
  is not in the repository: it comes from `LUFIA_LEAK_TOKENS` or a local config file, and the gate skips with a notice when
  neither exists (see "Leak gate" in `AGENTS.md`). Output gives the file, the line and the token's index, never the word.

## Publishing

`npm run build-storybook` ends with `scripts/ai/publish.mjs`, which copies the files into `storybook-static`, so the GitHub
Pages deploy serves them at the site root: `llms.txt`, `llms-full.txt`, `agent-index.md`, `components.json`, plus `/ai/CONSUMING.md` and
`/ai/components/<Name>.md` (the targets of the links in `llms.txt`). The generated `docs/ai` files are not published in the npm package; they live in the repo and on Pages.

Storybook's own native components manifest (`features.componentsManifest` in `.storybook/main.ts`) is also built into
`storybook-static/manifests/components.json`, so Pages serves it at `/manifests/components.json`. It is independent of
`docs/ai/components.json`; CI asserts that it contains a known component.

## Shipped with the package: `lufia-ai`

`scripts/postbuild.mjs` copies `components.json`, `llms.txt`, `llms-full.txt`, `CONSUMING.md` and the per-component specs into
`dist/ai/` (exported as `@lufia/design-system/ai/*`), and the plain-ESM CLI into `dist/cli/`. The `lufia-ai` bin
(`search`, `list`, `show`, `version`, `mcp`) reads `dist/ai/components.json` relative to its own file, so it always answers
for the installed version, offline. `lufia-ai mcp` is a hand-written stdio MCP server (no runtime dependency; newline-delimited
JSON-RPC; the legacy `initialize` handshake for revisions up to 2025-11-25, and the stateless 2026-07-28 mode (per-request version `_meta`, `resultType`, `ttlMs`/`cacheScope`, server identity in `_meta`, error -32022 on an unsupported version)). The lookup logic lives only in
`src/cli/lufia-ai/core.js`; `scripts/ai/query.mjs` (the `ai:*` scripts) is a thin wrapper pointing it at `docs/ai/`, so the
repository script and the shipped CLI cannot drift. Tests: `scripts/ai/lufia-ai.test.mjs`, and the Next.js consumer smoke runs
`npx --no-install lufia-ai` from the packed install. User setup and MCP client configs: `CONSUMING.md`.

## Storybook MCP (local only)

`.storybook/main.ts` registers `@storybook/addon-mcp` (docs and dev toolsets). While `npm run storybook` runs, coding agents
can reach `http://127.0.0.1:6006/mcp` (`docs-list`, `docs-show`). The script passes `--host 127.0.0.1`, so the dev server and
its MCP endpoint are not exposed on the network. The published Pages site is static and has no MCP endpoint.
