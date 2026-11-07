# PageHeader

> The title row of a page with eyebrow, description and actions.

- Status: beta
- Category: Navigation
- Import: `import { PageHeader } from "@lufia/design-system/components/PageHeader"`
- Also from: `@lufia/design-system`
- Source: [src/components/PageHeader](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/PageHeader)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-navigation-pageheader--docs)

## Purpose

The top of a page: an optional eyebrow, the title as a heading, a description, and the page's actions.

## When to use

- The first element of the main content of a page.
- A section heading with its own actions (`headingLevel={2}`).

## When not to use

- The heading of a card or dialog: `Card` and `Modal` have their own.
- A marketing hero.

## API

### `PageHeader`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `eyebrow` | `ReactNode` | no |  | Small line above the title: the section or the parent record. |
| `title` | `ReactNode` | yes |  |  |
| `headingLevel` | `2 \| 3 \| 4 \| 5 \| 6 \| 1` | no | `1` | Heading level of `title`. Defaults to 1: a page has one. |
| `description` | `ReactNode` | no |  |  |
| `actions` | `ReactNode` | no |  | Page-level actions, usually a `PageActions`. They wrap under the text on narrow screens. |

Other native element attributes pass through to the root element.

## Types

- `PageHeaderProps`: `Omit<HTMLAttributes<HTMLElement>, "title"> & { eyebrow?: ReactNode; title: ReactNode; headingLevel?: 2 | 3 | 4 | 5 | 6 | 1 | undefined; description?: ReactNode; actions?: ReactNode; }`

## Example

```tsx
import { PageHeader } from "@lufia/design-system/components/PageHeader";

<PageHeader
  eyebrow="Reports"
  title="Quarterly overview"
  description="Totals for the period."
  actions={<Button variant="primary">New report</Button>}
/>;
```

## Accessibility

Keyboard:

The header is not interactive. Its actions follow the keyboard behaviour of the controls you pass.

- The title is a real heading. A page should have one level 1; use `headingLevel` for secondary headers so the outline stays in
- The eyebrow is a paragraph above the heading, not part of its name.
- Text contrast is checked in every theme. At 320px the title wraps instead of overflowing.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thin`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-color-text-subtle`, `--lufia-font-family-display`, `--lufia-font-family-mono`, `--lufia-font-line-height-normal`, `--lufia-font-line-height-tight`, `--lufia-font-size-2xl`, `--lufia-font-size-3xl`, `--lufia-font-size-sm`, `--lufia-font-size-xs`, `--lufia-font-weight-bold`, `--lufia-font-weight-semibold`, `--lufia-page-header-eyebrow-color`, `--lufia-page-header-eyebrow-dash-gap`, `--lufia-page-header-eyebrow-dash-size`, `--lufia-page-header-eyebrow-tracking`, `--lufia-page-header-title-size`, `--lufia-page-header-title-tracking`.

## Content guidelines

A title names the page in one to four words. The description is one sentence of context, not instructions. Put at most one
primary action in `actions`.

## Stories

- `components-navigation-pageheader--default`
- `components-navigation-pageheader--title-only`
- `components-navigation-pageheader--without-actions`
- `components-navigation-pageheader--without-eyebrow`
- `components-navigation-pageheader--section-heading`
- `components-navigation-pageheader--long-text`
- `components-navigation-pageheader--themed-by-tokens`
- `components-navigation-pageheader--phone-320`
- `components-navigation-pageheader--phone-390`
- `components-navigation-pageheader--right-to-left`
- `components-navigation-pageheader--all-themes`
