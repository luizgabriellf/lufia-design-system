# ListTransition

> Animates the items of a list as they are added and removed.

- Status: beta
- Category: Motion
- Import: `import { ListTransition } from "@lufia/design-system/motion"`
- Also from: `@lufia/design-system`
- Source: [src/motion/ListTransition](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/motion/ListTransition)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-motion-listtransition--docs)

## Purpose

Animates the items of a list as they are added and removed. A new key grows in (height through the `0fr` to `1fr`
technique of `Collapse`, plus opacity) and a removed key shrinks and fades out, then unmounts. Items present on the first
render do not animate.

## When to use

- Lists where the user adds or removes items: tasks, attachments, notifications, filter chips in a column.

## When not to use

- A list that is replaced wholesale by a fetch or a sort: only real adds and removals should animate.
- A single block that shows or hides: use [Collapse](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-motion-collapse--docs) or [Reveal](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-motion-reveal--docs).
- Very long lists: every item is a grid with its own wrapper.

## API

### `ListTransition`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `as` | `"div" \| "ol" \| "ul"` | no | `"ul"` | The list element. `ul` and `ol` render each item as an `li`; `div` renders each item as a `div`. Default `ul`. The item element is rendered by this component, so `ul > li` stays valid. |
| `items` | `readonly T[]` | yes |  | The items, in display order. Items present on the first render do not animate. |
| `getKey` | `(item: T) => string \| number` | yes |  | A stable, unique key of an item. A new key enters; a key that disappears leaves. Never use the index. |
| `children` | `(item: T) => ReactNode` | yes |  | Renders the content of one item. Do not return an `li`: the component renders it, with the item's classes, `data-state` and the `inert` and `aria-hidden` of a leaving item. While an item leaves, it keeps rendering its last `item`. |
| `itemClassName` | `string` | no |  | Class name for every item element (the `li`). |
| `ref` | `Ref<HTMLElement>` | no |  | Ref to the list element. |

Other native element attributes pass through to the root element.

## Types

- `ListTransitionProps`: `Omit<HTMLAttributes<HTMLElement>, "children"> & { as?: "div" | "ol" | "ul" | undefined; items: readonly T[]; getKey: (item: T) => string | number; children: (item: T) => ReactNode; itemClassName?: string | undefined; ref?: Ref<HTMLElement> | undefined; }`

## Example

```tsx
import { ListTransition } from "@lufia/design-system/motion";

<ListTransition as="ul" items={tasks} getKey={(task) => task.id} aria-label="Tasks">
  {(task) => <span>{task.label}</span>}
</ListTransition>;
```

## Accessibility

- `ul > li` (or `ol > li`) stays valid: the item is the `li`, with the animated content inside it, so no element sits between the list and its items.
- A leaving item stays in the DOM until its exit ends, but it is `inert` and `aria-hidden`: it cannot be focused or read.
- Focus: an item that leaves cannot keep focus. When the list element has a `tabIndex` (for example `-1`), focus moves to the list. Without one, the browser falls back to the document and placing focus (the next item, or the control that adds items) is the consumer's job, in the handler that removes the item.
- Items render as `display: grid`, so the native bullet or number is not drawn; style markers yourself.
- Items and exits are instant under `prefers-reduced-motion`: a removed item unmounts at once.
- The inner wrapper clips overflow while animating and at rest; leave room for focus rings of controls at its edge.
- Keys must be unique and stable. Adding a key that is still leaving brings the same item back.

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-motion-duration-enter`, `--lufia-motion-duration-exit`, `--lufia-motion-easing-in`, `--lufia-motion-easing-out`.

## Stories

- `components-motion-listtransition--default`
- `components-motion-listtransition--empty`
- `components-motion-listtransition--all-themes`
