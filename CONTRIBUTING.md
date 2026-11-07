# Contributing

Thanks for helping. This project is run like any mature open-source library: small pull requests, written decisions, and
accessibility as a gate. By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

## Setup

```bash
nvm use            # Node 24, see .nvmrc
npm ci             # installs dependencies and git hooks
npm run storybook  # http://127.0.0.1:6006
npm run check      # typecheck, lint, stylelint, format, tests, contrast, motion rules
```

Other scripts: `build`, `build-storybook`, `test`, `test:coverage`, `lint`, `lint:css`, `format`, `typecheck`, `contrast`, `verify:motion`, `changeset`.

## Workflow

1. **Discuss first** for anything beyond a small fix. New components, tokens, themes and API changes start as an RFC issue
   (below).
2. **Fork** the repository (or branch, if you have write access) and create a branch named `type/short-topic`, for example
   `feat/empty-state-tone` or `fix/stepper-focus`.
3. **Commit with [Conventional Commits](https://www.conventionalcommits.org)**: `feat:`, `fix:`, `docs:`, `chore:`, `ci:`,
   `build:`, `test:`, `refactor:`, `perf:`, `style:`, `revert:`. A commit-msg hook (commitlint) enforces it. Use `feat!:` or a
   `BREAKING CHANGE:` footer for breaking changes.
4. **Open a pull request** against `main`. The PR title must also follow Conventional Commits (it becomes the squash-merge
   commit message and a CI check enforces it). Fill in the pull request template.
5. **Review.** All required checks must be green and the code owner reviews. Address feedback with new commits; do not
   force-push over a review in progress.
6. **Squash merge.** Merge commits and rebase merges are disabled; history stays linear.

`main` is protected: no direct pushes, no force pushes, required status checks, linear history.

### Required checks

`Verify` (typecheck, lint, stylelint, format, tests with coverage, WCAG contrast, package build, Storybook build),
`PR title`, and `CodeQL`. Run `npm run check` locally to catch most of them before pushing.

## Proposing a component (RFC)

Open a [component request](https://github.com/luizgabriellf/lufia-design-system/issues/new?template=component_request.yml):

- **Problem** it solves and who has it.
- **Use cases** from at least two different apps. One app's need usually belongs in that app.
- **API sketch**: props, slots, states, one usage example. Every user-facing string comes in through props.
- **Accessibility**: the WAI-ARIA Authoring Practices pattern and keyboard behaviour.

The maintainer answers with accept, change, or decline. Accepted RFCs that carry a hard-to-reverse decision get an ADR in
[`docs/adr/`](docs/adr).

## Definition of done

A change that adds or alters a component is done when all of these hold. The pull request template mirrors the list.

- Typed API that follows the rules in [docs/STANDARDS.md](docs/STANDARDS.md): `className` and rest props passed to the root,
  state exposed as `data-*`, no boolean-prop explosion.
- **No app coupling**: no i18n library, router, data layer or app path imports. Strings arrive through props.
- Styles in a CSS Module reading **only** `--lufia-*` semantic tokens. No raw colours (Stylelint enforces it).
- Keyboard behaviour matches the WAI-ARIA pattern and is written in the docs. Focus is always visible (`outline: none`
  without a replacement fails Stylelint).
- Stories for every variant, state and edge case (long text, overflow), with the theme, mode and viewport controls working.
- MDX docs: usage, when to use and not to use, accessibility notes, content guidelines. Build the page with the template in
  `src/docs/blocks/page` (`DocHeader` plus one `Section` each for overview, examples, props, accessibility and guidelines),
  add the component to `src/docs/taxonomy.ts` (its sidebar group, one-line description and WAI-ARIA pattern) and name its
  stories `Components/<Group>/<Name>` (or `Hooks/<Name>`). Add an anatomy figure and a Do and Don't pair for key components.
- Tests with Testing Library and `vitest-axe`, covering behaviour and keyboard. Coverage floor is enforced.
- Works at 320, 390, 768 and 1440 px, in light and dark, and under `forced-colors`.
- A changeset (below) when the published package changes.
- Status label on the docs page (`alpha`, `beta`, `stable`). `stable` additionally needs a recorded screen-reader pass and use
  in at least one app.

## Changesets

Every pull request that changes the published package adds a changeset:

```bash
npm run changeset
```

Pick `patch` (fix), `minor` (feature) or `major` (breaking) and write a one-line, user-facing summary. Commit the generated
file in `.changeset/`. Docs-only and tooling-only changes need none. After merge, the release workflow opens a "Version
packages" pull request that updates `CHANGELOG.md` and `package.json`; merging it tags the release. Because that pull request is opened with `GITHUB_TOKEN`, GitHub does not run CI on it; the
maintainer merges it through the admin bypass on the `main` ruleset (pull-request bypass only). Publishing to npm is
currently on hold, so apps install a git tag.

## Versioning and deprecation

- **Semantic versioning**, strictly. While the version is `0.x`, minor releases may contain breaking changes and say so in the
  changelog.
- **Breaking changes** are majors and ship with a migration note (what changed, before and after, codemod if possible).
- **Deprecations** last at least one minor version. A deprecated export keeps working, is marked `@deprecated` in its JSDoc and
  docs, and logs a one-time warning in development.
- Component maturity (`alpha`, `beta`, `stable`, `deprecated`) is shown in the docs. `alpha` and `beta` may change without a
  major bump, and say so.

## Tokens and themes

Tokens are DTCG JSON in `tokens/` ([ADR 0001](docs/adr/0001-token-format.md)). Edit the JSON, run `npm run tokens`, and run
`npm run contrast`; any text or UI pair below WCAG 2.2 AA fails CI. Brand themes belong in the consuming apps; this package
ships a neutral `default` theme and an `example-brand` theme that demonstrates the API.

## Code style

TypeScript strict, ESLint (React, hooks, jsx-a11y), Prettier and Stylelint are enforced by hooks and CI. Code, comments and
documentation are in English.

## Reporting security issues

Privately, through GitHub Security Advisories. See [SECURITY.md](SECURITY.md).
