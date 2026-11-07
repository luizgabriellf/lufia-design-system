# DetailSectionCard

> A titled card that holds one section of a detail page.

- Status: beta
- Category: Data display
- Import: `import { DetailSectionCard } from "@lufia/design-system/components/DetailSectionCard"`
- Also from: `@lufia/design-system`
- Source: [src/components/DetailSectionCard](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/DetailSectionCard)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-data-display-detailsectioncard--docs)

## Purpose

A section container for detail pages and modals with a consistent heading, optional description, icon, header action and
content area.

## When to use

- Group related read-only or editable details under one heading on a detail view.

## When not to use

- Page-level layout (it is not a page shell) or a single value (use `DetailList`).

## API

### `DetailSectionCard`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `children` | `ReactNode` | yes |  |  |
| `title` | `string` | yes |  |  |
| `description` | `string` | no |  |  |
| `icon` | `ReactNode` | no |  | Decorative icon shown before the title (hidden from assistive technology). |
| `action` | `ReactNode` | no |  | Control aligned to the end of the header, such as an "Edit" button. |

Other native element attributes pass through to the root element.

## Types

- `DetailSectionCardProps`: `Omit<HTMLAttributes<HTMLElement>, "title"> & { title: string; description?: string | undefined; icon?: ReactNode; action?: ReactNode; children: ReactNode; }`

## Example

```tsx
import { DetailSectionCard } from "@lufia/design-system/components/DetailSectionCard";

<DetailSectionCard title="Contact details" action={<a href="/contacts/edit">Edit</a>}>
  <DetailList rows={rows} />
</DetailSectionCard>;
```

## Accessibility

- A `<section>` with an `<h3>` title. Mind the heading level in the host page; it is fixed at 3 today.
- The icon is decorative and hidden from assistive technology; the title carries the meaning.
- The header action wraps below the title on narrow screens (`flex-wrap`) and stays reachable in tab order after the title.
- Long titles and descriptions use `overflow-wrap: anywhere`, so content reflows at 320px with no horizontal scrolling.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Its stylesheet reads no `--lufia-*` tokens directly (no CSS module, or it composes other components).

## Content guidelines

Strings arrive localised through props. Titles are nouns ("Contacts"), not sentences.

## Stories

- `components-data-display-detailsectioncard--default`
- `components-data-display-detailsectioncard--with-icon-and-action`
- `components-data-display-detailsectioncard--title-only`
- `components-data-display-detailsectioncard--long-content`
- `components-data-display-detailsectioncard--all-themes`
