# QueueSummary

> Work queues by urgency: open ones as rows, empty ones folded into one line, an all-clear when none are open.

- Status: beta
- Category: Data display
- Import: `import { QueueSummary } from "@lufia/design-system/components/QueueSummary"`
- Also from: `@lufia/design-system`
- Source: [src/components/QueueSummary](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/QueueSummary)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-data-display-queuesummary--docs)

## Purpose

The overview of many work queues on one screen. Queues with something in them lead as `StatTile` rows, ordered by tone and then by the order you give. Queues at zero fold into one quiet line that still opens to every destination. When every count is zero, a short all-clear replaces the rows.

## When to use

- See the Storybook page.

## When not to use

- See the Storybook page.

## API

### `QueueSummary`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `items` | `readonly QueueSummaryItem[]` | yes |  |  |
| `clearLabel` | `(count: number) => ReactNode` | yes |  | The line that folds the empty queues ("6 queues are clear"). |
| `allClearTitle` | `ReactNode` | yes |  | Heading of the all-clear state, shown only when every count is exactly `0`. |
| `allClearBody` | `ReactNode` | no |  | A short line under the all-clear heading. |
| `unknownValue` | `ReactNode` | no | `"—"` | The figure of a queue whose count is unknown. |

Other native element attributes pass through to the root element.

## Types

- `QueueSummaryItem`: `{ [dataAttribute: 'data-${string}']: string | undefined; id: string; label: ReactNode; count: number | null; value?: ReactNode; tone?: QueueSummaryTone | undefined; hint?: ReactNode; sparkline?: ReactNode; href?: string | undefined; onClick?: MouseEventHandler<HTMLElement> | undefined; }`
- `QueueSummaryProps`: `Omit<HTMLAttributes<HTMLDivElement>, "children"> & { items: readonly QueueSummaryItem[]; clearLabel: (count: number) => ReactNode; allClearTitle: ReactNode; allClearBody?: ReactNode; unknownValue?: ReactNode; }`
- `QueueSummaryTone`: `"neutral" | "warning" | "danger"`

## Example

```tsx
import { QueueSummary } from "@lufia/design-system/components/QueueSummary";

<QueueSummary
  items={[
    { id: "overdue", label: "Overdue renewals", count: 7, tone: "danger", href: "/overdue" },
    { id: "review", label: "Awaiting review", count: 0, href: "/review" },
  ]}
  clearLabel={(count) => `${count} queues clear`}
  allClearTitle="All caught up"
  allClearBody="Nothing is waiting for you."
/>;
```

## Accessibility

No accessibility notes are written for this export yet; see the Storybook page.

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thick`, `--lufia-border-width-thin`, `--lufia-color-bg-subtle`, `--lufia-color-bg-surface`, `--lufia-color-border-subtle`, `--lufia-color-focus-ring`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-font-line-height-normal`, `--lufia-font-size-sm`, `--lufia-font-size-xs`, `--lufia-font-weight-semibold`, `--lufia-motion-duration-instant`, `--lufia-motion-easing-out`, `--lufia-radius-md`, `--lufia-radius-sm`, `--lufia-target-touch`.

## Stories

- `components-data-display-queuesummary--mixed`
- `components-data-display-queuesummary--all-clear`
- `components-data-display-queuesummary--many-open`
- `components-data-display-queuesummary--unknown-count`
- `components-data-display-queuesummary--phone`
- `components-data-display-queuesummary--themes`
