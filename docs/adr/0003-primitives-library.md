# 0003. Accessibility primitives library for complex widgets

- **Status:** Proposed (undecided; the owner has not chosen)
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

Not made. No primitives dependency is added to the package until this record is accepted.

## Consequences (to be completed on acceptance)

- Choosing a library means a runtime or peer dependency, a styling bridge to CSS Modules and tokens, and a policy for which
  widgets use it.
- Choosing custom means keyboard and screen-reader specs and tests per widget, written and maintained here.

## Next step

The maintainer decides; discussion happens in an RFC issue. Update this record to `Accepted` or `Rejected`, or supersede it.
