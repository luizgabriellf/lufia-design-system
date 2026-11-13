# CitationList

> A compact, wrapping list of references or sources, linked when they have a URL.

- Status: beta
- Category: Data display
- Import: `import { CitationList } from "@lufia/design-system/components/CitationList"`
- Also from: `@lufia/design-system`
- Source: [src/components/CitationList](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/CitationList)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-data-display-citationlist--docs)

## Purpose

A compact list of references or sources, drawn as chips that wrap. A reference with `href` is a link.

## When to use

- Pointing to the sources behind a statement, a result or a record.

## When not to use

- Navigation (use a menu or tabs), or a long bibliography with details per entry (use a table or a list with its own layout).

## API

### `CitationList`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `items` | `readonly CitationItem[]` | yes |  |  |
| `title` | `ReactNode` | no |  | A visible title above the list ("Sources"). It also names the list for screen readers. |

Other native element attributes pass through to the root element.

## Types

- `CitationItem`: `{ key: string; reference: ReactNode; label?: ReactNode; href?: string | undefined; }`
- `CitationListProps`: `Omit<HTMLAttributes<HTMLDivElement>, "title"> & { items: readonly CitationItem[]; title?: ReactNode; }`

## Example

```tsx
import { CitationList } from "@lufia/design-system/components/CitationList";

<CitationList
  title="Sources"
  items={[
    { key: "std", label: "Standard", reference: "Standard 123, clause 4", href: "/standards/123" },
    { key: "reg", reference: "Regulation 45, article 7" },
  ]}
/>;
```

## Accessibility

- A native `<ul>`. The title names it through `aria-labelledby`; without a title, `aria-label` or `aria-labelledby` on the component go to the list.
- A linked reference renders through `Link`, so it uses the `linkComponent` set on `LufiaProvider`, has a visible focus ring and keeps a target of at least 24px (WCAG 2.5.8).
- Long references wrap inside their chip; chips wrap onto new lines, so nothing overflows at 320px.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thin`, `--lufia-color-bg-surface`, `--lufia-color-border-subtle`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-font-size-sm`, `--lufia-font-size-xs`, `--lufia-font-weight-semibold`, `--lufia-radius-control`, `--lufia-space-1`, `--lufia-space-2`, `--lufia-space-3`.

## Content guidelines

Keep each reference short enough to scan: the document and the part, not the title in full. Use `label` for the kind of
source, and localise both in the app.

## Stories

- `components-data-display-citationlist--default`
- `components-data-display-citationlist--without-title`
- `components-data-display-citationlist--single-item`
- `components-data-display-citationlist--many-items`
- `components-data-display-citationlist--long-reference`
- `components-data-display-citationlist--inside-card`
- `components-data-display-citationlist--empty`
- `components-data-display-citationlist--phone-320`
- `components-data-display-citationlist--right-to-left`
- `components-data-display-citationlist--all-themes`
