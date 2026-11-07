# DetailAttentionCard

> A high-signal card for deadlines and risk, with a tone mark and an optional action.

- Status: beta
- Category: Data display
- Import: `import { DetailAttentionCard } from "@lufia/design-system/components/DetailAttentionCard"`
- Also from: `@lufia/design-system`
- Source: [src/components/DetailAttentionCard](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/DetailAttentionCard)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-data-display-detailattentioncard--docs)

## Purpose

A high-signal card for deadlines, risk and missing-data states. A tone mark, a title, optional description
and meta line, and an optional call to action.

## When to use

- A single item needs the user's attention and you can state what to do next.

## When not to use

- Routine confirmations (use a toast) or long lists of problems (use a table with status cells).
- Do not stack more than two or three on a screen; if everything is urgent, nothing is.

## API

### `DetailAttentionCard`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `tone` | `DetailAttentionTone` | yes |  |  |
| `title` | `string` | yes |  |  |
| `description` | `string` | no |  |  |
| `meta` | `string` | no |  |  |
| `action` | `ReactNode` | no |  | Call-to-action rendered under the copy (a button or link). |
| `toneLabel` | `string` | no |  | Text that names the tone for assistive technology (for example "Overdue"). The tone is otherwise conveyed by colour and a glyph only, so pass it whenever the tone carries meaning. |

Other native element attributes pass through to the root element.

## Example

```tsx
import { DetailAttentionCard } from "@lufia/design-system/components/DetailAttentionCard";

<DetailAttentionCard
  tone="danger"
  toneLabel="Overdue"
  title="Subscription expired"
  action={<a href="/billing">Renew</a>}
/>;
```

## Accessibility

- Renders a `<section>` with an `<h3>`. Make sure the page's heading hierarchy fits, or wrap it in a labelled region.
- The tone is shown by colour and a glyph (`✓`, `!`, `·`) that are hidden from assistive technology. **Pass `toneLabel`**
- Foreground and background pairs in every tone pass AA in all theme and mode combinations (see Foundations / Colors).
- The action is a plain slot; its keyboard behaviour is the control you pass in. On narrow screens buttons and links in

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Its stylesheet reads no `--lufia-*` tokens directly (no CSS module, or it composes other components).

## Content guidelines

All copy comes in through props, already localised. Keep titles under about 60 characters; long strings wrap. Prefer a plain imperative verb for the action label ("Renew", not "Renew now!!").

## Stories

- `components-data-display-detailattentioncard--warn`
- `components-data-display-detailattentioncard--ok`
- `components-data-display-detailattentioncard--danger`
- `components-data-display-detailattentioncard--critical`
- `components-data-display-detailattentioncard--neutral`
- `components-data-display-detailattentioncard--title-only`
- `components-data-display-detailattentioncard--long-content`
- `components-data-display-detailattentioncard--all-tones`
- `components-data-display-detailattentioncard--all-themes`
