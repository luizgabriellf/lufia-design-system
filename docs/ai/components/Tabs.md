# Tabs

> Tabs that switch the content of one page, or links for views that have their own URL.

- Status: beta
- Category: Navigation
- Import: `import { Tabs } from "@lufia/design-system/components/Tabs"`
- Also from: `@lufia/design-system`
- Source: [src/components/Tabs](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/Tabs)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-navigation-tabs--docs)

## Purpose

Views of one page where one is shown at a time. It follows the WAI-ARIA tabs pattern: a `tablist` of `tab` buttons and one
`tabpanel` for the chosen tab. The same component renders a row of navigation links for views that have their own URL.

## When to use

- Two to seven views of one screen that share a heading, where only one is needed at a time.
- Use links mode for the same look when each view is its own route.

## When not to use

- Page-level navigation (use the app shell) or steps in order (`Stepper`).
- A choice that changes how the same data is shown (`SegmentedToggle`).
- Sibling views that need a description or an icon tile with a sliding indicator: `PeerNav`.
- Content that should all be visible at once or collapsed in place (`Disclosure`).

## API

### `Tabs`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `items` | `readonly TabsItem[]` | yes |  | The tabs, in order. |
| `label` | `string` | no |  | Accessible name of the tab list (or of the navigation in links mode). Give this or `labelledBy`. |
| `labelledBy` | `string` | no |  | Id of the element that names the tab list. Give this or `label`. |
| `value` | `string` | no |  | Key of the chosen tab. Controlled; pair it with `onValueChange`. In links mode it is the page being shown. |
| `defaultValue` | `string` | no |  | Key chosen first when `value` is not given. Defaults to the first enabled tab (tabs mode). |
| `onValueChange` | `(key: string) => void` | no |  | Called with the key the person chose (a click, or an arrow key with automatic activation). Tabs mode only. |
| `orientation` | `"vertical" \| "horizontal"` | no | `"horizontal"` | `"horizontal"` (default): a row with Left and Right arrows, scrolling sideways when it does not fit. `"vertical"`: a column with Up and Down arrows. |
| `activation` | `"manual" \| "automatic"` | no | `"automatic"` | `"automatic"` (default): moving focus with an arrow key also chooses the tab, which suits panels that render at once. `"manual"`: arrow keys only move focus; Enter or Space chooses, which suits panels that load data. |
| `keepMounted` | `boolean` | no | `false` | Keep the panels of tabs that are not chosen in the DOM (hidden) so their state survives. Default `false`: only the chosen panel is rendered. |
| `ref` | `Ref<HTMLDivElement>` | no |  |  |

Other native element attributes pass through to the root element.

## Types

- `TabsItem`: `{ key: string; label: ReactNode; icon?: ReactNode; panel?: ReactNode; href?: string | undefined; disabled?: boolean | undefined; }`

## Example

```tsx
import { Tabs } from "@lufia/design-system/components/Tabs";

<Tabs
  label="Account sections"
  defaultValue="profile"
  items={[
    { key: "profile", label: "Profile", panel: <ProfileForm /> },
    { key: "security", label: "Security", panel: <SecurityForm /> },
    { key: "billing", label: "Billing", panel: <BillingForm />, disabled: true },
  ]}
/>;
```

## Accessibility

Follows the WAI-ARIA Authoring Practices pattern: [Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).

Keyboard:

| Key | Action |
| --- | --- |
| Tab / Shift+Tab | One stop in the list (the chosen tab), then the panel |
| Left / Right arrow | Previous / next tab, wrapping; reversed in right-to-left |
| Up / Down arrow (vertical) | Previous / next tab, wrapping |
| Home / End | First / last tab |
| Enter / Space | Chooses the focused tab (manual activation) |

- Always give `label` or `labelledBy`: a page often has more than one set.
- Roving tabindex: exactly one tab is in the tab order. With manual activation, after focus leaves the list it comes back to the chosen tab, not to the last one browsed.
- The panel is focusable (`tabindex="0"`), so a panel with no focusable content is still reachable by keyboard.
- The chosen tab has a bar on the edge next to the panel as well as stronger text, so it reads without colour. The focus ring is visible, uses the focus-ring token and is kept in `forced-colors` mode.
- Colour changes are the only transition and are removed under `prefers-reduced-motion`.
- Tabs are at least 2.5rem tall, and 2.75rem under a coarse pointer.

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thick`, `--lufia-border-width-thin`, `--lufia-color-accent-border`, `--lufia-color-border-subtle`, `--lufia-color-focus-ring`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-font-size-sm`, `--lufia-font-weight-bold`, `--lufia-font-weight-medium`, `--lufia-motion-duration-instant`, `--lufia-motion-easing-out`, `--lufia-opacity-disabled`, `--lufia-space-1`, `--lufia-space-2`, `--lufia-space-3`, `--lufia-space-4`, `--lufia-tabs-disabled-opacity`, `--lufia-tabs-focus-width`, `--lufia-tabs-gap`, `--lufia-tabs-indicator-color`, `--lufia-tabs-indicator-size`, `--lufia-tabs-panel-gap`, `--lufia-tabs-panel-padding`, `--lufia-tabs-selected-color`, `--lufia-tabs-tab-min-block-size`, `--lufia-tabs-tab-padding-block`, `--lufia-tabs-tab-padding-inline`.

## Content guidelines

Labels are one or two words, in sentence case, and stay on one line.

## Stories

- `components-navigation-tabs--default`
- `components-navigation-tabs--manual-activation`
- `components-navigation-tabs--vertical`
- `components-navigation-tabs--disabled-tab`
- `components-navigation-tabs--keep-mounted`
- `components-navigation-tabs--controlled`
- `components-navigation-tabs--overflow`
- `components-navigation-tabs--links`
- `components-navigation-tabs--links-vertical`
- `components-navigation-tabs--phone-320`
- `components-navigation-tabs--right-to-left`
- `components-navigation-tabs--all-themes`
