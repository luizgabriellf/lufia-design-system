# SectionHeader

> The title row of one section of a page: heading, description and actions.

- Status: beta
- Category: Navigation
- Import: `import { SectionHeader } from "@lufia/design-system/components/SectionHeader"`
- Also from: `@lufia/design-system`
- Source: [src/components/SectionHeader](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/SectionHeader)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-navigation-sectionheader--docs)

## Purpose

The title row of one section of a page: a heading, an optional description and the section's actions. `PageHeader` is for the top of a page, this is for the blocks inside it.

## When to use

- Above a list, a chart or a table inside a page.
- To pair a title with a "View all" link or a few actions.

## When not to use

- The title of a page: use `PageHeader`.
- The title of a bordered surface: use `Card` with `title`, `description` and `headerAction`.

## API

### `SectionHeader`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `title` | `ReactNode` | yes |  |  |
| `headingLevel` | `2 \| 3 \| 4 \| 5 \| 6` | no | `2` | Heading level of `title` (2 to 6). Defaults to 2: pick the one that keeps the page outline in order. |
| `description` | `ReactNode` | no |  | One short line under the title. |
| `actions` | `ReactNode` | no |  | Links or controls at the end of the row ("View all"). They wrap under the text on narrow screens. |
| `titleId` | `string` | no |  | Id of the heading, so a `<section aria-labelledby>` can point at it. |

Other native element attributes pass through to the root element.

## Types

- `SectionHeaderProps`: `Omit<HTMLAttributes<HTMLDivElement>, "title"> & { title: ReactNode; headingLevel?: 2 | 3 | 4 | 5 | 6 | undefined; description?: ReactNode; actions?: ReactNode; titleId?: string | undefined; }`

## Example

```tsx
import { SectionHeader } from "@lufia/design-system/components/SectionHeader";

<section aria-labelledby="recent-title">
  <SectionHeader
    title="Recent activity"
    titleId="recent-title"
    description="The last five changes."
    actions={<Link href="/activity">View all</Link>}
  />
  {/* the section content */}
</section>;
```

## Accessibility

- `title` is a heading, level 2 by default. Set `headingLevel` to keep the page outline in order (a section inside a card is usually a 3).
- Give the heading an id with `titleId` and point the section at it with `aria-labelledby`, so the section is a named region.
- Actions follow the heading in the reading order and wrap under the text on narrow screens.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Reads these semantic tokens: `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-font-family-display`, `--lufia-font-line-height-normal`, `--lufia-font-line-height-tight`, `--lufia-font-size-lg`, `--lufia-font-size-sm`, `--lufia-font-weight-semibold`.

## Stories

- `components-navigation-sectionheader--default`
- `components-navigation-sectionheader--with-description`
- `components-navigation-sectionheader--with-link`
- `components-navigation-sectionheader--with-buttons`
- `components-navigation-sectionheader--long-title`
- `components-navigation-sectionheader--phone-320`
- `components-navigation-sectionheader--right-to-left`
- `components-navigation-sectionheader--all-themes`
