# LufiaProvider

> Sets the link adapter and the aria-only labels once, at the root of an app.

- Status: beta
- Category: Utilities
- Import: `import { DEFAULT_LABELS, LufiaLink, LufiaProvider, useLufia } from "@lufia/design-system/components/LufiaProvider"`
- Also from: `@lufia/design-system`
- Source: [src/components/LufiaProvider](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/LufiaProvider)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-utilities-lufiaprovider--docs)

## Purpose

One place to adapt the package to an app: the **link component** that navigates, and the **aria-only labels** that
components fall back on. The package imports no router and no i18n library; this provider is the seam.

## When to use

- Once, at the root of every app that uses the package.
- Nested, to change the language or the router of one subtree.

## When not to use

- For visible copy (titles, messages, button text). Those are props on each component, so the app's own i18n layer owns them. `labels` is only text that assistive technology reads.

## Exports

| Name | Kind |
| --- | --- |
| `DEFAULT_LABELS` | constant |
| `LufiaLink` | component |
| `LufiaProvider` | component |
| `useLufia` | hook |

## API

### `LufiaLink`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `href` | `string` | yes |  |  |
| `ref` | `Ref<HTMLAnchorElement>` | no |  | React 19 passes `ref` as a prop; a link component should forward it to the anchor. |

Other native element attributes pass through to the root element.

### `LufiaProvider`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `linkComponent` | `LinkComponent` | no |  | Renders every navigating element of the package. Defaults to a plain `<a>`. |
| `labels` | `Partial<LufiaLabels>` | no |  | Aria-only text, merged over the defaults (and over an outer provider). |
| `children` | `ReactNode` | yes |  |  |

### `useLufia`

The link component and labels in effect. Safe outside a provider: it returns the defaults.

```ts
useLufia(): LufiaContextValue
```

Returned members:

| Member | Type | Required | Description |
| --- | --- | --- | --- |
| `linkComponent` | `LinkComponent` | yes |  |
| `labels` | `LufiaLabels` | yes |  |

## Types

- `LinkComponent`: `ComponentClass<LinkComponentProps, any> | FunctionComponent<LinkComponentProps>`
- `LinkComponentProps`: `AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; ref?: Ref<HTMLAnchorElement> | undefined; }`
- `LufiaContextValue`: `{ linkComponent: LinkComponent; labels: LufiaLabels; }`
- `LufiaLabels`: `{ close: string; dismiss: string; notifications: string; required: string; }`
- `LufiaProviderProps`: `{ linkComponent?: LinkComponent | undefined; labels?: Partial<LufiaLabels> | undefined; children: ReactNode; }`

## Example

```tsx
import { LufiaProvider } from "@lufia/design-system/components/LufiaProvider";
import NextLink from "next/link";

<LufiaProvider linkComponent={NextLink} labels={{ close: "Fechar", dismiss: "Dispensar" }}>
  {children}
</LufiaProvider>;
```

## Accessibility

- The defaults are neutral English so a missing provider never leaves a control without a name. In a localised app, always override them: a Portuguese page with an English "Close" button is an accessibility defect.
- A custom `linkComponent` must render a real anchor (`<a href>`) so links keep link semantics, middle-click and "open in new tab".

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Its stylesheet reads no `--lufia-*` tokens directly (no CSS module, or it composes other components).

## Stories

- `components-utilities-lufiaprovider--default`
- `components-utilities-lufiaprovider--translated-labels`
- `components-utilities-lufiaprovider--all-themes`
