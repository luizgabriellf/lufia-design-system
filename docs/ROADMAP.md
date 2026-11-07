# Roadmap

## Starting point
The first components come from existing production React code that had been copied between products and then drifted apart.
- **Identical copies** move into the package as they are (phase P1).
- **Diverged copies** are merged into one canonical version (phase P3). The most recently improved version is the baseline, and features found only in the other version are added behind props.

## Rules for every component in this package
1. **No i18n inside.** Every user-facing string comes in through props, and an English default is allowed only for aria-only text. Each app wraps components with its own `useTranslations`.
2. **No app imports.** No `@/`, no next-intl, no Supabase, no app routes. `next/link` and `next/navigation` reach a component through injected props or adapters.
3. **Theming through the semantic token contract** (`tokens.css`, prefixed `--lufia-*`). The package ships a neutral default theme plus an example brand theme for Storybook. Each consuming app defines its own brand theme by mapping its values onto the contract. See STANDARDS.md §1.
4. **Styling with CSS modules.** No runtime CSS-in-JS. Works with Next 15 / React 19 Server Components: interactive components start with "use client" and static ones stay server-safe.
5. **Accessibility is a gate:** keyboard paths, focus-visible styles that are never removed, ARIA roles, `prefers-reduced-motion`, and an axe check in the tests.
6. **Tests:** every component ships with vitest + testing-library tests in this repo.
7. **Responsive:** components hold up at 320/390/768/1440 in consuming apps before a release goes out.
8. **Release process:** semver tags plus a CHANGELOG entry. A breaking change needs a migration note and an upgrade note for consumers.

## Phases
- **P0 – Contract and tooling:**
  - DTCG tokens + Style Dictionary, with brand themes;
  - build step;
  - Storybook (React + Vite, a11y/themes/viewport addons) deployed to GitHub Pages;
  - CI covering typecheck, lint, tests + axe and visual regression;
  - changesets;
  - CONTRIBUTING and ADRs.
  - Full checklist in STANDARDS.md.
- **P1 – Identical components:** move the components that are identical across consumers. Consumers switch to the package with no visual change, confirmed by screenshot diffs.
- **P2 – Motion:** motion tokens and primitives, plus the verify-motion gate. **Done** (all `beta`, see [MOTION.md](MOTION.md)):
  - duration, easing and distance tokens with a reduced-motion policy;
  - Reveal, Collapse, Skeleton, AnimatedNumber, ChangeHighlight and `usePrefersReducedMotion`;
  - the `lufia-verify-motion` CLI with a shrink-only baseline, run on this repo in `npm run check`.
  - Still open: consuming apps adopting the primitives and the CLI (phase P1/P3 sweeps).
- **P3 – Diverged components:** one cluster at a time (overlays: Modal, ConfirmDialog, Toast, focus trap; inputs; tables; navigation). Each cluster is merged into a single API, consumers migrate, and they are swept at 4 widths.
  - **Foundations: done** (`beta`): `LufiaProvider`, `useFocusTrap`, `useMediaQuery`, `useModalState`, `useDismiss`, `usePagination`, `useStepDirection`, `VisuallyHidden`, and `useBodyScrollLock` with scrollbar compensation.
  - **Overlays: done** (`beta`): `Modal`, `ConfirmDialog`, `Toast`, `SuccessCheck`. One overlay architecture (a portaled dialog), no native `<dialog>` variant ([ADR 0003](adr/0003-primitives-library.md)). Consumers still have to migrate and be swept at 4 widths.
  - **Page actions: done** (`beta`): `MoreActions` `presentation="auto" | "popover" | "sheet"` (a bottom sheet in a portal, over a full-viewport backdrop, stacked at `--lufia-overlay-z`); `PageActions` uses `auto`. Consumers still have to migrate their local copies.
  - **Notification centre: done** (`beta`): `NotificationCenter` (a bell with an unread count; a non-modal popover on wide pages and a modal sheet below 60rem on the `MoreActions` sheet infrastructure), `NotificationPanel` (the same content for a page) and `NotificationSummary` (a highlight card). Tabs, groups, loading, empty and error states, a live region for the count, and motion built on the motion primitives. Consumers still have to adopt it.
  - Known gap: overlay paint order is set by `z-index` tokens, not derived from the shared layer stack, so a `Modal` that opens while a sheet is still open could paint under it. A sheet's own actions run after it closes, so this does not arise from the sheet itself. Follow-up: derive overlay paint order from the shared layer stack.
  - Still open: inputs, tables, navigation (including a bottom sheet with a drag gesture).
- **P4 – Hardening:** a screen-reader pass for every component, stable labels, an adoption tracker, and removal of the legacy copies in consuming apps.
