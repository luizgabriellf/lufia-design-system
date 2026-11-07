# ActivityList

> A feed of what happened with its time, optionally on a timeline rail.

- Status: beta
- Category: Data display
- Import: `import { ActivityList } from "@lufia/design-system/components/ActivityList"`
- Also from: `@lufia/design-system`
- Source: [src/components/ActivityList](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/ActivityList)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-data-display-activitylist--docs)

## Purpose

A feed of what happened, newest first: a title, a line of context, the time and an optional action per entry, with an optional timeline rail.

## When to use

- Recent changes to a workspace, a record or an account.
- A feed where each entry is one event with a time.

## When not to use

- Things that need a decision: use `AttentionList`.
- The states of one obligation, with deadlines and inputs: use `StatusTimeline`.
- Long histories: link to a full page or a table.

## API

### `ActivityList`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `items` | `readonly ActivityItem[]` | yes |  |  |
| `timeline` | `boolean` | no | `false` | Draws a rail with a marker per entry, for a feed read as a sequence. Plain rows by default. |

Other native element attributes pass through to the root element.

## Types

- `ActivityItem`: `{ id: string; title: ReactNode; meta?: ReactNode; time: ReactNode; dateTime?: string | undefined; tone?: ActivityTone | undefined; toneLabel?: string | undefined; action?: ReactNode; }`
- `ActivityListProps`: `Omit<HTMLAttributes<HTMLOListElement>, "children"> & { items: readonly ActivityItem[]; timeline?: boolean | undefined; }`
- `ActivityTone`: `"neutral" | "success" | "warning" | "danger" | "info"`

## Example

```tsx
import { ActivityList } from "@lufia/design-system/components/ActivityList";

<ActivityList
  aria-label="Recent activity"
  timeline
  items={[
    {
      id: "1",
      title: "Report published",
      meta: "By Ana",
      time: "2 h ago",
      dateTime: "2026-03-12T10:00:00Z",
      tone: "success",
    },
    { id: "2", title: "Export failed", time: "Yesterday", tone: "danger", toneLabel: "Failed" },
  ]}
/>;
```

## Accessibility

- It is an ordered list (`ol`): the order is the meaning. Name it with `aria-label` or `aria-labelledby`.
- Pass `dateTime` (ISO 8601) and the time renders as a `<time>` element. `time` itself is already formatted, in your language.
- The rail and markers are decorative (`aria-hidden`); the tone is reinforcement. Set `toneLabel` so a state such as "Failed" is read before the title.
- The rail uses logical properties, so it flips in right-to-left layouts.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thick`, `--lufia-border-width-thin`, `--lufia-color-accent-default`, `--lufia-color-bg-surface`, `--lufia-color-border-strong`, `--lufia-color-border-subtle`, `--lufia-color-status-danger-solid`, `--lufia-color-status-success-fg`, `--lufia-color-status-warning-fg`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-color-text-subtle`, `--lufia-font-family-mono`, `--lufia-font-line-height-normal`, `--lufia-font-size-sm`, `--lufia-font-size-xs`, `--lufia-radius-full`.

## Stories

- `components-data-display-activitylist--default`
- `components-data-display-activitylist--timeline`
- `components-data-display-activitylist--single-entry`
- `components-data-display-activitylist--long-text`
- `components-data-display-activitylist--empty`
- `components-data-display-activitylist--inside-card`
- `components-data-display-activitylist--phone-320`
- `components-data-display-activitylist--right-to-left`
- `components-data-display-activitylist--all-themes`
