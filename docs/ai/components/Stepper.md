# Stepper

> Shows progress through a short, ordered flow.

- Status: beta
- Category: Navigation
- Import: `import { Stepper } from "@lufia/design-system/components/Stepper"`
- Also from: `@lufia/design-system`
- Source: [src/components/Stepper](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/Stepper)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-navigation-stepper--docs)

## Purpose

A mobile-first step indicator. Below 600px it shows a compact "2 / 4" caption with the active label; from 600px it
expands into a numbered row with connectors that fill as the user progresses.

## When to use

- Short linear flows (wizards, multi-step forms) of 3 to 7 steps.

## When not to use

- Non-linear navigation (use tabs) or dated process tracking (use `StatusTimeline`).

## API

### `Stepper`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `steps` | `StepDef[]` | yes |  |  |
| `current` | `number` | yes |  | Index of the active step (0-based). |
| `onStepClick` | `((index: number) => void)` | no |  | Optional: jump to an already-visited step. |

Other native element attributes pass through to the root element.

## Types

- `StepDef`: `{ key: string; label: string; }`
- `StepperProps`: `Omit<HTMLAttributes<HTMLDivElement>, "children"> & { steps: StepDef[]; current: number; onStepClick?: ((index: number) => void) | undefined; }`

## Example

```tsx
import { Stepper } from "@lufia/design-system/components/Stepper";

<Stepper steps={steps} current={index} onStepClick={setIndex} />;
```

## Accessibility

- A visually hidden `role="status"` live region announces "2 / 4: Review" when `current` changes, at every viewport.
- The active step's list item has `aria-current="step"`; every step exposes the name "2. Review" (visually hidden text, or
- Only already-visited steps are rendered as buttons, and only when `onStepClick` is given. Upcoming and current steps are
- Dots are 32px; focus shows a 2px ring. The connector fill is a transform transition and stops under

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thick`, `--lufia-color-accent-default`, `--lufia-color-bg-surface-solid`, `--lufia-color-border-subtle`, `--lufia-color-focus-ring`, `--lufia-color-text-accent`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-color-text-on-accent`, `--lufia-font-family-mono`, `--lufia-motion-duration-enter`, `--lufia-motion-easing-out`, `--lufia-space-1`, `--lufia-space-2`, `--lufia-space-3`.

## Content guidelines

Step labels are short nouns (one or two words). The mobile caption shows the full active label, so it may be longer than
what fits under a dot.

## Stories

- `components-navigation-stepper--default`
- `components-navigation-stepper--first-step`
- `components-navigation-stepper--last-step`
- `components-navigation-stepper--read-only`
- `components-navigation-stepper--long-labels`
- `components-navigation-stepper--mobile`
- `components-navigation-stepper--interactive`
- `components-navigation-stepper--all-themes`
