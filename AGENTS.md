# AGENTS.md

Instructions for coding agents working in this repository. It is the canonical file: `CLAUDE.md`, the Copilot file and the
Cursor rule all point here. Humans should start with `README.md` and `CONTRIBUTING.md`.

`@lufia/design-system` is a public, product-agnostic React 19 design system: design tokens, accessible components and
motion primitives, consumed by several applications.

## Hard rules

1. **Public repository hygiene.** Never name or identify the consuming applications, their product domains, internal paths,
   customers, brand values copied verbatim, or audit numbers: not in code, docs, stories, commit messages, branch names,
   PRs or issues. Write "consuming apps". Brand themes belong in the apps, never here.
2. **No AI or tool attribution** in commits, PR bodies or release notes (no `Co-Authored-By`, no session links).
3. **Never bypass the hooks** (`--no-verify`). Fix what they report.
4. **Do not hand-edit generated files**: `docs/ai/components/`, `docs/ai/components.json`, `docs/ai/llms.txt`,
   `docs/ai/llms-full.txt`, `src/tokens/generated/`, `dist/`. Change the source and regenerate.

## Repo map

| Path                     | What is there                                                                                              |
| ------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `src/components/<Name>/` | A component: `<Name>.tsx`, CSS Module, stories, test, MDX page and an index barrel                         |
| `src/motion/<Name>/`     | Motion primitives, same layout as a component                                                              |
| `src/index.ts`           | Root export; one `export *` line per component directory                                                   |
| `src/docs/taxonomy.ts`   | Category, one-line summary and WAI-ARIA pattern of every component (single source)                         |
| `src/docs/blocks/`       | Storybook doc page template (`DocHeader`, `Section`, anatomy and Do/Don't figures)                         |
| `src/cli/verify-motion/` | The `lufia-verify-motion` CLI                                                                              |
| `src/cli/lufia-ai.js`    | The shipped `lufia-ai` bin; `src/cli/lufia-ai/` holds the lookup core and the stdio MCP server (plain ESM) |
| `tokens/`                | DTCG token source; `npm run tokens` builds CSS, TS and JSON into `src/tokens/generated/`                   |
| `docs/`                  | the standards, motion and roadmap docs, `docs/adr/`, and the AI layer in `docs/ai/`                        |
| `scripts/`               | Token build, contrast check, postbuild; `scripts/ai/` builds the AI layer and holds the `ai:*` query CLI   |
| `tests/browser/`         | Playwright specs that drive the Storybook stories in real browsers                                         |
| `tests/consumer/`        | Fixture apps that consume the packed package; `scripts/check-next-consumer.mjs` runs the Next.js one       |
| `.storybook/`            | Storybook config and docs theme                                                                            |
| `.github/workflows/`     | CI, Storybook Pages deploy, release, PR title check, CodeQL                                                |
| `.changeset/`            | Pending release notes                                                                                      |

## Commands

```bash
nvm use                      # Node version from .nvmrc
npm ci                       # install and set up git hooks
npm run storybook            # http://127.0.0.1:6006 (bound to loopback; also serves the MCP endpoint)
npm run check                # the gate ladder below, minus build and build-storybook
npm run check:static         # npm run check without the unit tests (CI runs it, then test:coverage)
npm run test:browser         # Playwright (Chromium, WebKit) against Storybook; docs/PLAYWRIGHT.md
npm run verify:package       # publint plus are-the-types-wrong on the packed package (needs npm run build first)
npm run verify:size          # gzip budget per entry from .size-limit.json (needs npm run build first)
npm run verify:changeset     # published source changed without a new changeset? (pull requests; needs BASE_REF)
npm run test:consumer:next   # pack the build, install it in a Next.js app, assert SSR (needs npm run build first)
npm run build:ai-docs        # regenerate docs/ai (manifest, specs, llms files)
npm run ai:search -- "task"  # find components for a UI task (read-only; ai:show -- Name, ai:list)
node dist/cli/lufia-ai.js mcp # the shipped lookup MCP server (needs npm run build first; consumers run `npx --no-install lufia-ai`)
```

Run heavy commands one at a time; `build` and `build-storybook` are memory hungry.

## Gate ladder

Run in this order and stop at the first failure. `npm run check` runs 1 to 7 and 9, CI also runs 8 (build), 10 (build-storybook), 11 (coverage), 12 (Next.js consumer smoke) and 13 (browser tests). CI runs `check:static` plus `test:coverage` so the unit tests run once, and adds `verify:package` and `verify:size` (after 8), the changeset check and the dependency review (pull requests).

1. `npm run typecheck` (builds tokens, then `tsc --noEmit`)
2. `npm run lint` (ESLint with React, hooks, jsx-a11y)
3. `npm run lint:css` (Stylelint: no raw colours, no `outline: none` without a replacement)
4. `npm run format:check` (Prettier; `npm run format` fixes)
5. `npm run test` (Vitest, Testing Library, vitest-axe)
6. `npm run contrast` (WCAG 2.2 AA for every text and UI pair, every theme and mode)
7. `npm run verify:motion` (motion rules over `src`)
8. `npm run build` (tsup plus type declarations)
9. `npm run verify:ai-docs` (AI layer is not stale and leaks no denylisted identifier when a denylist is configured; see `docs/ai/README.md`)
10. `npm run build-storybook` (also publishes the llms files into `storybook-static`)
11. `npm run test:coverage` (floor enforced in `vitest.config.ts`)
12. `npm run test:consumer:next` (after `build`; the `consumer` CI job; packed package in a Next.js 16 App Router app)
13. `npm run test:browser` (Playwright in Chromium and WebKit; CI only, see `docs/PLAYWRIGHT.md`)

## CI

`.github/workflows/ci.yml` builds the package and Storybook once, in `verify`. Every job installs with
`LUFIA_SKIP_PREPARE_BUILD=1`, which stops `scripts/prepare.mjs` from building `dist/` during `npm ci`; `verify` then builds
it in its explicit steps. `verify` runs the static gates, coverage, the build, `verify:package` (`scripts/verify-package.mjs`:
publint, then are-the-types-wrong with `--profile esm-only`, every `dist/components/<Name>` subpath passed explicitly because
attw does not expand the wildcard export; the four asset entrypoints without types are excluded by name), `verify:size` (gzip
budgets in `.size-limit.json`, about 10% above measured; raise one only with a reason) and the Storybook build, then uploads
`dist/` and `storybook-static/` as artifacts. `consumer` (Next.js smoke) and `browser` (Playwright) need `verify` and download
them; Playwright serves the built Storybook with `scripts/serve-static.mjs` in CI or with `PW_STATIC=1`, and runs
`storybook dev` otherwise. Pull requests also run `changeset` (`scripts/check-changeset.mjs`: published source, tokens, build
inputs and shipped `package.json` fields need a changeset; release and dependency-bot branches from this repository are
exempt) and `dependency-review` (fails at moderate severity). The `gate` job (`CI gate`) needs all of them and fails unless
each succeeded or was skipped by design. Branch protection is the owner's: until the owner runs
`scripts/setup-repo-settings.sh`, which requires `CI gate`, `Conventional Commits title` and `Analyze`, the required check is
still `Verify`.

## Package rules

- **No i18n and no app imports.** No `@/` paths, next-intl, router, data layer or app routes. Navigation goes through the
  `LufiaProvider` link adapter. Every user-facing string is a prop; an English default is allowed only for aria-only text
  (those live in `LufiaProvider` `labels`).
- **Tokens only.** Styles read `--lufia-*` semantic tokens, never raw values and never primitives. Tokens are DTCG JSON in
  `tokens/`.
- **CSS Modules**, no runtime CSS-in-JS. Sizes in `rem`; layout in logical properties (`margin-inline`, `padding-block`,
  `inset-inline-start`), so right-to-left works.
- **RSC safety.** Static components carry no `"use client"`. Add it only to components that use state, effects, refs to the
  DOM or event handlers they own.
- **API conventions.** `className` and rest props go to the root element, `ref` is a prop (React 19), state is exposed as
  `data-*` attributes, no boolean-prop explosion. Props carry JSDoc: it feeds the manifest.
- **Accessibility is a gate.** Every component has a vitest-axe test, keyboard behaviour that follows the WAI-ARIA pattern,
  visible focus, and works at 320 / 390 / 768 / 1440 px, at 200% zoom, in light and dark, and under `forced-colors`.
- **Reduced motion.** Honour `prefers-reduced-motion`; animate only `transform` and `opacity`; nothing over 300 ms. Rules in
  `docs/MOTION.md`.
- **Status labels.** Every component page declares `alpha`, `beta`, `stable` or `deprecated` in its `DocHeader`.

## Adding or changing a component

1. Write the component, CSS Module, stories (`Components/<Group>/<Name>` or `Hooks/<Name>`), tests and MDX page. Copy the
   nearest existing component of the same shape (for a form control, `src/components/TextInput`; for an overlay,
   `src/components/Modal`).
2. Register it in `src/docs/taxonomy.ts` and add an `export *` line to `src/index.ts` (or `src/motion/index.ts`).
3. Put JSDoc on every prop; write the MDX sections "Usage", "When to use", "When not to use", "Keyboard" (when interactive),
   "Accessibility".
4. Run `npm run build:ai-docs` and commit the regenerated `docs/ai/` files in the same change.
5. Add a changeset: `npm run changeset`.

## Release process

Changesets drive releases. Every PR that changes the published package adds a changeset (patch, minor or major). After merge
to `main`, the release workflow opens a "Version packages" PR that bumps `package.json` and `CHANGELOG.md`; merging it creates the
git tag. npm publishing is on hold: consuming apps install a git tag. Do not publish, tag or edit the version by hand.
Docs-only and tooling-only changes need no changeset.

## Pull requests

- Branch named like type/short-topic; Conventional Commits (`feat`, `fix`, `docs`, `chore`, `ci`, `build`, `test`, `refactor`, `perf`,
  `style`, `revert`), header at most 72 characters, English. `!` or a `BREAKING CHANGE:` footer for breaking changes.
- The PR title also follows Conventional Commits (a CI check enforces it; it becomes the squash commit).
- Use `.github/pull_request_template.md`, or the specialised ones in `.github/PULL_REQUEST_TEMPLATE/`.
- Describe the change product-agnostically (hard rule 1). `main` is protected; squash merge only.

## Agent-first component discovery

Before writing or changing UI that uses Lufia, **look up its actual API**:

1. Run `npm run ai:search -- "describe the UI task"` to find matching components.
2. Run `npm run ai:show -- ComponentName` (`--json` for structured output) for exact imports, props, examples, accessibility and Storybook references.
3. Use the documented import subpath. Never invent props, aliases, behavior or component names based on another library. Check the real source when a native inherited prop is not listed.
4. Use semantic tokens, the documented provider and typed APIs, and test the resulting UI rather than trusting generated code. Refer to `docs/ai/CONSUMING.md` for integration instructions.

The lookup is local, read-only and generated from `docs/ai/components.json`. Consuming apps get the same lookup, matched to the installed version, from `npx --no-install lufia-ai` (and `npx --no-install lufia-ai mcp`); both run `src/cli/lufia-ai/core.js`. It does not replace TypeScript checks, Storybook stories or accessibility tests. Storybook also exposes a separate native component manifest when built.

When Storybook is running locally, coding agents may also use its MCP endpoint (`http://127.0.0.1:6006/mcp`; the dev server is bound to loopback only). Query `docs-list` and `docs-show` before using component APIs; do not assume a missing prop exists. The published GitHub Pages site has static manifests, **not** a live MCP endpoint.

## Where to look: task to doc

| Task                                    | Read first                                                                                               |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Use a component in an app               | `docs/ai/CONSUMING.md`, then `docs/ai/components/<Name>.md`                                              |
| Find a component or its typed props     | `docs/ai/components.json`, `docs/ai/llms.txt`                                                            |
| Change the `lufia-ai` CLI or MCP server | `src/cli/lufia-ai/core.js`, `scripts/ai/lufia-ai.test.mjs`, `scripts/postbuild.mjs`, `docs/ai/README.md` |
| Add or change a component               | "Adding or changing a component" above, `CONTRIBUTING.md` (definition of done), `docs/STANDARDS.md`      |
| Add or change a token or theme          | `tokens/`, `docs/adr/0001-token-format.md`, then `npm run tokens` and `npm run contrast`                 |
| Add or change motion                    | `docs/MOTION.md`, `src/motion/`, `npm run verify:motion`                                                 |
| Write or fix stories and docs pages     | `src/docs/blocks/`, `src/docs/taxonomy.ts`, an existing `.mdx` of the same shape                         |
| Change distribution or exports          | `docs/adr/0002-distribution.md`, `package.json` `exports`, `tsup.config.ts`                              |
| Why widgets are custom, not a library   | `docs/adr/0003-primitives-library.md`                                                                    |
| Cut or understand a release             | "Release process" above, `.changeset/`, `.github/workflows/release.yml`                                  |
| Write or fix browser (Playwright) tests | `docs/PLAYWRIGHT.md`, `tests/browser/`, `playwright.config.ts`                                           |
| Change CI or the Pages deploy           | `.github/workflows/ci.yml` (jobs `verify`, `consumer`, `browser`, `gate`), `.github/workflows/pages.yml` |
| Package exports, types or size budgets  | `package.json` `exports`, `npm run verify:package`, `.size-limit.json`, `npm run verify:size`            |
| Change the AI layer itself              | `docs/ai/README.md`, `scripts/ai/`                                                                       |
| Security, conduct, governance           | `SECURITY.md`, `CODE_OF_CONDUCT.md`, `GOVERNANCE.md`                                                     |

## Leak gate

`npm run verify:ai-docs` also runs `scripts/ai/verify-leaks.mjs`, which scans the path and the content of every tracked
file, plus `dist/` when it exists, for identifiers of the consuming apps (hard rule 1). Only files with a known binary
extension (images, fonts, archives, PDF, video) are skipped; everything else is scanned, in chunks when large.

The denylist is **never stored in the repository**, not even hashed. It is read from the `LUFIA_LEAK_TOKENS` environment
variable (one word per line, or comma-separated) or, when that is unset or blank, from the file
`~/.config/lufia/leak-tokens` (one word per line). A word matches ignoring case and diacritics, across camelCase,
acronym and letter/digit boundaries, and with up to four adjacent words joined (`foo-bar` matches `fooBar` and `foobar`).
It matches whole words, not a part of a longer word.

With no list configured the gate prints "verify:leaks skipped (no denylist configured)" and exits 0, as a `::warning::`
annotation in GitHub Actions, so configure it locally. CI scans again after `npm run build`, reading the list from the
repository secret `LUFIA_LEAK_TOKENS`; pull requests from forks have no secret and only warn. Making a missing list fail
CI is a follow-up. A failure prints the file, the line and the token's position in the list, never the token. To add one,
append the word to the local file and update the secret; never write it in a file, a commit message or a PR.

## Keeping this file true

`npm run verify:ai-docs` fails when a path or an `npm run` script named in this file does not exist. When you add, move or
rename files, commands or components, update this file and `docs/ai/` in the same change.
