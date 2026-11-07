# Card

> A bordered surface that groups related content, optionally interactive.

- Status: beta
- Category: Data display
- Import: `import { Card } from "@lufia/design-system/components/Card"`
- Also from: `@lufia/design-system`
- Source: [src/components/Card](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/Card)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-data-display-card--docs)

## Purpose

A surface that groups related content, with an optional title, header action, body and footer. With `href` the whole card
is clickable through one link.

## When to use

- A self-contained unit: a record, a report, a summary, a setting group.
- An interactive card for a list of destinations where each item has a title and a bit of context.

## When not to use

- Content people need to select or copy: use a plain `Card`.
- Page layout or grouping that has no visual boundary: use spacing.
- A card with several equal destinations inside: link them separately, and leave the card plain.
- A card whose only content is a button: use `Button`.

## API

### `Card`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `title` | `ReactNode` | no |  | Heading of the card. With `href` it is also the text of the card's single link. |
| `headingLevel` | `2 \| 3 \| 4 \| 5 \| 6` | no | `3` | Heading level of `title` (2 to 6). Pick the one that fits the page outline. |
| `description` | `ReactNode` | no |  | One short line under the `title` (or on its own, when there is no title). |
| `headerAction` | `ReactNode` | no |  | Control or badge at the end of the header row. Not available together with `href` unless it is non-interactive. |
| `footer` | `ReactNode` | no |  | Pinned to the bottom of the card, separated from the body. |
| `href` | `string` | no |  | Makes the whole card clickable through one link: the `title` renders as a link whose hit area is stretched over the card. Needs a `title`, which is the link's accessible name. |
| `padding` | `CardPadding` | no | `"md"` | Inner spacing of every slot. Defaults to `md`. |
| `flush` | `boolean` | no | `false` | Lets the body span the full width of the card while the header and footer keep their padding. For lists and tables that draw their own row padding and dividers. |

Other native element attributes pass through to the root element.

## Example

```tsx
import { Card } from "@lufia/design-system/components/Card";

<Card title="Quarterly report" headerAction={<Badge tone="info">New</Badge>} footer={<Button size="sm">Download</Button>}>
  Totals for the period.
</Card>

<Card title="Quarterly report" href="/reports/q3">Totals for the period.</Card>
```

## Accessibility

Keyboard:

| Key | Action |
| --- | --- |
| Tab | Interactive card: focuses the link. Then any control in footer |
| Enter | Follows the link |

- `title` renders as a heading (`headingLevel`, default 3). Choose the level that keeps the page outline in order.
- In the interactive variant, put nothing interactive in `headerAction` and `footer` that duplicates the link's destination.
- Contrast of text on the surface is checked in every theme. The border and focus ring use semantic tokens; in
- Hover only adds an accent border and shadow; nothing is revealed on hover alone.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thick`, `--lufia-border-width-thin`, `--lufia-color-accent-border`, `--lufia-color-bg-surface`, `--lufia-color-border-subtle`, `--lufia-color-focus-ring`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-font-family-display`, `--lufia-font-line-height-normal`, `--lufia-font-line-height-tight`, `--lufia-font-size-md`, `--lufia-font-size-sm`, `--lufia-font-weight-semibold`, `--lufia-motion-duration-fast`, `--lufia-motion-easing-out`, `--lufia-radius-card`, `--lufia-shadow-md`, `--lufia-shadow-sm`.

## Content guidelines

A title says what the card is ("Quarterly report"). The body is one to three short lines. Do not repeat the title in the
body.

## Stories

- `components-data-display-card--default`
- `components-data-display-card--with-header-action`
- `components-data-display-card--with-footer`
- `components-data-display-card--with-description`
- `components-data-display-card--flush`
- `components-data-display-card--body-only`
- `components-data-display-card--interactive`
- `components-data-display-card--interactive-with-footer-button`
- `components-data-display-card--interactive-with-body-controls`
- `components-data-display-card--padding-none`
- `components-data-display-card--padding-small`
- `components-data-display-card--padding-large`
- `components-data-display-card--long-text`
- `components-data-display-card--phone-320`
- `components-data-display-card--right-to-left`
- `components-data-display-card--all-themes`
