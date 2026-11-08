# AnimatedNumber

> Counts a number to its new value and respects reduced motion.

- Status: beta
- Category: Motion
- Import: `import { AnimatedNumber } from "@lufia/design-system/motion"`
- Also from: `@lufia/design-system`
- Source: [src/motion/AnimatedNumber](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/motion/AnimatedNumber)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-motion-animatednumber--docs)

## Purpose

A number that counts to its new value when `value` changes. It uses `requestAnimationFrame`, no animation library.

## When to use

- Headline figures that can change while visible: totals, counters, progress percentages.

## When not to use

- Values that should not look like they are being computed (identifiers, dates, anything people copy exactly).
- Numbers that change many times per second. Show them directly.

## API

### `AnimatedNumber`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | `number` | yes |  |  |
| `format` | `(value: number) => string` | no | `String` | Turns the running number into text. Pass a locale-aware formatter; the default is `String`. |
| `duration` | `number` | no |  | Milliseconds. Defaults to the `--lufia-motion-duration-medium` token, which is ~0 under reduced motion. |

Other native element attributes pass through to the root element.

## Types

- `AnimatedNumberProps`: `Omit<HTMLAttributes<HTMLSpanElement>, "children"> & { value: number; format?: ((value: number) => string) | undefined; duration?: number | undefined; }`

## Example

```tsx
import { AnimatedNumber } from "@lufia/design-system/motion";

const money = new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" });

<AnimatedNumber value={total} format={(n) => money.format(n)} />;
```

## Accessibility

- It is not a live region. If the change matters to someone using a screen reader, announce it yourself (for example "Total updated to 1,280 euros" in a polite live region), or pair it with [ChangeHighlight](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-motion-changehighlight--docs).
- Under `prefers-reduced-motion` the new value appears at once; there are never intermediate numbers.
- Formatting and locale are yours: pass a formatter built with the user's locale.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Its stylesheet reads no `--lufia-*` tokens directly (no CSS module, or it composes other components).

## Stories

- `components-motion-animatednumber--default`
- `components-motion-animatednumber--formatted`
- `components-motion-animatednumber--slow`
- `components-motion-animatednumber--all-themes`
