# Standards checklist

This file lists what `lufia-design-system` needs in order to meet the bar set by mature public design systems (Shopify Polaris, GitHub Primer, Atlassian, IBM Carbon, Adobe Spectrum, GOV.UK). Every item has a status: `[ ]` todo, `[~]` partial, `[x]` done. Items that need a decision before work starts are marked **DECISION**.

---

## 1. Foundations (design tokens)
- [ ] Tokens written in the **W3C DTCG format** (`tokens/*.tokens.json`) as the single source of truth.
- [ ] **Style Dictionary** build that generates CSS custom properties (`--lufia-*`), a typed TS map, and a JSON file for docs.
- [ ] Three layers:
  - **primitive**: raw palette and scales;
  - **semantic**: `color.surface`, `color.text.muted`, `color.border.danger`, and so on;
  - **component**: optional, only where it earns its place.
  - Components may read only semantic or component tokens, never primitives.
- [ ] **Themes:** light and dark, plus `forced-colors` support (high contrast). **Brand themes:** `salvus` (PT) and `salvflow` (BR) are files inside the package (`themes/salvus.css`, `themes/salvflow.css`), so Storybook can preview both brands. The apps import their own brand theme and stop defining raw values in globals.css.
- [ ] Every scale is documented: color, spacing (4px base), radius, border width, elevation/shadow, z-index layers, breakpoints (320/390/768/1440 as the test widths), opacity.
- [ ] Typography: font-family tokens (each brand loads its own fonts through `next/font`), a type scale, line heights, weights, and fluid sizes where needed.
- [ ] Motion: duration and easing tokens, plus `prefers-reduced-motion` policy (phase P2, ported from salvflow `FLOW_MOTION.md`).
- [ ] Contrast check in CI: every text/background semantic pair meets WCAG 2.2 AA (4.5:1 for body text, 3:1 for large text and UI), in every theme × brand.

## 2. Iconography and assets
- [ ] One icon set. ActionIcons is already identical in both apps. Ship it as tree-shakeable React components with a consistent `size`/`aria-label`/`aria-hidden` API.
- [ ] Icon guidelines: decorative vs. meaningful, sizes, stroke width.

## 3. Components: API conventions
- [ ] One API style guide (`docs/API_CONVENTIONS.md`):
  - prop naming (`variant`, `size`, `tone`, `disabled`, `onOpenChange`);
  - controlled and uncontrolled modes;
  - `className` passthrough and rest props spread onto the root element;
  - `ref` as a prop (React 19);
  - state exposed as `data-*` attributes;
  - no boolean-prop explosion.
- [ ] Every user-facing string comes in through props (i18n stays in the apps). English defaults are allowed only for aria-only text.
- [ ] No app imports (`@/`, next-intl, Supabase, routes). Navigation goes through a `LinkComponent` adapter, set once by a `LufiaProvider`.
- [ ] RSC-safe: static components carry no `"use client"`; interactive ones do. CI checks this by building a tiny Next app.
- [ ] **DECISION:** build the complex widgets (Combobox, Modal/Dialog, Toast, Menu, Popover, Tabs) on an accessibility primitives library, or keep them custom.
  - **Recommendation: React Aria Components.** It is the market standard for strict WAI-ARIA behaviour, has i18n-aware internals and is unstyled. Radix is the alternative.
  - Custom focus-trap and combobox code is where accessibility bugs usually live (see `useFocusTrap`, which has diverged in the two apps).
- [ ] Component status labels: `alpha` / `beta` / `stable` / `deprecated`, shown in docs.

## 4. Accessibility (gate, not nice-to-have)
- [ ] Target **WCAG 2.2 AA**. Every component's keyboard behaviour follows the matching **WAI-ARIA Authoring Practices** pattern, and that behaviour is written in its docs.
- [ ] Automated: axe on every story (Storybook a11y addon) and in the vitest tests (`vitest-axe`). Violations fail CI.
- [ ] Focus-visible styles always present. A lint rule forbids `outline: none` without a replacement.
- [ ] `prefers-reduced-motion`, `forced-colors`, 200% zoom, 320px reflow (WCAG 1.4.10), and target size of at least 24×24 (WCAG 2.5.8).
- [ ] A manual screen-reader pass (VoiceOver + NVDA) before a component is marked `stable`, with a short record of it in the component's docs.
- [ ] Note: the European Accessibility Act (PT) and Brazil's LBI 13.146 may apply to the products. Whether they do is a legal call, not something this package can claim. The package's job is to make conformance achievable.

