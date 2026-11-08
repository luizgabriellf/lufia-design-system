# useStepDirection

> Tells a stepper whether it is moving forward or back.

- Status: beta
- Category: Hooks
- Import: `import { useStepDirection } from "@lufia/design-system/components/useStepDirection"`
- Also from: `@lufia/design-system`
- Source: [src/components/useStepDirection](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/useStepDirection)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/hooks-usestepdirection--docs)

## Purpose

Tells a multi-step flow which way it just moved, so the new step can slide in from the matching side.

## When to use

- Wizards and stepped dialogs, where direction helps people keep their place ("one direction language": forward is right, back is left).

## When not to use

- Tabs or other non-linear navigation, where there is no forward.

## API

### `useStepDirection`

Which way a multi-step flow just moved: `"next"` when `step` increased, `"back"` when it decreased, `undefined` until the first change (so opening a wizard never plays a slide) and again once the flow is no longer `active`. Render it as `data-step-direction` on the step container and let CSS slide the new step in from that side: forward comes from the right, back from the left.

```ts
useStepDirection(step: number, active?: boolean): StepDirection | undefined
```

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `step` | `number` | yes |  |
| `active` | `boolean` | no |  |

## Types

- `StepDirection`: `"next" | "back"`

## Example

```tsx
import { useStepDirection } from "@lufia/design-system/components/useStepDirection";

const direction = useStepDirection(step, open);

<div data-step-direction={direction}>{current}</div>;
```

## Accessibility

- The hook only returns a value; it moves nothing. Keep the keyframes `from`-only and driven by `--lufia-motion-*` tokens so they collapse under `prefers-reduced-motion` (see Motion).
- The direction must never be the only signal of the new step: announce it (`Stepper` does) and keep the heading current.
- Opening the flow returns `undefined`, so a wizard never slides on first paint.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Its stylesheet reads no `--lufia-*` tokens directly (no CSS module, or it composes other components).

## Stories

- `hooks-usestepdirection--default`
