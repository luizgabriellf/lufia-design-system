# NavRow

> A row that links to a destination, for lists of places and settings.

- Status: beta
- Category: Navigation
- Import: `import { NavRow } from "@lufia/design-system/components/NavRow"`
- Also from: `@lufia/design-system`
- Source: [src/components/NavRow](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/NavRow)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-navigation-navrow--docs)

## Purpose

A compact, clickable list row: an optional icon, a title with an optional badge, a description and a meta line, and a
trailing chevron. It is the row used to open a detail, a sub-page or a modal from a list of destinations.

## When to use

- A list of destinations where each needs a title and a sentence of context.

## When not to use

- Tabular data (use a table), or a row with several independent actions (a row can only have one target).

## API

### `NavRow`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `title` | `string` | yes |  |  |
| `description` | `string` | no |  | Supporting line under the title. |
| `meta` | `string` | no |  | Quiet last line: a date, a count, a status in words. |
| `badge` | `ReactNode` | no |  | Short trailing mark beside the title, such as a count. |
| `icon` | `ReactNode` | no |  | Decorative icon before the text; hidden from assistive technology. |
| `href` | `string` | no |  | Makes the row a link, rendered through the configured `linkComponent`. |
| `onClick` | `(event: MouseEvent<HTMLElement, MouseEvent>) => void` | no |  | Makes the row a button when there is no `href`. |
| `disabled` | `boolean` | no | `false` |  |

Other native element attributes pass through to the root element.

## Example

```tsx
import { NavRow } from "@lufia/design-system/components/NavRow";

<ul>
  <li>
    <NavRow
      title="Members"
      description="Invite people"
      meta="12 active"
      badge={12}
      icon={<UsersIcon />}
      href="/members"
    />
  </li>
  <li>
    <NavRow title="Export" onClick={openExport} />
  </li>
</ul>;
```

## Accessibility

- A link row is announced as a link and a button row as a button. The accessible name is the visible text, in reading
- Icon and chevron are decorative. The chevron mirrors in right-to-left layouts.
- A disabled link has `aria-disabled`, leaves the tab order and ignores clicks; a disabled button is natively disabled.
- Keyboard: Tab to reach it, Enter follows a link, Enter or Space activates a button. Focus shows a 2px ring. Minimum
- Put rows in a `ul` so a screen reader announces the count.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thick`, `--lufia-border-width-thin`, `--lufia-color-bg-surface`, `--lufia-color-bg-surface-raised`, `--lufia-color-border-strong`, `--lufia-color-border-subtle`, `--lufia-color-focus-ring`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-font-size-sm`, `--lufia-font-size-xs`, `--lufia-font-weight-bold`, `--lufia-motion-duration-instant`, `--lufia-motion-easing-out`, `--lufia-opacity-disabled`, `--lufia-radius-card`, `--lufia-radius-control`, `--lufia-radius-sm`, `--lufia-space-2`.

## Content guidelines

Titles are a noun or a short verb phrase. The description adds context and is never the only place for essential
information. Meta is for facts that change (a date, a count in words).

## Stories

- `components-navigation-navrow--as-link`
- `components-navigation-navrow--as-button`
- `components-navigation-navrow--static`
- `components-navigation-navrow--title-only`
- `components-navigation-navrow--disabled`
- `components-navigation-navrow--long-text`
- `components-navigation-navrow--phone-320`
- `components-navigation-navrow--right-to-left`
- `components-navigation-navrow--in-a-list`
- `components-navigation-navrow--all-themes`
