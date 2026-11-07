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

## Regenerate

```bash
npm run build:ai-docs     # writes docs/ai/components/, components.json, llms.txt, llms-full.txt
npm run verify:ai-docs    # the drift gate
```

## The drift gate

`npm run verify:ai-docs` (part of `npm run check` and so of CI) fails when:

- a generated file differs from a fresh regeneration, is missing, or is stale (a spec for a removed component);
- a component exported from `src/index.ts` is missing from `components.json` or has no spec;
- `AGENTS.md`, this file, `CONSUMING.md` or the Copilot file reference a path or an `npm run` script that does not exist;
- `CLAUDE.md` is not exactly `@AGENTS.md`, or the Cursor rule or Copilot file does not point to `AGENTS.md`;
- the leak gate (`scripts/ai/verify-leaks.mjs`) finds a denylisted identifier in a tracked file or in `dist/`. The denylist
  is not in the repository: it comes from `LUFIA_LEAK_TOKENS` or a local config file, and the gate skips with a notice when
  neither exists (see "Leak gate" in `AGENTS.md`). Output gives the file, the line and the token's index, never the word.

## Publishing

`npm run build-storybook` ends with `scripts/ai/publish.mjs`, which copies the files into `storybook-static`, so the GitHub
Pages deploy serves them at the site root: `llms.txt`, `llms-full.txt`, `components.json`, plus `/ai/CONSUMING.md` and
`/ai/components/<Name>.md` (the targets of the links in `llms.txt`). The generated `docs/ai` files are not published in the npm package; they live in the repo and on Pages.

Storybook's own native components manifest (`features.componentsManifest` in `.storybook/main.ts`) is also built into
`storybook-static/manifests/components.json`, so Pages serves it at `/manifests/components.json`. It is independent of
`docs/ai/components.json`; CI asserts that it contains a known component.

## Storybook MCP (local only)

`.storybook/main.ts` registers `@storybook/addon-mcp` (docs and dev toolsets). While `npm run storybook` runs, coding agents
can reach `http://127.0.0.1:6006/mcp` (`docs-list`, `docs-show`). The script passes `--host 127.0.0.1`, so the dev server and
its MCP endpoint are not exposed on the network. The published Pages site is static and has no MCP endpoint.
