# PageActions

> The action bar of a page: one primary action, the rest collapsed on narrow screens.

- Status: beta
- Category: Actions
- Import: `import { PageActions } from "@lufia/design-system/components/PageActions"`
- Also from: `@lufia/design-system`
- Source: [src/components/PageActions](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/PageActions)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-actions-pageactions--docs)

## Purpose

The action row of a page: one primary action, a few secondary ones, and an overflow menu. It is meant for the `actions` slot
of `PageHeader`.

## When to use

- The actions that apply to the whole page: create, import, share, export.

## When not to use

- Actions on one row or card: use `IconButton` or `MoreActions` there.
- More than one primary action.
- Navigation between views: use `PeerNav`.

## API

### `PageActions`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `primary` | `PageActionItem` | no |  | The one main action of the page. Always visible. |
| `secondary` | `readonly PageActionItem[]` | no | `[]` | Frequent actions. Visible on wide screens; on narrow ones they move into the overflow menu. |
| `overflow` | `readonly MoreActionItem[]` | no | `[]` | Infrequent actions. Always in the overflow menu. |
| `moreLabel` | `string` | yes |  | Accessible name of the overflow menu button, such as "More actions". |

Other native element attributes pass through to the root element.

## Types

- `PageActionItem`: `{ key: string; label: string; icon?: ReactNode; href?: string | undefined; onSelect?: (() => void) | undefined; disabled?: boolean | undefined; }`
- `PageActionsProps`: `Omit<HTMLAttributes<HTMLDivElement>, "children"> & { primary?: PageActionItem | undefined; secondary?: readonly PageActionItem[] | undefined; overflow?: readonly MoreActionItem[] | undefined; moreLabel: string; }`

## Example

```tsx
import { PageActions } from "@lufia/design-system/components/PageActions";

<PageActions
  moreLabel="More actions"
  primary={{ key: "new", label: "New report", onSelect: create }}
  secondary={[{ key: "share", label: "Share", onSelect: share }]}
  overflow={[{ key: "del", label: "Delete all", tone: "danger", onSelect: confirmDeleteAll }]}
/>;
```

## Accessibility

Keyboard:

Buttons follow `Button`; the menu follows `MoreActions` (arrow keys, Home, End, typeahead, Escape). See both pages.

- Every control is a native button or link, or the menu from `MoreActions`; the menu button is named by `moreLabel`.
- On narrow screens an action is reachable in the menu only, so keep labels meaningful out of context.
- The row does not wrap, so it never pushes content around when it collapses.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Its stylesheet reads no `--lufia-*` tokens directly (no CSS module, or it composes other components).

## Content guidelines

Verbs first, one to three words. Put the destructive action last in the menu and label it explicitly.

## Stories

- `components-actions-pageactions--default`
- `components-actions-pageactions--primary-only`
- `components-actions-pageactions--secondary-only`
- `components-actions-pageactions--overflow-only`
- `components-actions-pageactions--primary-as-link`
- `components-actions-pageactions--disabled`
- `components-actions-pageactions--in-page-header`
- `components-actions-pageactions--phone-320`
- `components-actions-pageactions--phone-390`
- `components-actions-pageactions--right-to-left`
- `components-actions-pageactions--all-themes`
