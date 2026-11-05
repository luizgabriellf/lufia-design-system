# 0001. Token format: DTCG and Style Dictionary

- **Status:** Accepted
- **Date:** 2026-11-05

## Context

Colour, spacing, type, radius, elevation and motion values must be shared by components, documentation and consuming apps, and
a theme must be changeable without touching components. We want one source of truth that tools can read and that is not tied to
a single design tool or a single output format.

## Decision

- Author tokens as JSON in the **W3C Design Tokens Community Group (DTCG)** format under `tokens/`.
- Build with **Style Dictionary** into CSS custom properties (`--lufia-*`), a typed TypeScript map, and a JSON file consumed by
  the documentation.
- Organise in layers: **primitive** (`core.*`, raw palette and scales, never read by components), **semantic**
  (`color.text.muted`, `color.border.subtle`, ...), and **component** tokens only where they earn their place. Components read
  semantic or component tokens only.
- A theme is a set of semantic colour files per mode (`<theme>.light`, `<theme>.dark`). Forced-colors support maps semantic tokens
  to system colours for every theme.
- A contrast script checks every text and UI pair against WCAG 2.2 AA for each theme and mode, and fails CI.

## Consequences

- Positive: one source of truth, typed consumption, themes without component forks, contrast regressions caught automatically,
  a path to design-tool sync (for example Tokens Studio) later.
- Negative: a build step before Storybook, tests and typecheck; DTCG is still a draft specification, so we pin Style Dictionary
  and keep the token files simple (plain colour strings, no composite types beyond shadow).

## Alternatives considered

- Hand-written CSS variables: no types, no docs generation, easy to drift between themes.
- Tailwind theme config: couples tokens to one utility framework.
- CSS-in-JS tokens: runtime or build coupling that conflicts with Server Components goals.
