# Menu

> A list of actions, links or choices that hangs from a trigger, as a menu or a listbox, with arrow-key navigation and type-ahead.

- Status: beta
- Category: Overlays
- Import: `import { Menu } from "@lufia/design-system/components/Menu"`
- Also from: `@lufia/design-system`
- Source: [src/components/Menu](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/Menu)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-overlays-menu--docs)

## Purpose

A list of choices that hangs from a trigger: a workspace or scope switcher, an export menu, a set of section links. It owns
the keyboard model of a list (arrow keys, Home, End, type-ahead), which `Popover` deliberately does not have.

## When to use

- A short list of actions, links or choices that hangs from one control.
- A picker for one value (scope, workspace, sort order) with `role="listbox"`.

## When not to use

- A panel with a form, filters or rich content: use `Popover`.
- Overflow actions behind an icon button, with a bottom sheet on phones: use `MoreActions`.
- A searchable or free-text choice: use `Combobox`. A choice inside a form: use `Select` or `RadioGroup`.
- A question that must be answered: use `Modal` or `ConfirmDialog`.

## API

### `Menu`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `label` | `string` | yes |  | Accessible name of the list, such as "Switch workspace" or "Export". |
| `items` | `readonly MenuEntry[]` | yes |  | The choices, in order. Entries are items, groups (with an optional heading) or separators. |
| `role` | `"menu" \| "listbox"` | no |  | `"menu"` (default): a list of actions or links, items are `menuitem`. `"listbox"`: a choice of one value, items are `option` and the `current` one is `aria-selected`. |
| `presentation` | `"popover" \| "inline"` | no | `"popover"` | `"popover"` (default): a list that hangs from `trigger`. `"inline"`: the same items as a plain, always-visible list, with no trigger and no popover, for placing inside a sheet or a page. Keyboard navigation works the same; the props that belong to the trigger and the popover (`trigger`, `open`, `defaultOpen`, `onOpenChange`, `placement`, `align`, `matchTriggerWidth`, `closeOnSelect`) do not apply. |
| `trigger` | `(props: MenuTriggerProps) => ReactNode` | no |  | Required unless `presentation="inline"`; without it nothing is rendered. Renders the element that opens the list (usually a `Button`) and spreads the given props onto it. Called on every render, so keep it cheap: `trigger={(props) => <Button {...props}>Export</Button>}`. |
| `initialFocus` | `"current" \| "first"` | no |  | Where focus goes when the list opens: the `current` item, or the first when none is (`"current"`, default), or always the first (`"first"`). |
| `closeOnSelect` | `boolean` | no |  | Close the list after an item is activated. Default `true`. |
| `open` | `boolean` | no |  | Whether the list is open. Controlled; pair it with `onOpenChange`. |
| `defaultOpen` | `boolean` | no |  | Whether the list starts open when `open` is not given. For documentation and tests; focus is not moved on first paint. |
| `onOpenChange` | `(open: boolean) => void` | no |  | Called with the next state when the trigger, Escape, Tab, a press outside or a selection asks to change it. |
| `placement` | `"end" \| "top" \| "bottom" \| "start"` | no |  | Which side of the trigger the list opens on. `start` and `end` follow the writing direction. It flips to the opposite side when it does not fit. Default `bottom`. |
| `align` | `"end" \| "start" \| "center"` | no |  | How the list lines up with the trigger along the other axis. It shifts to stay in the viewport. Default `start`. |
| `matchTriggerWidth` | `boolean` | no |  | Makes the list at least as wide as the trigger (it grows for longer labels). Default `false`. |

Other native element attributes pass through to the root element.

## Types

- `MenuEntry`: `MenuItem | MenuGroup | MenuSeparator`
- `MenuGroup`: `{ type: "group"; key: string; label?: string | undefined; items: readonly MenuItem[]; }`
- `MenuItem`: `{ key: string; label: string; description?: string | undefined; meta?: string | undefined; icon?: ReactNode; href?: string | undefined; onSelect?: (() => void) | undefined; current?: boolean | undefined; disabled?: boolean | undefined; attributes?: Record<'data-${string}', string> | undefined; }`
- `MenuSeparator`: `{ type: "separator"; key: string; }`
- `MenuTriggerProps`: `{ ref: (element: HTMLElement | null) => void; onClick: () => void; onKeyDown: (event: KeyboardEvent<HTMLElement>) => void; "aria-expanded": boolean; "aria-controls": string | undefined; "aria-haspopup": "menu" | "listbox"; }`

