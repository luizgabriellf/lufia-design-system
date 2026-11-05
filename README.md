# @lufia/design-system

[![CI](https://github.com/luizgabriellf/lufia-design-system/actions/workflows/ci.yml/badge.svg)](https://github.com/luizgabriellf/lufia-design-system/actions/workflows/ci.yml)
[![Storybook](https://github.com/luizgabriellf/lufia-design-system/actions/workflows/pages.yml/badge.svg)](https://luizgabriellf.github.io/lufia-design-system/)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/luizgabriellf/lufia-design-system/badge)](https://scorecard.dev/viewer/?uri=github.com/luizgabriellf/lufia-design-system)
[![CodeQL](https://github.com/luizgabriellf/lufia-design-system/actions/workflows/codeql.yml/badge.svg)](https://github.com/luizgabriellf/lufia-design-system/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Conventional Commits](https://img.shields.io/badge/commits-conventional-fe5196.svg)](https://www.conventionalcommits.org)

An accessible, themeable React design system: design tokens, components and the quality gates that keep them consistent
across products.

**[Browse the Storybook](https://luizgabriellf.github.io/lufia-design-system/)** for every component, token and
accessibility note.

> **Status: pre-1.0.** Components are labelled `alpha`, `beta` or `stable` in the docs. Expect minor releases to change APIs
> until 1.0; changes are listed in the [changelog](CHANGELOG.md).

## What's inside

- **Design tokens** in the W3C DTCG format, built with Style Dictionary into `--lufia-*` CSS custom properties, a typed
  TypeScript map and JSON. Primitive and semantic layers, light, dark and `forced-colors`.
- **Components** in React 19, styled with CSS Modules that read only semantic tokens, safe for Server Components. Every
  user-facing string is a prop, so the package carries no i18n of its own.
- **Accessibility as a gate**: WCAG 2.2 AA contrast checked in CI for every theme and mode, `vitest-axe` on every component,
  keyboard behaviour documented per component.
- **Storybook** with theme, mode and viewport (320 / 390 / 768 / 1440) controls, deployed to GitHub Pages after CI passes on `main`
  (Pages is enabled by `scripts/setup-repo-settings.sh`).

## Install

npm publishing is on hold. Until then, install from git (the package builds itself on install). The `v0.1.0` tag exists after the
first release; until then use `#main`:

```bash
npm install github:luizgabriellf/lufia-design-system#main   # or #v0.1.0 once released
```

Peer dependencies: React 19 and React DOM 19. Requires Node 22 or newer to build.

## Theming quick start

Import the tokens and one theme once at the root of your app, then use components:

```tsx
// app/layout.tsx
import "@lufia/design-system/tokens.css";
import "@lufia/design-system/themes/default.css";
```

```tsx
import { EmptyState } from "@lufia/design-system/components/EmptyState";

<EmptyState title="No documents yet" body="Documents you upload will appear here." />;
```

- Light and dark follow `prefers-color-scheme`; force one with `data-lufia-mode="light|dark"` on `<html>`.
- Select a named theme with `data-lufia-theme="example-brand"`.
- **Your brand lives in your app**: define the semantic `--lufia-color-*` properties for your own theme (and override
  `--lufia-font-family-*`). See "Creating a theme" in Storybook, or [`tokens/themes/`](tokens/themes) for a worked example.

## Principles

1. **Accessibility is a gate**, not a polish pass.
2. **Semantic tokens only.** Components never read raw palette values, so a brand is a file, not a fork.
3. **No app imports.** No router, i18n or data layer inside a component; apps inject them.
4. **Small and boring.** Each component earns its place by being needed in more than one app.

## Project

- [Roadmap](docs/ROADMAP.md) and [standards checklist](docs/STANDARDS.md)
- [Architecture decision records](docs/adr)
- [Contributing](CONTRIBUTING.md) (workflow, RFCs, definition of done, changesets) and [governance](GOVERNANCE.md)
- [Code of conduct](CODE_OF_CONDUCT.md), [security policy](SECURITY.md), [support](SUPPORT.md)

## License

[MIT](LICENSE)
