# PendingSubmit

> A submit button that reads the pending state of its form and prevents double submits.

- Status: beta
- Category: Forms
- Import: `import { PendingSubmit } from "@lufia/design-system/components/PendingSubmit"`
- Also from: `@lufia/design-system`
- Source: [src/components/PendingSubmit](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/PendingSubmit)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-forms-pendingsubmit--docs)

## Purpose

The submit button of a form that takes a moment. While the form is pending it cannot be submitted again, shows a ring and a
pending label, and for a long wait moves through further labels.

## When to use

- The primary submit action of any form that waits for a server, so it never looks idle while it works.

## When not to use

- A button that is not a form submit: it does not read form state. Use a regular button.
- Actions that need a determinate progress bar (uploads): show the bar next to the form and use `pending` for the button.

## API

### `PendingSubmit`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `children` | `ReactNode` | yes |  | The label while idle ("Save changes"). |
| `pendingLabel` | `string` | yes |  | The label while the form is submitting ("Saving…"). It is announced to assistive technology. |
| `progress` | `PendingProgress` | no | `[]` | Labels that replace `pendingLabel` after a delay, for actions that can take long. |
| `pending` | `boolean` | no | `false` | Treat the button as pending although the form is not (yet). Use it to drive the button from `useActionState`, a `useTransition` or your own request state. It is combined with the form's own pending state. |
| `variant` | `ButtonVariant` | no | `"primary"` | Look of the underlying `Button`. Default `"primary"`. |
| `size` | `ButtonSize` | no |  |  |
| `fullWidth` | `boolean` | no |  |  |
| `ref` | `Ref<HTMLButtonElement>` | no |  |  |

Other native element attributes pass through to the root element.

## Example

```tsx
import { PendingSubmit } from "@lufia/design-system/components/PendingSubmit";

<form action={saveProject}>
  {/* fields */}
  <PendingSubmit pendingLabel="Saving…" progress={[[4000, "Still saving, this can take a moment…"]]}>
    Save changes
  </PendingSubmit>
</form>;
```

## Accessibility

- `aria-busy` and `aria-disabled` are set while pending (Button dims it, which is right while it waits). The button keeps its accessible name (the idle label).
- A live region next to the button (`role="status"`) announces `pendingLabel` when the wait starts and clears afterwards.
- The ring and the progress labels are `aria-hidden`; the status carries the meaning. The ring stops under
- The button keeps the width of its longest label (invisible copies reserve it), so it does not jump when the label changes.
- Target height is at least 44px; focus is a 2px ring.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Reads these semantic tokens: `--lufia-space-2`.

## Content guidelines

The idle label says what happens ("Save changes"), the pending label is the same verb in progress ("Saving…"), and a
progress label reassures ("Still saving, this can take a moment…"). Do not change the meaning between them, and do not leave the
button without a pending label.

## Stories

- `components-forms-pendingsubmit--default`
- `components-forms-pendingsubmit--secondary`
- `components-forms-pendingsubmit--pending`
- `components-forms-pendingsubmit--pending-secondary`
- `components-forms-pendingsubmit--with-progress`
- `components-forms-pendingsubmit--disabled`
- `components-forms-pendingsubmit--in-a-form`
- `components-forms-pendingsubmit--long-text`
- `components-forms-pendingsubmit--phone-320`
- `components-forms-pendingsubmit--right-to-left`
- `components-forms-pendingsubmit--all-themes`