## 5. Storybook (workbench + docs)
- [ ] Storybook (current major version) with the **React + Vite** framework. The package is framework-agnostic; Next-specific behaviour is tested in the apps.
- [ ] Addons:
  - docs/autodocs: props tables generated from TS;
  - a11y;
  - interactions / Vitest addon, so stories run as tests;
  - themes toolbar: brand × light/dark;
  - viewport presets 320/390/768/1440;
  - backgrounds;
  - measure/outline.
- [ ] Every component has stories for each variant, state (default/hover/focus/disabled/loading/error/empty) and edge case (long pt text, overflow).
- [ ] MDX docs for each component:
  - usage;
  - when to use / when not to use;
  - do and don't;
  - accessibility notes;
  - content guidelines (pt-PT vs pt-BR).
- [ ] Foundations pages: rendered token tables, colour swatches with contrast ratios, type scale, spacing, motion demos.

## 6. Public docs site: GitHub Pages
- [ ] A static Storybook build deployed to **GitHub Pages** by a GitHub Actions workflow on every push to `main` (the repo is public, so Pages and standard runners are free). Optional PR previews.
- [ ] Landing page with getting started, install, theming guide, changelog and contribution guide.
- [ ] Caveat: the account's Actions billing issue made private-repo runs fail (salvus CI). Verify the first workflow run on this public repo before relying on it.

## 7. Testing and quality
- [ ] TypeScript `strict`, ESLint (react, jsx-a11y, react-hooks), Prettier, Stylelint for the CSS modules.
- [ ] Unit/interaction tests: vitest + Testing Library + user-event, and a coverage floor for the package.
- [ ] **Visual regression:** Playwright screenshots of every story × brand × theme, compared in CI. This is free; Chromatic is the paid alternative.
- [ ] A smoke-test app in CI (minimal Next 15 app) that imports the built package, which proves that RSC, CSS import and tree-shaking work.
- [ ] Bundle budget with `size-limit` per entry point.

## 8. Packaging and release
- [ ] **Build step** (tsup/tsdown) producing ESM, `.d.ts` and extracted CSS, with per-component entry points and `sideEffects` limited to CSS. This replaces the "ship TS source" bootstrap mode.
- [x] **Distribution channel (decided 2026-11-05): public npm as `@lufia/design-system`.**
  - The `@lufia` scope leaves room for `@lufia/tokens`, `@lufia/icons` and so on.
  - The owner creates the free npm org `lufia` and configures **trusted publishing** (GitHub Actions OIDC, no long-lived token) for this repo.
  - The first publish happens at the end of P0, once the build step exists.
- [ ] **Changesets** for versioning and the generated CHANGELOG. Semver is strict:
  - breaking changes are majors and come with a migration guide;
  - deprecations last at least one minor version with a console warning in dev.
- [ ] Release workflow: on merge to main, changesets opens a "Version packages" PR, and merging it publishes and tags.

## 9. Adoption in the apps
- [ ] Each app imports `lufia-design-system/themes/<brand>.css` + `tokens.css` once at the root layout.
- [ ] i18n wrappers in each app (`components/ds/*`) that call `useTranslations` and pass strings into the package components.
- [ ] Lint rule (`no-restricted-imports`) blocking new imports from the legacy `components/ui/<migrated>`. Delete each legacy file as soon as it is migrated.
- [ ] Before/after screenshot sweep at 4 widths in both apps for each migration. In Salvus, recapture `public/marketing/*.webp` in the same commit when a visible UI change happens.
- [ ] Adoption tracker in the docs: which component and version each app uses.

## 10. Governance
- [ ] `CONTRIBUTING.md` covering:
  - how to propose a component (a short RFC issue: problem, both apps' use cases, API sketch);
  - definition of done = this checklist's per-component items.
- [ ] `CODEOWNERS`, PR template with an a11y/visual/docs checklist, issue templates (bug, component request).
- [ ] ADRs in `docs/adr/` for the big calls (primitives library, distribution channel, token format).
- [ ] Renovate/Dependabot, `SECURITY.md`, MIT `LICENSE` (done), no secrets ever (public repo).

## 11. Design tooling (optional)
- [ ] If a Figma library is ever used: tokens sync from DTCG JSON (Tokens Studio), so code stays the source of truth.

---

## Per-component definition of done
A component is `stable` only when all of these hold:
- typed API following the conventions;
- stories covering every state, brand and theme;
- MDX docs;
- tests with axe passing;
- keyboard spec passing;
- screen-reader pass recorded;
- visual baseline;
- responsive at 4 widths;
- used in at least one app.
