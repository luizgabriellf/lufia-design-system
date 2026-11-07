# RouteTransition

> Fades the content region in when the page changes, with no router dependency.

- Status: beta
- Category: Motion
- Import: `import { RouteTransition } from "@lufia/design-system/motion"`
- Also from: `@lufia/design-system`
- Source: [src/motion/RouteTransition](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/motion/RouteTransition)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-motion-routetransition--docs)

## Purpose

The content region of an app: when the page changes, the new content enters with a short fade and rise. It does not depend on any router.

## When to use

- The main content region of an app, keyed by the pathname.
- Tabbed or stepped content that behaves like pages.

## When not to use

- Persistent chrome such as headers and sidebars: keep them outside the region.
- Content that changes with search params or data refreshes: keep the key stable.
- Single elements that appear and disappear: use `Reveal`.

## API

### `RouteTransition`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `transitionKey` | `string \| number` | yes |  | Identifies the page being shown, usually the pathname. When it changes after the first render, the region's content enters. Anything that keeps the same key (a search-param change, a refresh, the first load) plays nothing. |
| `variant` | `"fade" \| "rise"` | no | `"rise"` | `rise` fades in and lifts a few pixels, `fade` only changes opacity (for a page that replaces a skeleton). |

Other native element attributes pass through to the root element.

## Example

```tsx
import { RouteTransition } from "@lufia/design-system/motion";

// With any router: pass the current path as the key.
<RouteTransition transitionKey={pathname}>
  <Banner data-route-static="" />
  {children}
</RouteTransition>;
```

## Accessibility

- Nothing is remounted: the region, its layouts and providers (toasts, filters, form state) keep their state. Only a marker attribute is set on the direct children, after React commits and before the browser paints, so the old page never animates.
- The first render, a refresh and any change that keeps the same `transitionKey` play nothing.
- Children with `data-route-static` and `position: fixed` children are skipped: a transform on them would restart a banner or change what a fixed element is fixed to.
- Under `prefers-reduced-motion` nothing is marked, so the page is simply there.
- Focus and scroll are not touched. Move focus to the new page yourself, as your router recommends.

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-motion-distance-rise`, `--lufia-motion-duration-enter`, `--lufia-motion-easing-out`.

## Stories

- `components-motion-routetransition--rise`
- `components-motion-routetransition--fade`
- `components-motion-routetransition--all-themes`
