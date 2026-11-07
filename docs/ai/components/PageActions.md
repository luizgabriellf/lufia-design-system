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
| `size` | `"sm" \| "md"` | no | `"md"` | Size of the primary and secondary buttons and of the menu button. Defaults to `"md"`; `"sm"` suits compact headers. |
| `collapse` | `"container" \| "viewport"` | no | `"viewport"` | What collapses the secondary actions into the overflow menu. `"viewport"` (default) is the page width: below 48rem. `"container"` is the width of the nearest ancestor that declares `container-type: inline-size`: below 50rem. The host must declare it; without one the secondary actions never collapse, and with no `overflow` items the menu button stays visible with nothing in it, so always give this mode a host container. There is no container name and no threshold prop, because a container condition cannot read a variable. Pure CSS in both cases, so there is no flash on first paint. |
| `hideBelow` | `"medium"` | no |  | `"medium"` hides the whole row below 60rem, for a page whose app shell shows the actions elsewhere on narrow screens. Pure CSS, so there is no flash on first paint. Omit it to keep the row at every width. |
| `primaryPlacement` | `"inline" \| "external"` | no | `"inline"` | Where the primary action is rendered. `"inline"` (default) keeps it in the row. `"external"` hides it in the row below 60rem (the `medium` breakpoint), because the app shell renders it there, for example in a floating bar; it stays inline on wider screens. The secondary actions and the menu are not affected. |

Other native element attributes pass through to the root element.

## Types

- `PageActionItem`: `{ key: string; label: string; icon?: ReactNode; href?: string | undefined; onSelect?: (() => void) | undefined; disabled?: boolean | undefined; hint?: string | undefined; attributes?: Record<'data-${string}', string> | undefined; }`

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
- A hinted disabled action is `aria-disabled`, not `disabled`, so it takes focus and announces its reason.
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
- `components-actions-pageactions--disabled-with-hint`
- `components-actions-pageactions--small`
- `components-actions-pageactions--external-primary`
- `components-actions-pageactions--hidden-below-medium`
- `components-actions-pageactions--container-narrow`
- `components-actions-pageactions--container-wide`
- `components-actions-pageactions--with-data-attributes`
- `components-actions-pageactions--in-page-header`
- `components-actions-pageactions--phone-320`
- `components-actions-pageactions--phone-390`
- `components-actions-pageactions--right-to-left`
- `components-actions-pageactions--all-themes`
