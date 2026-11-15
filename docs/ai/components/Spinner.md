# Spinner

> A small inline loading ring that takes the colour of its text and can carry an accessible label.

- Status: beta
- Category: Feedback
- Import: `import { Spinner } from "@lufia/design-system/components/Spinner"`
- Also from: `@lufia/design-system`
- Source: [src/components/Spinner](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/Spinner)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-feedback-spinner--docs)

## Purpose

A small inline loading ring for work of unknown length. It takes the colour of the text around it, comes in three sizes
and stands still under `prefers-reduced-motion`.

## When to use

- A short, indeterminate wait inside a control, a row or a panel.

## When not to use

- A known amount of progress (use `ProgressBar`) or the shape of a page that is loading (use the skeletons).
- A page that must not be used until the work is done: use a modal pattern or `aria-busy` on the region.

## API

### `Spinner`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `size` | `"sm" \| "md" \| "lg"` | no | `"md"` | Ring size, from the icon scale: 16, 20 or 24px. Default `md`. |
| `label` | `string` | no |  | The accessible name ("Loading results"). With it the spinner is a polite status region that assistive technology reads. Without it the spinner is decorative (`aria-hidden`): use that when the surrounding control already says it is busy, for example a button with `aria-busy` and its own label. |

Other native element attributes pass through to the root element.

## Types

- `SpinnerProps`: `Omit<HTMLAttributes<HTMLSpanElement>, "children"> & { size?: SpinnerSize | undefined; label?: string | undefined; }`
- `SpinnerSize`: `"sm" | "md" | "lg"`

## Example

```tsx
import { Spinner } from "@lufia/design-system/components/Spinner";

<Spinner label="Loading results" />;

<p>
  <Spinner size="sm" /> Loading projects…
</p>;
```

## Accessibility

- With a `label` the spinner is `role="status"` and its text is read by assistive technology. Mount it when the work starts, or put the label on a region that already exists, so the announcement is reliable.
- Without a `label` it is `aria-hidden`. Use that when something else already says the page or control is busy: a button with `aria-busy` and its own text, or a line such as "Loading projects…" beside the ring.
- Never rely on the ring alone to say that work is in progress: it carries no text of its own.
- Under `prefers-reduced-motion` the ring stops turning and keeps its arc, so the state still reads. Under forced colours the track and the arc use system colours.
- The ring is a visual size of 16, 20 or 24px and is not interactive, so it has no target size.

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thick`, `--lufia-icon-size-lg`, `--lufia-icon-size-md`, `--lufia-icon-size-sm`, `--lufia-radius-full`, `--lufia-spinner-arc`, `--lufia-spinner-track`.

## Content guidelines

`label` is the localised state, in the present tense: "Loading results", not "Please wait".

## Stories

- `components-feedback-spinner--default`
- `components-feedback-spinner--sizes`
- `components-feedback-spinner--decorative`
- `components-feedback-spinner--inherits-colour`
- `components-feedback-spinner--in-a-button`
- `components-feedback-spinner--all-themes`
