# Consuming @lufia/design-system

How to use the package from an application. This is the guide an agent should read before it writes UI with these
components. For one component, read its spec in `docs/ai/components/<Name>.md` (or `components.json` for the typed API).

## Install

npm publishing is on hold. Install from a git tag; the package builds itself on install:

```bash
npm install github:luizgabriellf/lufia-design-system#<latest-tag>
```

Use the latest release tag listed in the changelog. Peer dependencies: React 19 and React DOM 19.

## Set up once, at the root of the app

```tsx
import "@lufia/design-system/tokens.css";
import "@lufia/design-system/themes/default.css";
```

- Light and dark follow `prefers-color-scheme`. Force one with `data-lufia-mode="light"` or `"dark"` on `<html>`.
- Pick a named theme with `data-lufia-theme="<name>"`.
- A brand is a CSS file in the consuming app that defines the semantic `--lufia-color-*` properties (and, optionally,
  `--lufia-font-family-*`). Do not fork components to rebrand.
- Wrap the app in `LufiaProvider` to set the link component (for client-side routing) and the aria-only labels.

```tsx
import { LufiaProvider } from "@lufia/design-system/components/LufiaProvider";
```

## Importing

- Import each component from its own subpath: `@lufia/design-system/components/<Name>`. Hooks live in the same place
  (`@lufia/design-system/components/useDismiss`).
- Motion primitives come from `@lufia/design-system/motion`.
- Token data is available as `@lufia/design-system/tokens` (typed map) and `@lufia/design-system/tokens.json`.
- The root export `@lufia/design-system` re-exports everything, but the subpaths keep bundles small.

## Rules when you use components

- **Every user-facing string is a prop.** The package has no i18n. Translate in the app and pass the result in.
  Examples in the specs use plain English literals only for brevity.
- **No router inside.** Links render through the `linkComponent` given to `LufiaProvider`.
- **Server Components:** static components carry no `"use client"` and work in a Server Component. Interactive ones start with
  `"use client"`; from a Server Component, pass them only serialisable props (event handlers must come from a client
  component).
- **Style with tokens.** Use `--lufia-*` semantic custom properties in your own CSS. Never copy raw colour values and never
  read the primitive palette.
- **Respect status.** `alpha` and `beta` components may change in a minor release before 1.0. Read the changelog when you
  upgrade.
- **Accessibility is part of the API.** Icon-only controls need an accessible name; use `FormField` to wire a label, hint and error to a control;
  tone and colour never carry meaning alone. Follow the keyboard and accessibility notes in each spec.
- **Motion** follows the rules in `docs/MOTION.md`: only `transform` and `opacity`, never over 300 ms in application UI,
  and everything honours `prefers-reduced-motion`. Use the primitives from `@lufia/design-system/motion` instead of
  writing keyframes, and check your own source with the `lufia-verify-motion` CLI.

## Where things are

| Need                         | Read                                                      |
| ---------------------------- | --------------------------------------------------------- |
| Index of everything          | `llms.txt` on the documentation site                      |
| Everything in one file       | `llms-full.txt` on the documentation site                 |
| Typed API of every component | `components.json` (props, types, defaults, status)        |
| One component                | `docs/ai/components/<Name>.md`                            |
| Motion rules                 | `docs/MOTION.md`                                          |
| Live examples                | The Storybook site (the link is in the repository README) |
