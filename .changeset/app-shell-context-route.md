---
"@lufia/design-system": minor
---

AppShell: a `context` slot (sidebar and sheet) and slot functions that receive the surface with `closeSheet` and `openSheet`; a controllable phone sheet (`menuOpen`, `onMenuOpenChange`, `hideSheetNavigation`); route motion and progress (`routeKey`, `routePending`, `routeProgress`, new `RouteProgress`) and a `mainPending` skeleton that keeps the page mounted; `primaryAction.onIntent` and `desktopPrimaryFallback`; an opt-in fade under the floating bar (`floatScrim`); and navigation scroll hints (edge fades, current page brought into view).

The page now always sits in a wrapper element inside `<main>` (`display: contents`, so layout is unchanged); app CSS that targets the page through `main > …` child selectors needs to target one level deeper. `<main>` also defaults to `tabIndex={-1}` so the skip link and pending focus can land on it (override with `mainProps.tabIndex`).
