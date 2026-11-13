# Checklist

> A read-only list of items with a status icon and text.

- Status: beta
- Category: Data display
- Import: `import { Checklist } from "@lufia/design-system/components/Checklist"`
- Also from: `@lufia/design-system`
- Source: [src/components/Checklist](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/Checklist)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-data-display-checklist--docs)

## Purpose

A read-only list of items, each with a status icon and text. It reports where things stand; it is not a form control.

## When to use

- Showing progress through a fixed set of steps or requirements the user cannot tick here.

## When not to use

- Items the user ticks (use `Checkbox`), steps in a flow (use `Stepper`), or events over time (use `StatusTimeline`).

## API

### `Checklist`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `items` | `readonly ChecklistItem[]` | yes |  |  |
| `title` | `ReactNode` | no |  | A visible title above the list. It also names the list for screen readers. |
| `statusLabels` | `Partial<Record<ChecklistStatus, string>>` | no |  | The status in words, read before the item text ("Done", "Needs attention"). Strings come from the app. A status without a label is conveyed by its icon alone, so give one for every status the list uses. |
| `density` | `"sm" \| "md"` | no | `"md"` | `md` (default) or `sm`, a tighter row for dense panels. |

Other native element attributes pass through to the root element.

## Types

- `ChecklistItem`: `{ key: string; text: ReactNode; status?: ChecklistStatus | undefined; hint?: ReactNode; }`
- `ChecklistProps`: `Omit<HTMLAttributes<HTMLDivElement>, "title"> & { items: readonly ChecklistItem[]; title?: ReactNode; statusLabels?: Partial<Record<ChecklistStatus, string>> | undefined; density?: "sm" | "md" | undefined; }`
- `ChecklistStatus`: `"todo" | "done" | "attention"`

## Example

```tsx
import { Checklist } from "@lufia/design-system/components/Checklist";

<Checklist
  title="Site inspection"
  statusLabels={{ todo: "To do", done: "Done", attention: "Needs attention" }}
  items={[
    { key: "date", text: "Check the fire extinguisher inspection date", status: "done" },
    {
      key: "route",
      text: "Clear the emergency exit route",
      status: "attention",
      hint: "Blocked on the last visit",
    },
    { key: "signs", text: "Replace the faded safety signs" },
  ]}
/>;
```

## Accessibility

- A native `<ul>`. The title names it through `aria-labelledby`; without a title, `aria-label` or `aria-labelledby` on the component go to the list.
- The status is never colour alone: each status has its own icon shape (`StatusIcon`), and `statusLabels` adds the status in words, visually hidden, before the item text.
- Nothing is interactive: no checkbox, no tab stop. Screen readers read it as a plain list.
- Long text wraps and never pushes the icon away, so the layout reflows at 320px.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Reads these semantic tokens: `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-font-size-sm`, `--lufia-font-size-xs`, `--lufia-font-weight-semibold`, `--lufia-space-1`, `--lufia-space-2`, `--lufia-space-3`.

## Content guidelines

Write each item as a short sentence. Give `statusLabels` for every status the list uses and translate them in the app. Use
`hint` for the reason or the date, not for a second action.

## Stories

- `components-data-display-checklist--default`
- `components-data-display-checklist--without-title`
- `components-data-display-checklist--compact`
- `components-data-display-checklist--all-done`
- `components-data-display-checklist--long-text`
- `components-data-display-checklist--inside-card`
- `components-data-display-checklist--empty`
- `components-data-display-checklist--phone-320`
- `components-data-display-checklist--right-to-left`
- `components-data-display-checklist--all-themes`