## Example

```tsx
import { Menu } from "@lufia/design-system/components/Menu";

<Menu
  label="Export"
  trigger={(props) => <Button {...props}>Export</Button>}
  items={[
    { key: "csv", label: "Export as CSV", onSelect: exportCsv },
    { key: "pdf", label: "Export as PDF", onSelect: exportPdf },
  ]}
/>;
```

## Accessibility

Follows the WAI-ARIA Authoring Practices pattern: [Menu button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/).

Keyboard:

| Key | Action |
| --- | --- |
| Enter / Space | Trigger \| Opens or closes the list; focus goes to the current item, or the first |
| ArrowDown | Trigger \| Opens the list and focuses the current item, or the first |
| ArrowUp | Trigger \| Opens the list and focuses the last item |
| ArrowDown / ArrowUp | In the list \| Next or previous item, wrapping at the ends |
| Home / End | In the list \| First or last item |
| Letters | In the list \| Focus the next item whose label starts with what was typed; the same letter again cycles |
| Enter / Space | On an item \| Activates it (a link navigates); the list closes and focus returns to the trigger |
| Escape | In the list \| Closes the list and returns focus to the trigger |
| Tab / Shift+Tab | In the list \| Closes the list; focus moves on from the trigger |

- The trigger carries `aria-haspopup` (`menu` or `listbox`), `aria-expanded` and `aria-controls` while the list is rendered.
- The list is `role="menu"` with `menuitem` items, or `role="listbox"` with `option` items; `label` is its accessible name. A link item in a menu has `aria-current="page"` when it is `current`. A listbox sets `aria-selected` on every option.
- Focus is real focus on the items (a roving tabindex), not `aria-activedescendant`. The current item is the one Tab stop.
- Group headings name their `role="group"`. Separators are `role="separator"` in a menu and presentational in a listbox, where the role is not allowed.
- The list is `inert` while it animates out. Under reduced motion it appears and disappears without the scale and fade. In forced-colors mode the border is `CanvasText` and the current item has an outline.
- Items are at least 36px tall, and 44px under a coarse pointer; both sizes are above the 24px minimum of WCAG 2.5.8.
- This follows the WAI-ARIA menu button pattern. A list of navigation links is better as a disclosure of links when it is not an application menu; use `role="menu"` for it only when the arrow-key model is wanted.

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thick`, `--lufia-border-width-thin`, `--lufia-color-accent-subtle`, `--lufia-color-bg-surface-solid`, `--lufia-color-border-subtle`, `--lufia-color-focus-ring`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-font-line-height-normal`, `--lufia-font-size-sm`, `--lufia-font-size-xs`, `--lufia-font-weight-semibold`, `--lufia-menu-item-min-block-size`, `--lufia-menu-max-inline-size`, `--lufia-menu-padding`, `--lufia-menu-radius`, `--lufia-motion-duration-enter`, `--lufia-motion-duration-exit`, `--lufia-motion-easing-in`, `--lufia-motion-easing-out`, `--lufia-opacity-disabled`, `--lufia-radius-panel`, `--lufia-radius-sm`, `--lufia-shadow-lg`, `--lufia-space-1`, `--lufia-space-2`, `--lufia-z-dropdown`.

## Content guidelines

Start action labels with a verb ("Export as CSV"). Keep labels short and put detail in `description`, not in the label.
Name the list by what it holds ("Export", "Switch workspace"); the trigger's visible text is often the same.

## Stories

- `components-overlays-menu--default`
- `components-overlays-menu--open`
- `components-overlays-menu--link-items`
- `components-overlays-menu--with-descriptions-and-groups`
- `components-overlays-menu--listbox`
- `components-overlays-menu--listbox-picked`
- `components-overlays-menu--long-labels`
- `components-overlays-menu--controlled-by-the-caller`
- `components-overlays-menu--placed-above`
- `components-overlays-menu--placed-at-end`
- `components-overlays-menu--aligned-to-end`
- `components-overlays-menu--flips-near-the-bottom`
- `components-overlays-menu--in-clipping-card`
- `components-overlays-menu--inline`
- `components-overlays-menu--inline-links`
- `components-overlays-menu--phone-320`
- `components-overlays-menu--phone-390`
- `components-overlays-menu--right-to-left`
- `components-overlays-menu--all-themes`
