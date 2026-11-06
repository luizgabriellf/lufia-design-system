# 0003. Accessibility primitives library for complex widgets

- **Status:** Accepted: custom implementations hardened with APG tests; revisit React Aria if maintenance cost grows
- **Date:** 2026-11-05

## Context

Simple components (cards, lists, empty states, toolbars) need no help. Complex widgets (combobox, modal dialog, toast, menu,
popover, tabs) are where accessibility bugs concentrate: focus management, typeahead, announcements, dismissal and
positioning are easy to get subtly wrong. Hand-rolled focus trapping in particular tends to diverge between consuming apps.
Decide whether those widgets are built on an accessibility primitives library or kept fully custom.

## Options

1. **React Aria Components** (Adobe). Strictest WAI-ARIA behaviour, internationalised internals, unstyled, large coverage
   (combobox, dialog, menu, tabs, date pickers). Heavier API surface; styling through render props and `data-*` attributes.
   **Recommended** by the maintainer's analysis.
2. **Radix UI primitives.** Smaller, popular, unstyled, good ergonomics. Less coverage of complex inputs (no combobox), and less
   rigorous internationalisation.
3. **Custom.** No dependency and full control, but the maintenance and accessibility risk lands entirely on this project.

## Decision

Option 3: **custom implementations, hardened against the WAI-ARIA Authoring Practices**. No primitives dependency is added.

Each complex widget is held to its APG pattern by tests, not by trust:

- **Modal** and **ConfirmDialog** follow Dialog (Modal) and Alert Dialog. Tests cover Tab and Shift+Tab wrapping, Escape, focus
  moving in and returning to the trigger, the inert background, scroll lock, the busy refusal, and axe in the open state.
- **Toast** keeps live regions mounted (assertive for errors, polite for the rest) and tests the timing rules of WCAG 2.2.1:
  errors persist, timers pause on hover and focus.
- Shared behaviour lives in small, separately tested hooks (`useFocusTrap`, `useBodyScrollLock`, `useDismiss`,
  `useMediaQuery`) so a fix lands once.
- There is one overlay architecture: a portaled `div` with a trap. A native `<dialog>` variant was considered (it gives an
  inert background and the top layer for free) and dropped: it needs a second API, a second set of tests and a workaround so
  that toasts stay above it, and the inert background is reproduced here with `inert`.

## Consequences

- No runtime or peer dependency, and no styling bridge: components are plain CSS Modules on `--lufia-*` tokens.
- The accessibility and maintenance risk sits with this project. The mitigation is the per-widget keyboard table in the docs,
  the tests above, and a manual VoiceOver and NVDA pass before a component is marked `stable`.
- Widgets that need positioning, typeahead or virtualisation (combobox, menu, popover) are where custom code costs the most.
  They are the trigger for the revisit below.

## Revisit

Adopt React Aria Components, or Radix, for a widget if its maintenance cost grows: repeated accessibility regressions,
screen-reader bugs this project cannot reproduce, or an internationalisation requirement (RTL, date and number input) that the
custom code cannot meet. That is a new ADR that supersedes this one for that widget.
