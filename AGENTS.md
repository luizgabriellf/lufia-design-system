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

| Path                     | What is there                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------------- |
| `src/components/<Name>/` | A component: `<Name>.tsx`, CSS Module, stories, test, MDX page and an index barrel       |
| `src/motion/<Name>/`     | Motion primitives, same layout as a component                                            |
| `src/index.ts`           | Root export; one `export *` line per component directory                                 |
| `src/docs/taxonomy.ts`   | Category, one-line summary and WAI-ARIA pattern of every component (single source)       |
| `src/docs/blocks/`       | Storybook doc page template (`DocHeader`, `Section`, anatomy and Do/Don't figures)       |
| `src/cli/verify-motion/` | The `lufia-verify-motion` CLI                                                            |
| `tokens/`                | DTCG token source; `npm run tokens` builds CSS, TS and JSON into `src/tokens/generated/` |
| `docs/`                  | the standards, motion and roadmap docs, `docs/adr/`, and the AI layer in `docs/ai/`      |
| `scripts/`               | Token build, contrast check, postbuild; `scripts/ai/` builds the AI layer                |
| `.storybook/`            | Storybook config and docs theme                                                          |
| `.github/workflows/`     | CI, Storybook Pages deploy, release, PR title check, CodeQL                              |
| `.changeset/`            | Pending release notes                                                                    |

## Commands

```bash
nvm use                      # Node version from .nvmrc
npm ci                       # install and set up git hooks
npm run storybook            # http://localhost:6006
npm run check                # the gate ladder below, minus build and build-storybook
npm run build:ai-docs        # regenerate docs/ai (manifest, specs, llms files)
```

Run heavy commands one at a time; `build` and `build-storybook` are memory hungry.

## Gate ladder

Run in this order and stop at the first failure. `npm run check` runs 1 to 7 and 9, CI adds coverage, 10 and 11.

1. `npm run typecheck` (builds tokens, then `tsc --noEmit`)
2. `npm run lint` (ESLint with React, hooks, jsx-a11y)
3. `npm run lint:css` (Stylelint: no raw colours, no `outline: none` without a replacement)
4. `npm run format:check` (Prettier; `npm run format` fixes)
5. `npm run test` (Vitest, Testing Library, vitest-axe)
6. `npm run contrast` (WCAG 2.2 AA for every text and UI pair, every theme and mode)
7. `npm run verify:motion` (motion rules over `src`)
8. `npm run build` (tsup plus type declarations)
9. `npm run verify:ai-docs` (AI layer is not stale; see `docs/ai/README.md`)
10. `npm run build-storybook` (also publishes the llms files into `storybook-static`)
11. `npm run test:coverage` (floor enforced in `vitest.config.ts`)

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
- **Status labels.** Every component page declares `alpha`, `beta` or `stable` in its `DocHeader`.

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

## Where to look: task to doc

| Task                                  | Read first                                                                                          |
| ------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Use a component in an app             | `docs/ai/CONSUMING.md`, then `docs/ai/components/<Name>.md`                                         |
| Find a component or its typed props   | `docs/ai/components.json`, `docs/ai/llms.txt`                                                       |
| Add or change a component             | "Adding or changing a component" above, `CONTRIBUTING.md` (definition of done), `docs/STANDARDS.md` |
| Add or change a token or theme        | `tokens/`, `docs/adr/0001-token-format.md`, then `npm run tokens` and `npm run contrast`            |
| Add or change motion                  | `docs/MOTION.md`, `src/motion/`, `npm run verify:motion`                                            |
| Write or fix stories and docs pages   | `src/docs/blocks/`, `src/docs/taxonomy.ts`, an existing `.mdx` of the same shape                    |
| Change distribution or exports        | `docs/adr/0002-distribution.md`, `package.json` `exports`, `tsup.config.ts`                         |
| Why widgets are custom, not a library | `docs/adr/0003-primitives-library.md`                                                               |
| Cut or understand a release           | "Release process" above, `.changeset/`, `.github/workflows/release.yml`                             |
| Change CI or the Pages deploy         | `.github/workflows/ci.yml`, `.github/workflows/pages.yml`                                           |
| Change the AI layer itself            | `docs/ai/README.md`, `scripts/ai/`                                                                  |
| Security, conduct, governance         | `SECURITY.md`, `CODE_OF_CONDUCT.md`, `GOVERNANCE.md`                                                |

## Keeping this file true

`npm run verify:ai-docs` fails when a path or an `npm run` script named in this file does not exist. When you add, move or
rename files, commands or components, update this file and `docs/ai/` in the same change.
