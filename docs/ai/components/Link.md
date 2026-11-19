# Link

> Navigation inside text, routed through the adapter set on LufiaProvider.

- Status: beta
- Category: Actions
- Import: `import { Link } from "@lufia/design-system/components/Link"`
- Also from: `@lufia/design-system`
- Source: [src/components/Link](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/Link)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-actions-link--docs)

## Purpose

An inline text link. It goes through the app's router link, and an external one says that it leaves the page.

## When to use

- A link inside a sentence or a short block of text.
- Any link to another site, with `externalLabel`.

## When not to use

- An action that does something on the page: use `Button`.
- A call to action that looks like a button but navigates: use `Button` with `href`.
- A whole clickable surface: use `Card` with `href`.

## API

### `Link`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `href` | `string` | yes |  |  |
| `children` | `ReactNode` | yes |  |  |
| `externalLabel` | `string` | no |  | Marks the link as external: it opens in a new tab (`target="_blank"`, `rel="noopener noreferrer"`) and shows an indicator. The value is the visually hidden text read after the link text, such as "(opens in new tab)", so the new tab is announced. Giving the text is what makes a link external, so there is no external link without it. |
| `variant` | `"inline" \| "standalone"` | no | `"inline"` | `inline` (default) is a link inside running text: underlined at rest. `standalone` is a link on its own line or in a list or footer: no underline at rest, an underline on hover and focus, and a medium weight. Use it only where the surroundings, not colour alone, show that the text is a link (WCAG 1.4.1). |
| `iconStart` | `ReactNode` | no |  | Decorative icon before the text, hidden from assistive technology. It does not move on hover. |
| `iconEnd` | `ReactNode` | no |  | Decorative icon after the text, hidden from assistive technology. It moves 2px along the inline axis on hover, not under reduced motion. The external indicator, when there is one, comes after it. |

Other native element attributes pass through to the root element.

## Types

- `LinkProps`: `Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "href"> & { href: string; children: ReactNode; externalLabel?: string | undefined; variant?: LinkVariant | undefined; iconStart?: ReactNode; iconEnd?: ReactNode; }`
- `LinkVariant`: `"inline" | "standalone"`

## Example

```tsx
import { Link } from "@lufia/design-system/components/Link";

<Link href="/guide">read the guide</Link>
<Link href="https://example.com" externalLabel="(opens in new tab)">the specification</Link>
```

## Accessibility

Keyboard:

| Key | Action |
| --- | --- |
| Tab | Moves focus to the link |
| Enter | Follows the link |

- Inline links are underlined, so colour is not the only cue (WCAG 1.4.1). A `standalone` link is not underlined at rest, so use it only where its place or its neighbours show that it is a link, never inside running text.
- `externalLabel` makes a link external, so an external link cannot go without the announcement. It is read after the link text, so people using a screen reader know a new tab opens before they activate it. The visible icon is decorative and mirrored in right-to-left layouts.
- External links get `rel="noopener noreferrer"`.
- Focus shows a 2px ring. In forced-colors mode the link uses `LinkText`.

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thick`, `--lufia-color-focus-ring`, `--lufia-color-text-accent`, `--lufia-font-weight-medium`, `--lufia-motion-duration-fast`, `--lufia-motion-easing-out`, `--lufia-radius-xs`, `--lufia-target-touch`.

## Content guidelines

Make the link text meaningful on its own ("read the migration guide", not "click here"). Do not put the destination's URL in
the text unless the URL is the content.

## Stories

- `components-actions-link--default`
- `components-actions-link--external`
- `components-actions-link--standalone`
- `components-actions-link--with-icon-end`
- `components-actions-link--with-icon-start`
- `components-actions-link--inline-with-icon-end`
- `components-actions-link--long-text`
- `components-actions-link--phone-320`
- `components-actions-link--right-to-left`
- `components-actions-link--all-themes`
