# Disclosure

> A native details and summary with a turning chevron, for content that opens and closes without script.

- Status: beta
- Category: Data display
- Import: `import { Disclosure, disclosureClasses } from "@lufia/design-system/components/Disclosure"`
- Also from: `@lufia/design-system`
- Source: [src/components/Disclosure](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/Disclosure)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-data-display-disclosure--docs)

## Purpose

A section that opens and closes, built on the native `<details>` and `<summary>`. It is a real `<details>` element, so it
works without JavaScript, in a Server Component and in server-rendered pages; the package adds the look, a chevron that
turns and, where the browser supports it, a slide.

## When to use

- Secondary content most people do not need at once: answers, advanced options, the details of a row.
- Pages that are rendered on the server and must work without script.

## When not to use

- Content that is needed to make a decision or finish a task: show it.
- A set of views of one thing, where one is always shown (use tabs), or a menu of actions.
- A message that must be seen (use `Banner`).

## Exports

| Name | Kind |
| --- | --- |
| `Disclosure` | component |
| `disclosureClasses` | constant |

## API

### `Disclosure`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `children` | `ReactNode` | yes |  | The content that opens and closes. |
| `name` | `string` | no |  | Group name: details sharing a `name` open one at a time, natively. Browsers without support let several stay open, which is harmless. |
| `summary` | `ReactNode` | yes |  | The always visible label, rendered inside the native `<summary>`. Text or inline content; it is the control's name. |
| `defaultOpen` | `boolean` | no |  | Start open. The browser owns the state afterwards, so this works without JavaScript. |
| `variant` | `"boxed" \| "plain"` | no | `"boxed"` | `boxed` (default) draws a bordered surface; `plain` keeps only the summary row and the content. |
| `panelClassName` | `string` | no |  | Class for the content wrapper. |

Other native element attributes pass through to the root element.

## Types

- `DisclosureProps`: `Omit<DetailsHTMLAttributes<HTMLDetailsElement>, "title" | "summary"> & { summary: ReactNode; children: ReactNode; defaultOpen?: boolean | undefined; name?: string | undefined; variant?: "boxed" | "plain" | undefined; panelClassName?: string | undefined; }`

## Example

```tsx
import { Disclosure } from "@lufia/design-system/components/Disclosure";

<Disclosure summary="What is included in the plan?">Unlimited projects and email support.</Disclosure>;

{/* Opens one at a time: the same `name` makes a native group. */}
<Disclosure summary="Question one" name="help" defaultOpen>Answer one.</Disclosure>
<Disclosure summary="Question two" name="help">Answer two.</Disclosure>
```

## Accessibility

Follows the WAI-ARIA Authoring Practices pattern: [Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/).

Keyboard:

| Key | Action |
| --- | --- |
| Tab / Shift+Tab | Moves to the summary |
| Enter or Space | Opens or closes the section |

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thick`, `--lufia-border-width-thin`, `--lufia-color-bg-surface`, `--lufia-color-bg-surface-raised`, `--lufia-color-border-subtle`, `--lufia-color-focus-ring`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-disclosure-bg`, `--lufia-disclosure-border`, `--lufia-disclosure-panel-padding-inline`, `--lufia-disclosure-summary-padding-inline`, `--lufia-font-weight-medium`, `--lufia-motion-duration-enter`, `--lufia-motion-duration-fast`, `--lufia-motion-easing-in-out`, `--lufia-motion-easing-out`, `--lufia-radius-card`, `--lufia-space-1`, `--lufia-space-2`, `--lufia-space-3`, `--lufia-space-4`, `--lufia-target-touch`.

## Content guidelines

Write the `summary` so it makes sense on its own and says what is inside: "Shipping and returns", not "More". Keep it to
one line where you can; it wraps and the chevron stays at the end.

## Stories

- `components-data-display-disclosure--default`
- `components-data-display-disclosure--open-by-default`
- `components-data-display-disclosure--plain`
- `components-data-display-disclosure--plain-with-consumer-padding`
- `components-data-display-disclosure--exclusive-group`
- `components-data-display-disclosure--long-content`
- `components-data-display-disclosure--on-phone`
- `components-data-display-disclosure--classes-on-native-details`
- `components-data-display-disclosure--all-themes`
