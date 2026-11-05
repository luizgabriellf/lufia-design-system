<!--
Thanks for contributing to @lufia/design-system!

PR title: use Conventional Commits, e.g. `feat(modal): add size prop` or `fix(toast): announce politely`.
Specialised templates: append `?template=component.md`, `?template=bugfix.md` or `?template=docs.md` to the "compare" URL.
-->

## What

<!-- One or two sentences on what this PR changes. -->

## Why

<!-- The problem it solves. Link the issue/RFC: "Closes #123". -->

## How

<!-- Notable implementation choices, trade-offs, and alternatives considered. -->

## Type of change

- [ ] `feat`: new component, prop or token (minor)
- [ ] `fix`: bug fix (patch)
- [ ] `docs`: documentation or Storybook only
- [ ] `refactor` / `chore` / `ci` / `build` / `test`: no user-facing change
- [ ] **Breaking change** (major). The migration notes are below.

## How it was tested

<!-- Commands run, browsers or devices used, screen readers tried. -->

## Screenshots / Storybook

<!-- Before/after for any visual change. Link the stories that changed. -->

## Checklist

- [ ] PR title follows Conventional Commits
- [ ] A changeset is added (`npx changeset`), or the PR has no user-facing change
- [ ] Typecheck, lint, stylelint, tests and contrast check pass locally
- [ ] Stories cover the changed states, in every theme (light, dark, example-brand)
- [ ] The Storybook a11y panel and vitest-axe show no violations
- [ ] Keyboard behaviour follows the WAI-ARIA APG pattern, and focus is visible
- [ ] Works at 320 / 390 / 768 / 1440 widths and at 200% zoom
- [ ] `prefers-reduced-motion` and `forced-colors` are respected
- [ ] No hard-coded user-facing strings (they come in through props) and no app-specific imports
- [ ] Only `--lufia-*` semantic tokens are used, no raw values
- [ ] Docs (MDX) are updated

## Breaking changes / migration notes

<!-- Delete if not applicable. Say what consumers must change, with a before/after snippet. -->
