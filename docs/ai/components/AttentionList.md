# AttentionList

> A short list of items that need a decision, with a tone bar and an action.

- Status: beta
- Category: Data display
- Import: `import { AttentionList } from "@lufia/design-system/components/AttentionList"`
- Also from: `@lufia/design-system`
- Source: [src/components/AttentionList](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/AttentionList)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-data-display-attentionlist--docs)

## Purpose

A short list of things that need a decision: each row has a tone bar, a title, a line of context and one action.

## When to use

- The few items that need action first, at the top of a dashboard.
- Rows where each item has one clear next step.

## When not to use

- A log of what happened: use `ActivityList`.
- Long lists to browse or filter: use a table.
- An empty list: it renders nothing, so use an `EmptyState` or leave the section out.

## API

### `AttentionList`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `items` | `readonly AttentionItem[]` | yes |  |  |
| `barStyle` | `"edge" \| "inset"` | no | `"edge"` | `edge` (default) draws the tone bar as the row's own start border, flush with the card edge. `inset` draws a rounded bar set in from the edge. The bar width is `--lufia-attention-list-bar-width`. |

Other native element attributes pass through to the root element.

## Types

- `AttentionBarStyle`: `"edge" | "inset"`
- `AttentionItem`: `{ id: string; tone?: AttentionTone | undefined; toneLabel?: string | undefined; title: ReactNode; meta?: ReactNode; action?: ReactNode; }`
- `AttentionListProps`: `Omit<HTMLAttributes<HTMLUListElement>, "children"> & { items: readonly AttentionItem[]; barStyle?: AttentionBarStyle | undefined; }`
- `AttentionTone`: `"danger" | "warning" | "info" | "neutral"`

## Example

```tsx
import { AttentionList } from "@lufia/design-system/components/AttentionList";

<AttentionList
  aria-label="Needs attention"
  items={[
    {
      id: "contract",
      tone: "danger",
      toneLabel: "Overdue",
      title: "Renew the supplier contract",
      meta: "3 days overdue",
      action: (
        <Button size="sm" variant="ghost">
          Open
        </Button>
      ),
    },
  ]}
/>;
```

## Accessibility

- It is a `ul`. Name it with `aria-label` or `aria-labelledby`.
- The tone bar and tint are reinforcement. Set `toneLabel` ("Overdue") and it is read before the title, so the urgency never rests on colour.
- The action is your own link or button, so it keeps its own name and focus ring. Name it so it makes sense out of context, or include the subject.
- In `forced-colors` mode the tone bar is a border and stays visible.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Reads these semantic tokens: `--lufia-attention-list-bar-inset`, `--lufia-attention-list-bar-inset-block`, `--lufia-attention-list-bar-inset-inline`, `--lufia-attention-list-bar-width`, `--lufia-border-width-thin`, `--lufia-color-accent-default`, `--lufia-color-accent-subtle`, `--lufia-color-border-strong`, `--lufia-color-border-subtle`, `--lufia-color-status-danger-bg`, `--lufia-color-status-danger-solid`, `--lufia-color-status-warning-bg`, `--lufia-color-status-warning-fg`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-font-line-height-normal`, `--lufia-font-size-sm`, `--lufia-font-size-xs`, `--lufia-radius-full`.

## Stories

- `components-data-display-attentionlist--default`
- `components-data-display-attentionlist--single-item`
- `components-data-display-attentionlist--no-actions`
- `components-data-display-attentionlist--long-text`
- `components-data-display-attentionlist--inset-bar`
- `components-data-display-attentionlist--inset-per-axis`
- `components-data-display-attentionlist--thick-bar`
- `components-data-display-attentionlist--empty`
- `components-data-display-attentionlist--inside-card`
- `components-data-display-attentionlist--phone-320`
- `components-data-display-attentionlist--right-to-left`
- `components-data-display-attentionlist--all-themes`
