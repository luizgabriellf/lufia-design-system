# CommandPalette

> A keyboard-first launcher that filters commands and pages.

- Status: beta
- Category: Overlays
- Import: `import { CommandPalette, filterCommands } from "@lufia/design-system/components/CommandPalette"`
- Also from: `@lufia/design-system`
- Source: [src/components/CommandPalette](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/CommandPalette)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-overlays-commandpalette--docs)

## Purpose

A search-and-run overlay opened with Ctrl+K or Cmd+K: type to filter navigation targets and actions, choose with the
arrow keys, run with Enter.

## When to use

- Apps with many destinations and actions, where power users want the keyboard.

## When not to use

- As the only way to reach something: every command should also exist in the visible UI.

## Exports

| Name | Kind |
| --- | --- |
| `CommandPalette` | component |
| `filterCommands` | function |

## API

### `CommandPalette`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `open` | `boolean` | yes |  |  |
| `onOpenChange` | `(open: boolean) => void` | yes |  |  |
| `items` | `readonly CommandItem[]` | yes |  |  |
| `labels` | `CommandPaletteLabels` | yes |  |  |
| `hint` | `ReactNode \| ((state: { query: string; }) => ReactNode)` | no |  | A tip about what can be searched. A node is shown while the field is empty. A function is called with the current query on every render and decides for itself (return `null` to show nothing), so a hint can show for a short query ("Type at least 2 characters"). It is not shown while `bodyOverride` is set. |
| `hintPlacement` | `"top" \| "bottom"` | no | `"bottom"` | Where the hint sits: `bottom` (default) under the results, `top` above them so it stays in view in a long list. |
| `notice` | `ReactNode` | no |  | Content above the results that does not replace them (an error from the server search, a warning about stale results). It sits in a region outside the listbox, so it is not an option, and the arrows and Enter keep working on the commands. The palette gives it no role: wrap an error in `role="alert"` and a plain note in nothing. |
| `filter` | `(item: CommandItem, query: string) => boolean` | no | `filterCommands` | Decides which commands match the query. Defaults to {@link filterCommands}: every word of the query, ignoring case and accents, must appear in the label, description, group or keywords. Pass `() => true` when `items` already comes filtered (a server search driven by `onQueryChange`). |
| `onQueryChange` | `(query: string) => void` | no |  | Called as the person types, for searches that ask a server: replace `items` with the answer, pass `filter={() => true}` so the palette does not filter it again, and set `loading` while the request runs. |
| `loading` | `boolean` | no | `false` | A search is in flight: `aria-busy` on the results, the empty message waits, so "No results" does not flash before the server answers, and `labels.loading` (when given) is shown below the commands and announced each time `loading` turns on. |
| `groupOrder` | `readonly string[]` | no |  | The order of the group headings, by name. Groups not listed follow, in the order they are first used; listed groups with no results are left out. Default: the order of first use. |
| `bodyOverride` | `ReactNode \| ((state: { query: string; }) => ReactNode)` | no |  | Replaces the results (and the empty message and hint) with your own content, such as an answer to the query. A function gets the current query. While it is set the field is not a listbox: arrows and Enter do nothing, and the results are not announced. The field keeps focus. |
| `onEscape` | `() => boolean \| void` | no |  | Called on Escape before the palette closes. Return `true` when you handled it (left a sub-mode, cleared an answer): the palette then stays open, and the next Escape closes it. Return anything else to close. |
| `shortcut` | `boolean` | no | `true` | Open on Ctrl+K and Cmd+K. Default `true`. |
| `container` | `HTMLElement \| null` | no |  | Where the palette is mounted. Defaults to `document.body`. |

### `filterCommands`

The default matcher: every word of `query` appears, ignoring case and accents, in the label, description, group or keywords.

```ts
filterCommands(item: CommandItem, query: string): boolean
```

## Types

- `CommandItem`: `{ key: string; label: string; description?: string | undefined; group?: string | undefined; icon?: ReactNode; tone?: CommandItemTone | undefined; keywords?: string | undefined; keepOpen?: boolean | undefined; onSelect: () => void; }`
- `CommandItemTone`: `"default" | "accent" | "danger"`
- `CommandPaletteLabels`: `{ title: string; placeholder: string; empty: (query: string) => ReactNode; resultCount: (count: number) => string; loading?: string | undefined; }`

## Example

```tsx
import { CommandPalette } from "@lufia/design-system/components/CommandPalette";

<CommandPalette
  open={open}
  onOpenChange={setOpen}
  items={[
    { key: "new", label: "New document", group: "Actions", icon: <PlusIcon />, onSelect: createDocument },
    {
      key: "settings",
      label: "Settings",
      group: "Go to",
      keywords: "preferences",
      onSelect: () => router.push("/settings"),
    },
  ]}
  labels={{
    title: "Search or run a command",
    placeholder: "Type a command or search…",
    empty: (query) => `No results for “${query}”`,
    resultCount: (count) => `${count} results`,
  }}
  hint="Search by name, or choose an action."
/>;
```

## Accessibility

Follows the WAI-ARIA Authoring Practices pattern: [Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).

Keyboard:

| Key | Action |
| --- | --- |
| Ctrl/Cmd + K | Opens the palette; closes it when open (`shortcut={false}` turns it off) |
| Type | Filters; the first match is highlighted |
| Down / Up | Moves the highlight, wrapping at the ends |
| Enter | Runs the highlighted command |
| Escape | Closes; focus returns to where it was |
| Tab | Cycles between the field and the close button |

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thick`, `--lufia-border-width-thin`, `--lufia-color-accent-default`, `--lufia-color-accent-subtle`, `--lufia-color-bg-canvas`, `--lufia-color-bg-surface-raised`, `--lufia-color-bg-surface-solid`, `--lufia-color-border-strong`, `--lufia-color-border-subtle`, `--lufia-color-focus-ring`, `--lufia-color-status-danger-bg`, `--lufia-color-status-danger-fg`, `--lufia-color-text-accent`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-color-text-subtle`, `--lufia-font-family-mono`, `--lufia-font-size-2xs`, `--lufia-font-size-lg`, `--lufia-font-size-sm`, `--lufia-font-size-xs`, `--lufia-font-weight-medium`, `--lufia-motion-distance-rise`, `--lufia-motion-duration-enter`, `--lufia-motion-duration-exit`, `--lufia-motion-easing-in`, `--lufia-motion-easing-out`, `--lufia-radius-control`, `--lufia-radius-full`, `--lufia-radius-md`, `--lufia-radius-panel`, `--lufia-radius-xs`, `--lufia-shadow-lg`, `--lufia-space-1`, `--lufia-space-2`, `--lufia-space-3`, `--lufia-space-4`, `--lufia-space-5`, `--lufia-z-modal`.

## Content guidelines

Command labels are verbs for actions ("New document") and nouns for destinations ("Settings"). Use `keywords` for the words
people might type that the label does not contain.

## Stories

- `components-overlays-commandpalette--default`
- `components-overlays-commandpalette--open-on-load`
- `components-overlays-commandpalette--single-group`
- `components-overlays-commandpalette--long-text`
- `components-overlays-commandpalette--phone-390`
- `components-overlays-commandpalette--phone-320`
- `components-overlays-commandpalette--fixed-section-order`
- `components-overlays-commandpalette--answer-replaces-results`
- `components-overlays-commandpalette--server-side-search`
- `components-overlays-commandpalette--server-search-with-status`
- `components-overlays-commandpalette--icon-tones`
