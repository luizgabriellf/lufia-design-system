# PeerNav

> Links or tabs for moving between sibling views of the same page.

- Status: beta
- Category: Navigation
- Import: `import { PeerNav } from "@lufia/design-system/components/PeerNav"`
- Also from: `@lufia/design-system`
- Source: [src/components/PeerNav](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/PeerNav)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-navigation-peernav--docs)

## Purpose

A horizontal set of sibling views of one page, such as an overview and a work queue. Each item has a label and, optionally,
a description and an icon. An indicator slides to the chosen one.

## When to use

- Two to six peer views of one screen that share a heading and data.

## When not to use

- Page-level site navigation (use the app shell), steps in order (use `Stepper`), or a switch between two display modes.

## API

### `PeerNav`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `label` | `string` | yes |  | Accessible name of the navigation or the tablist. Required: there is usually more than one on a page. |
| `items` | `readonly PeerNavItem<Href>[]` | yes |  |  |
| `value` | `string` | no |  | Key of the current item. Controlled. For links it is the page being shown. |
| `defaultValue` | `string` | no |  | Initial key when `value` is not given (tabs only; links follow the page). |
| `onValueChange` | `((key: string, event?: MouseEvent<HTMLElement, MouseEvent> \| undefined) => void)` | no |  | Called when the person chooses another item. For links it fires on an unmodified primary click, before the browser navigates; call `event.preventDefault()` to take over (it is `undefined` for keyboard-selected tabs). |
| `layout` | `"auto" \| "fit" \| "scroll"` | no | `"auto"` | `"fit"` shares the width between the items; `"scroll"` keeps them readable and scrolls sideways with a fade on the edge that hides more. `"auto"` (default) scrolls from five items. |
| `onItemClick` | `((key: string, event: MouseEvent<HTMLElement, MouseEvent>) => void)` | no |  | Called for every click on an enabled item: the current one and modified clicks (Ctrl, Cmd, Shift, Alt, middle button) included, before `onValueChange` and before the browser navigates. `onValueChange` only reports a real change. Call `event.preventDefault()` to take over: `onValueChange` is not called, the indicator stays where it is, a link is not followed and a tab is not selected. Links and tabs. |
| `phoneGrid` | `"row" \| "2x2"` | no | `"row"` | What four items do on a phone (narrower than 35rem, `fit` layout). `"row"` (default) keeps them in one row with the icon above the label; `"2x2"` wraps them into two rows of two so each label keeps its width. |

Other native element attributes pass through to the root element.

## Types

- `PeerNavItem`: `{ key: string; label: string; description?: string | undefined; icon?: ReactNode; href?: Href | undefined; controls?: string | undefined; disabled?: boolean | undefined; }`

## Example

```tsx
import { PeerNav } from "@lufia/design-system/components/PeerNav";

<PeerNav
  label="Dashboard views"
  value="overview"
  items={[
    { key: "overview", label: "Overview", description: "Totals", icon: <GridIcon />, href: "/dashboard" },
    {
      key: "work",
      label: "Work",
      description: "Needs attention",
      icon: <InboxIcon />,
      href: "/dashboard/work",
    },
  ]}
/>;
```

## Accessibility

Follows the WAI-ARIA Authoring Practices pattern: [Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).

Keyboard:

| Key | Action |
| --- | --- |
| Tab / Shift+Tab | Moves between links \| Enters and leaves the tablist (one stop) |
| Enter | Follows the focused link \| Selects the focused tab (it is a button) |
| Left / Right arrow | Not used \| Previous / next tab, wrapping; reversed in RTL |
| Home / End | Not used \| First / last tab |

- Always give `label`: a page often has several navigations or tablists.
- Icons are decorative. The description is part of the link's or tab's name.
- A click on a link moves the indicator and the chosen styling at once, but `aria-current` stays on the page shown until
- Five or more items scroll sideways instead of shrinking; the current one is brought into view and a fade marks the edge that
- Target height is at least 3rem. Focus shows a 2px ring. The indicator slide uses `transform` only and is a no-op under

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thick`, `--lufia-border-width-thin`, `--lufia-color-accent-border`, `--lufia-color-accent-subtle`, `--lufia-color-bg-surface`, `--lufia-color-bg-surface-raised`, `--lufia-color-border-subtle`, `--lufia-color-focus-ring`, `--lufia-color-text-accent`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-color-text-subtle`, `--lufia-font-line-height-tight`, `--lufia-font-size-sm`, `--lufia-font-size-xs`, `--lufia-font-weight-bold`, `--lufia-motion-duration-enter`, `--lufia-motion-duration-instant`, `--lufia-motion-easing-out`, `--lufia-opacity-disabled`, `--lufia-peer-nav-active-icon-color`, `--lufia-peer-nav-description-line-height`, `--lufia-peer-nav-description-size`, `--lufia-peer-nav-disabled-opacity`, `--lufia-peer-nav-focus-width`, `--lufia-peer-nav-indicator-border`, `--lufia-peer-nav-indicator-shadow`, `--lufia-peer-nav-item-radius`, `--lufia-peer-nav-label-line-height`, `--lufia-peer-nav-label-size`, `--lufia-peer-nav-label-size-phone`, `--lufia-peer-nav-max-inline-size`, `--lufia-peer-nav-radius`, `--lufia-radius-card`, `--lufia-radius-control`, `--lufia-radius-md`, `--lufia-shadow-md`, `--lufia-space-2`.

## Content guidelines

Labels are one or two words. Descriptions are a short phrase and may be omitted; they disappear on phones.

## Stories

- `components-navigation-peernav--links`
- `components-navigation-peernav--tabs`
- `components-navigation-peernav--object-href`
- `components-navigation-peernav--without-descriptions`
- `components-navigation-peernav--without-icons`
- `components-navigation-peernav--two-views`
- `components-navigation-peernav--disabled-item`
- `components-navigation-peernav--many-items`
- `components-navigation-peernav--long-text`
- `components-navigation-peernav--phone-320`
- `components-navigation-peernav--phone-two-by-two`
- `components-navigation-peernav--themed-by-variables`
- `components-navigation-peernav--phone-390`
- `components-navigation-peernav--right-to-left`
- `components-navigation-peernav--all-themes`
- `components-navigation-peernav--all-themes-tabs`
