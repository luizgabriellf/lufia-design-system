# Roadmap

## Baseline audit (2026-11-05)
- Salvus has 67 files in `components/ui`; salvflow has 56. There are 28 shared names.
- 12 files are byte-identical and can move as they are:
  ActionIcons, DetailAttentionCard, DetailList, DetailSectionCard, DetailSurface.module.css, EmptyState, SortableTh, StatusTimeline (+css), Stepper, TableToolbar, useBodyScrollLock.
- 22 files have diverged and need a canonical merge:
  Combobox, ConfirmDialog, DetailNavigationRow, FormField, ImportPreviewModal, Modal (+css), PageActions (+css), SearchInput, SegmentedToggle (+css), Skeleton, Spinner, Stepper.module.css, TablePagination, Toast, useFocusTrap, useModalParam, usePagination, WorkspaceViewNav (+css).
- Coupling:
  - In Salvus, 35 ui files import next-intl and 23 import `@/`.
  - In salvflow, 3 import next-intl and 11 import `@/`.

## Rules for every component in this package
1. **No i18n inside.** Every user-facing string comes in through props, and an English default is allowed only for aria-only text. Each app wraps components with its own `useTranslations`.
2. **No app imports.** No `@/`, no next-intl, no Supabase, no app routes. `next/link` and `next/navigation` reach a component through injected props or adapters.
3. **Theming through the semantic token contract** (`tokens.css`, prefixed `--lufia-*`). Brand themes (`salvus`, `salvflow`) live in the package, so Storybook can preview both. Each app imports its own theme. See STANDARDS.md §1.
4. **Styling with CSS modules.** No runtime CSS-in-JS. Works with Next 15 / React 19 Server Components: interactive components start with "use client" and static ones stay server-safe.
5. **Accessibility is a gate:** keyboard paths, focus-visible styles that are never removed, ARIA roles, `prefers-reduced-motion`, and an axe check in the tests.
6. **Tests:** every component ships with vitest + testing-library tests in this repo.
7. **Responsive:** components hold up at 320/390/768/1440 in both apps before a release goes out.
8. **Release process:** semver tags plus a CHANGELOG entry. A breaking change needs a migration note and a bump PR in both apps.

## Phases
- **P0 – Contract and tooling:**
  - DTCG tokens + Style Dictionary, with brand themes;
  - build step;
  - Storybook (React + Vite, a11y/themes/viewport addons) deployed to GitHub Pages;
  - CI covering typecheck, lint, tests + axe and visual regression;
  - changesets;
  - CONTRIBUTING and ADRs.
  - Full checklist in STANDARDS.md.
- **P1 – Identical components:** move the 12 identical files. Both apps switch to the package with no visual change, confirmed by screenshot diffs.
- **P2 – Motion:** extract salvflow's motion primitives and the verify-motion gate, then apply them to Salvus.
- **P3 – Diverged components:** **salvflow's version is the canonical baseline.** Most of these components came from Salvus and were improved in salvflow. Salvus features missing from salvflow get folded in behind props, and Salvus then adapts to the package API, not the other way round. Handle the 22 one cluster at a time (overlays: Modal, ConfirmDialog, Toast, useFocusTrap; inputs; tables; navigation). Each cluster takes the best of both versions behind props, then both apps migrate, both are swept at 4 widths, and Salvus marketing screenshots are recaptured when needed.
- **P4 – Hardening:** a screen-reader pass for every component, stable labels, an adoption tracker, and deletion of the legacy `components/ui` copies in both apps.
