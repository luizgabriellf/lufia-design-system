# AttentionList

> A short list of items that need a decision, with a tone bar and an action.

- Status: beta
- Category: Data display
- Import: `import { AttentionList } from "@lufia/design-system/components/AttentionList"`
- Also from: `@lufia/design-system`
- Source: [src/components/AttentionList](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/AttentionList)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-data-display-attentionlist--docs)

## Purpose

A short list of things that need a decision. With `groups`, rows sit under urgency headers on a neutral surface and each row is one link. With flat `items`, each row has a tone bar, a title, a line of context and one action.

## When to use

- The few items that need action first, at the top of a dashboard.
- Rows where each item has one clear next step.
- Use `groups` when items fall into urgency levels; flat `items` when each row needs its own labelled action.

## When not to use

- A log of what happened: use `ActivityList`.
- Long lists to browse or filter: use a table.
- An empty list: it renders nothing, so use an `EmptyState` or leave the section out.

## API

### `AttentionList`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `items` | `readonly AttentionItem[]` | no | `[]` | The rows of a flat list, each with its own tone bar and tint. Ignored when `groups` is set. |
| `groups` | `readonly AttentionGroup[]` | no |  | Rows grouped by urgency, on a neutral surface: each group has a mark, a label and a count. Empty groups are skipped. |
| `barStyle` | `"edge" \| "inset"` | no | `"edge"` | `edge` (default) draws the tone bar as the row's own start border, flush with the card edge. `inset` draws a rounded bar set in from the edge. The bar width is `--lufia-attention-list-bar-width`. Applies to flat `items` only. |

Other native element attributes pass through to the root element.

## Types

- `AttentionBarStyle`: `"edge" | "inset"`
- `AttentionGroup`: `{ id: string; tone?: AttentionTone | undefined; label: ReactNode; count?: ReactNode; items: readonly AttentionItem[]; }`
- `AttentionItem`: `{ id: string; tone?: AttentionTone | undefined; toneLabel?: string | undefined; title: ReactNode; meta?: ReactNode; action?: ReactNode; href?: string | undefined; onSelect?: MouseEventHandler<HTMLElement> | undefined; count?: ReactNode; }`
- `AttentionListProps`: `Omit<HTMLAttributes<HTMLUListElement>, "children"> & { items?: readonly AttentionItem[] | undefined; groups?: readonly AttentionGroup[] | undefined; barStyle?: AttentionBarStyle | undefined; }`
- `AttentionTone`: `"danger" | "warning" | "info" | "neutral"`

## Example

```tsx
import { AttentionList } from "@lufia/design-system/components/AttentionList";

<AttentionList
  aria-label="Needs attention"
  groups={[
    {
      id: "overdue",
      tone: "danger",
      label: "Overdue",
      items: [
        {
          id: "contract",
          title: "Renew the supplier contract",
          meta: "Deadline · 12 days ago",
          href: "/contracts/renew",
        },
      ],
    },
  ]}
/>;
```

## Accessibility

- It is a `ul`. Name it with `aria-label` or `aria-labelledby`.
- With `groups`, each group is a nested list named by its label and count, so the urgency is announced in words. The status mark is decorative next to that label.
- A row with `href` or `onSelect` is one link or button holding the title, meta and count, at least 44px tall, with a visible focus ring. A per-row `action` is dropped on such a row, so targets never nest. The chevron's hover movement is removed under reduced motion.
- The tone bar and tint are reinforcement. Set `toneLabel` ("Overdue") and it is read before the title, so the urgency never rests on colour.
- The action is your own link or button, so it keeps its own name and focus ring. Name it so it makes sense out of context, or include the subject.
- In `forced-colors` mode the tone bar is a border and stays visible.

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-attention-list-bar-inset`, `--lufia-attention-list-bar-inset-block`, `--lufia-attention-list-bar-inset-inline`, `--lufia-attention-list-bar-width`, `--lufia-border-width-thick`, `--lufia-border-width-thin`, `--lufia-color-accent-default`, `--lufia-color-accent-subtle`, `--lufia-color-bg-surface-raised`, `--lufia-color-border-strong`, `--lufia-color-border-subtle`, `--lufia-color-focus-ring`, `--lufia-color-status-danger-bg`, `--lufia-color-status-danger-solid`, `--lufia-color-status-warning-bg`, `--lufia-color-status-warning-fg`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-font-line-height-normal`, `--lufia-font-size-sm`, `--lufia-font-size-xs`, `--lufia-font-weight-semibold`, `--lufia-icon-size-sm`, `--lufia-motion-duration-instant`, `--lufia-motion-easing-out`, `--lufia-opacity-decorative`, `--lufia-radius-full`, `--lufia-target-touch`.

## Stories

- `components-data-display-attentionlist--default`
- `components-data-display-attentionlist--single-item`
- `components-data-display-attentionlist--no-actions`
- `components-data-display-attentionlist--long-text`
- `components-data-display-attentionlist--inset-bar`
- `components-data-display-attentionlist--inset-per-axis`
- `components-data-display-attentionlist--thick-bar`
- `components-data-display-attentionlist--groups`
- `components-data-display-attentionlist--groups-phone-320`
- `components-data-display-attentionlist--groups-right-to-left`
- `components-data-display-attentionlist--groups-inside-card`
- `components-data-display-attentionlist--groups-all-themes`
- `components-data-display-attentionlist--empty`
- `components-data-display-attentionlist--inside-card`
- `components-data-display-attentionlist--phone-320`
- `components-data-display-attentionlist--right-to-left`
- `components-data-display-attentionlist--all-themes`
