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
- [ ] **Themes:** light and dark, plus `forced-colors` support (high contrast). The package ships a neutral `default` theme and an `example-brand` theme that demonstrates the theming API in Storybook. Brand themes belong to the consuming apps, which map their values onto the semantic tokens.
- [ ] Every scale is documented: color, spacing (4px base), radius, border width, elevation/shadow, z-index layers, breakpoints (320/390/768/1440 as the test widths), opacity.
- [ ] Typography: font-family tokens (each brand loads its own fonts through `next/font`), a type scale, line heights, weights, and fluid sizes where needed.
- [x] Motion: duration, easing and distance tokens, plus the `prefers-reduced-motion` policy (phase P2). Rules in [MOTION.md](MOTION.md); tokens collapse under reduced motion and `lufia-verify-motion` runs in `npm run check`.
- [ ] Contrast check in CI: every text/background semantic pair meets WCAG 2.2 AA (4.5:1 for body text, 3:1 for large text and UI), in every theme.

## 2. Iconography and assets
- [x] One icon set, owned by the package (geometry adapted from Lucide, ISC; notice in `THIRD_PARTY_NOTICES.md`), shipped as tree-shakeable React components from `@lufia/design-system/icons`: one 24-unit grid, `currentColor` strokes with round caps and joins, stroke from `--lufia-icon-stroke` (`--lufia-icon-stroke-sm` at the small size), sizes `sm`/`md`/`lg` from `--lufia-icon-size-*` plus `1em`, decorative by default and named by `title` or `aria-label`.
- [x] Icon guidelines: the Icons foundation page (grid, stroke, sizes, decorative vs. meaningful, `createIcon` for an app's own glyphs, the status icons).
- [x] **Rule: no hand-drawn inline SVG icons in components, and no text glyphs (multiplication sign, check marks, arrows) as icons.** Use a named icon, `StatusIcon` for a status, or `createIcon` for a glyph the set lacks. ESLint enforces it in `src/components` and `src/motion` (`no-restricted-syntax`; charts such as `Sparkline` are exempt, and so are tests and stories).
- [x] One status family: `StatusIcon` (`success`, `warning`, `danger`, `info`, `pending`, `neutral`, `needsInput`), each tone a distinct shape so it reads without colour. Every status marker in the package uses it.

## 3. Components: API conventions
- [ ] One API style guide (`docs/API_CONVENTIONS.md`):
  - prop naming (`variant`, `size`, `tone`, `disabled`, `onOpenChange`);
  - controlled and uncontrolled modes;
  - `className` passthrough and rest props spread onto the root element;
  - `ref` as a prop (React 19);
  - state exposed as `data-*` attributes;
  - no boolean-prop explosion.
- [~] Every user-facing string comes in through props (i18n stays in the apps). English defaults are allowed only for aria-only text. (Holds for everything shipped so far; aria-only defaults live in `LufiaProvider` `labels`.)
- [~] No app imports (`@/`, next-intl, Supabase, routes). Navigation goes through a `LinkComponent` adapter, set once by a `LufiaProvider`. (`LufiaProvider`, `useLufia` and `LufiaLink` exist; navigation components that consume them come next.)
- [~] RSC-safe: static components carry no `"use client"`; interactive ones do. CI checks this by building a tiny Next app. (`npm run test:consumer:next` renders `Switch` from a Server Component and `LufiaProvider` from a server layout, and fails without `"use client"`; only these two components are covered so far.)
- [x] **DECISION (ADR 0003):** the complex widgets (Combobox, Modal/Dialog, Toast, Menu, Popover, Tabs) stay custom, hardened with tests against the WAI-ARIA APG patterns. Revisit React Aria if maintenance cost grows.
  - Custom focus-trap and combobox code is where accessibility bugs usually live, so each widget needs its keyboard table in the docs and its keyboard tests.
- [ ] Component status labels: `alpha` / `beta` / `stable` / `deprecated`, shown in docs.

## 4. Accessibility (gate, not nice-to-have)
- [ ] Target **WCAG 2.2 AA**. Every component's keyboard behaviour follows the matching **WAI-ARIA Authoring Practices** pattern, and that behaviour is written in its docs.
- [ ] Automated: axe on every story (Storybook a11y addon) and in the vitest tests (`vitest-axe`). Violations fail CI.
- [ ] Focus-visible styles always present. A lint rule forbids `outline: none` without a replacement.
- [ ] `prefers-reduced-motion`, `forced-colors`, 200% zoom, 320px reflow (WCAG 1.4.10), and target size of at least 24×24 (WCAG 2.5.8).
- [ ] A manual screen-reader pass (VoiceOver + NVDA) before a component is marked `stable`, with a short record of it in the component's docs.
- [ ] Note: accessibility laws (e.g. the European Accessibility Act) may apply to consuming products. Whether a law applies is a legal call, not something this package can claim. The package's job is to make conformance achievable.

## 5. Storybook (workbench + docs)
- [ ] Storybook (current major version) with the **React + Vite** framework. The package is framework-agnostic; Next-specific behaviour is tested in the apps.
- [ ] Addons:
  - docs/autodocs: props tables generated from TS;
  - a11y;
  - interactions / Vitest addon, so stories run as tests;
  - themes toolbar: theme × light/dark;
  - viewport presets 320/390/768/1440;
  - backgrounds;
  - measure/outline.
- [ ] Every component has stories for each variant, state (default/hover/focus/disabled/loading/error/empty) and edge case (long pt text, overflow).
- [ ] MDX docs for each component:
  - usage;
  - when to use / when not to use;
  - do and don't;
  - accessibility notes;
  - content guidelines (including locale variants).
- [ ] Foundations pages: rendered token tables, colour swatches with contrast ratios, type scale, spacing, motion demos.

## 6. Public docs site: GitHub Pages
- [ ] A static Storybook build deployed to **GitHub Pages** by a GitHub Actions workflow on every push to `main` (the repo is public, so Pages and standard runners are free). Optional PR previews.
- [ ] Landing page with getting started, install, theming guide, changelog and contribution guide.

## 7. Testing and quality
- [ ] TypeScript `strict`, ESLint (react, jsx-a11y, react-hooks), Prettier, Stylelint for the CSS modules.
- [ ] Unit/interaction tests: vitest + Testing Library + user-event, and a coverage floor for the package.
- [ ] **Visual regression:** Playwright screenshots of every story × theme, compared in CI. This is free; Chromatic is the paid alternative.
- [~] A smoke-test app in CI (minimal Next 15 app) that imports the built package, which proves that RSC, CSS import and tree-shaking work. (The `consumer` job uses Next 16 and proves RSC and CSS import from the packed tarball; tree-shaking is not asserted yet.)
- [ ] Bundle budget with `size-limit` per entry point.

## 8. Packaging and release
- [ ] **Build step** (tsup/tsdown) producing ESM, `.d.ts` and extracted CSS, with per-component entry points and `sideEffects` limited to CSS. This replaces the "ship TS source" bootstrap mode.
- [ ] **Distribution channel: public npm as `@lufia/design-system`. ON HOLD.** Until it is lifted, apps install a git tag: `"@lufia/design-system": "github:luizgabriellf/lufia-design-system#vX.Y.Z"`.
  - The `@lufia` scope leaves room for `@lufia/tokens`, `@lufia/icons` and so on.
  - The owner creates the free npm org `lufia` and configures **trusted publishing** (GitHub Actions OIDC, no long-lived token) for this repo.
  - The first publish happens at the end of P0, once the build step exists.
- [ ] **Changesets** for versioning and the generated CHANGELOG. Semver is strict:
  - breaking changes are majors and come with a migration guide;
  - deprecations last at least one minor version with a console warning in dev.
- [ ] Release workflow: on merge to main, changesets opens a "Version packages" PR, and merging it tags the release (publishing to npm is on hold; apps install a git tag).

## 9. Adoption in consuming apps
- [ ] Each app imports `@lufia/design-system/tokens.css` plus its own brand theme once at the root layout.
- [ ] i18n wrappers in each app (`components/ds/*`) that call `useTranslations` and pass strings into the package components.
- [ ] Lint rule (`no-restricted-imports`) blocking new imports from the legacy `components/ui/<migrated>`. Delete each legacy file as soon as it is migrated.
- [ ] Before/after screenshot sweep at 4 widths in consuming apps for each migration.
- [ ] Adoption tracker in the docs: which component and version each app uses.

## 10. Governance
- [ ] `CONTRIBUTING.md` covering:
  - how to propose a component (a short RFC issue: problem, consuming apps' use cases, API sketch);
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
- stories covering every state and theme;
- MDX docs;
- tests with axe passing;
- keyboard spec passing;
- screen-reader pass recorded;
- visual baseline;
- responsive at 4 widths;
- used in at least one app.
