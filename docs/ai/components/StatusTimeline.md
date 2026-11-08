# StatusTimeline

> A vertical timeline of states with their dates.

- Status: beta
- Category: Data display
- Import: `import { StatusTimeline } from "@lufia/design-system/components/StatusTimeline"`
- Also from: `@lufia/design-system`
- Source: [src/components/StatusTimeline](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/StatusTimeline)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-data-display-statustimeline--docs)

## Purpose

A vertical, connected timeline of obligations or steps grouped into tracks. Each node has a marker, a state
`StatusBadge`, an optional timestamp or deadline, a hint, and an optional inline action.

## When to use

- Tracking dated obligations or a multi-party process where order and status both matter.

## When not to use

- A simple progress indicator (use `Stepper`) or an activity feed.

## API

### `StatusTimeline`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `tracks` | `StatusTimelineTrack[]` | yes |  |  |

Other native element attributes pass through to the root element.

## Types

- `StatusTimelineNode`: `{ id: string; label: string; state: StatusTimelineNodeState; stateLabel: string; timestampLabel?: string | undefined; deadlineLabel?: string | undefined; hint?: string | undefined; action?: ReactNode; }`
- `StatusTimelineNodeState`: `"needsTimestamp" | "pending" | "overdue" | "done" | "notApplicable"`
- `StatusTimelineProps`: `HTMLAttributes<HTMLDivElement> & { tracks: StatusTimelineTrack[]; }`
- `StatusTimelineTrack`: `{ id: string; title: string; nodes: StatusTimelineNode[]; }`

## Example

```tsx
import { StatusTimeline } from "@lufia/design-system/components/StatusTimeline";

<StatusTimeline
  tracks={[
    {
      id: "review",
      title: "Review",
      nodes: [
        {
          id: "n1",
          label: "Notify the team",
          state: "done",
          stateLabel: "Done",
          timestampLabel: formatted,
        },
      ],
    },
  ]}
/>;
```

## Accessibility

- Each track is a `<section>` with an `<h3>`; each node list is an ordered list, so order and count are announced.
- **State is named in words** through `stateLabel` in the `StatusBadge`; colour and marker are reinforcement only. Always pass a meaningful `stateLabel`.
- Markers are one family (same ring, stroke and centring) and each state has its own glyph shape: a check (done), clock hands (pending), an exclamation mark (overdue), three dots (needs a timestamp) and a dash (not applicable), so states differ without colour.
- Layout stays vertical at every width: no horizontal scrolling or truncated text at 320px.
- Actions are slots; keep them keyboard operable and labelled.
- In forced-colors mode the badge keeps a visible border (the `Badge` rule).

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thick`, `--lufia-color-border-subtle`, `--lufia-color-text-muted`, `--lufia-color-text-subtle`, `--lufia-font-family-display`, `--lufia-space-1`, `--lufia-space-2`, `--lufia-space-3`, `--lufia-space-4`, `--lufia-space-5`, `--lufia-status-icon-ring-border-width`, `--lufia-status-icon-size`.

## Content guidelines

All text arrives formatted and localised (dates in the user's locale: `5 Nov 2026` vs `05/11/2026`). Avoid colour words
("red") in labels.

## Stories

- `components-data-display-statustimeline--default`
- `components-data-display-statustimeline--single-track`
- `components-data-display-statustimeline--empty-track-omitted`
- `components-data-display-statustimeline--long-content`
- `components-data-display-statustimeline--all-themes`
