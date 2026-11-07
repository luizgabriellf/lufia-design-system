# MoreActions

> An overflow menu that collects the secondary actions of a row or a page.

- Status: beta
- Category: Actions
- Import: `import { MoreActions } from "@lufia/design-system/components/MoreActions"`
- Also from: `@lufia/design-system`
- Source: [src/components/MoreActions](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/MoreActions)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-actions-moreactions--docs)

## Purpose

An overflow menu: a button that opens a list of less frequent actions. It follows the WAI-ARIA menu button pattern.

## When to use

- Infrequent or secondary actions for a record, a row or a page, behind one button.
- Page actions that no longer fit on a narrow screen (`PageActions` does this for you).

## When not to use

- Navigation between pages: use `PeerNav` or the app shell.
- Two or three actions that fit: show them as buttons.
- Choosing a value (a select or combobox) or a form's submit.
- The only way to reach an important action. Keep the main action visible.

## API

### `MoreActions`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `label` | `string` | yes |  | Accessible name of the trigger and of the menu, such as "More actions". |
| `items` | `readonly MoreActionItem[]` | yes |  |  |
| `align` | `"end" \| "start"` | no | `"end"` | Which edge of the trigger the menu lines up with. Defaults to the end. |
| `size` | `"sm" \| "md" \| "lg"` | no | `"md"` |  |
| `variant` | `ButtonVariant` | no | `"ghost"` |  |
| `icon` | `ReactNode` | no |  | Replaces the default three-dot icon. |
| `defaultOpen` | `boolean` | no | `false` | Renders the menu open on first paint, without moving focus. For documentation and tests; people open it themselves. |

Other native element attributes pass through to the root element.

## Example

```tsx
import { MoreActions } from "@lufia/design-system/components/MoreActions";

<MoreActions
  label="More actions"
  items={[
    { key: "dup", label: "Duplicate", onSelect: duplicate },
    { key: "settings", label: "Settings", href: "/settings" },
    { key: "del", label: "Delete record", tone: "danger", onSelect: confirmDelete },
  ]}
/>;
```

## Accessibility

Follows the WAI-ARIA Authoring Practices pattern: [Menu button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/).

Keyboard:

| Key | Action |
| --- | --- |
| Enter / Space / Down arrow | Trigger \| Opens the menu and focuses the first item |
| Up arrow | Trigger \| Opens the menu and focuses the last item |
| Down / Up arrow | Menu \| Next / previous item, wrapping; disabled items are included |
| Home / End | Menu \| First / last item |
| A letter or letters | Menu \| Typeahead: jumps to the next item starting with them; resets after 0.5s |
| Enter / Space | Item \| Activates the item, closes the menu, and returns focus to the trigger |
| Escape | Menu \| Closes the menu and returns focus to the trigger |
| Tab | Menu \| Closes the menu, returns focus to the button, moves on from it |

- The trigger is an `IconButton` named by `label`, with `aria-haspopup="menu"`, `aria-expanded` and `aria-controls`.
- The list is `role="menu"` with `role="menuitem"` entries; focus moves between items (roving focus) and returns to the
- Disabled items are `aria-disabled`: they stay focusable and readable (APG) but cannot be activated.
- Choosing a link item also returns focus to the button. The menu flips to the other edge of the button when it would run past the viewport. With no items, no button is rendered.
- A destructive item (`tone="danger"`) is styled red, but its label must say what it does ("Delete record"), since colour
- Items are at least 2.5rem tall, 3rem on narrow screens. The menu is limited to the viewport width and wraps long labels.
- In forced-colors mode the menu border is `CanvasText` and the focus ring `Highlight`. Under reduced motion the menu appears

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thick`, `--lufia-border-width-thin`, `--lufia-color-accent-subtle`, `--lufia-color-bg-surface-solid`, `--lufia-color-border-subtle`, `--lufia-color-focus-ring`, `--lufia-color-status-danger-bg`, `--lufia-color-status-danger-fg`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-font-line-height-normal`, `--lufia-font-size-sm`, `--lufia-font-size-xs`, `--lufia-motion-distance-nudge`, `--lufia-motion-duration-enter`, `--lufia-motion-easing-out`, `--lufia-opacity-disabled`, `--lufia-radius-md`, `--lufia-radius-sm`, `--lufia-shadow-lg`, `--lufia-z-dropdown`.

## Content guidelines

Items start with a verb and are one to three words. Put the destructive item last. Descriptions are optional and one short
phrase.

## Stories

- `components-actions-moreactions--default`
- `components-actions-moreactions--open`
- `components-actions-moreactions--aligned-to-start`
- `components-actions-moreactions--secondary`
- `components-actions-moreactions--long-labels`
- `components-actions-moreactions--phone-320`
- `components-actions-moreactions--phone-390`
- `components-actions-moreactions--right-to-left`
- `components-actions-moreactions--all-themes`
