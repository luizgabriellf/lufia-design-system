# OptionRow

> A full-width row that is one button, with leading and trailing slots and a selected state, for a list of choices.

- Status: beta
- Category: Forms
- Import: `import { OptionRow } from "@lufia/design-system/components/OptionRow"`
- Also from: `@lufia/design-system`
- Source: [src/components/OptionRow](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/OptionRow)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-forms-optionrow--docs)

## Purpose

A full-width row that is one button: a leading slot, a title, an optional description, a trailing slot and a selected state.
It is for a list of choices the user picks from. `NavRow` is the sibling for a row that goes somewhere.

## When to use

- A short list of options, each with a name and a line of detail: a plan, a template, a delivery address.

## When not to use

- A row that navigates to another page: use `NavRow`.
- A set where exactly one choice applies and the options are one word: use `RadioGroup`.
- A choice among a few short labels in a bar: use `SegmentedToggle`.

## API

### `OptionRow`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `disabled` | `boolean` | no | `false` | The row cannot be chosen: a native `disabled` on the button, or `aria-disabled` on an element given to `render`. No effect with `interactive={false}`. Default `false`. |
| `title` | `ReactNode` | yes |  | The option's name. It is the row's accessible name together with the description. |
| `eyebrow` | `ReactNode` | no |  | Small accent line above the title, such as a category or a step. It is read before the title. |
| `description` | `ReactNode` | no |  | Supporting line under the title. |
| `meta` | `ReactNode` | no |  | Small muted line under the description, which may hold inline icons. It is read after the description. |
| `leading` | `ReactNode` | no |  | Decorative slot before the text, such as an icon or an avatar; hidden from assistive technology. |
| `trailing` | `ReactNode` | no |  | Slot after the text, such as a check mark, a price or a count. It is read after the title, so text in it must carry its own context. Mark a purely decorative one `aria-hidden` yourself. |
| `selected` | `boolean` | no |  | Marks the row as the chosen one: the accent subtle fill and border, and `aria-pressed` on the button (`aria-current` on an element given to `render`, which is usually a link). Leave it out for a row that is not a choice. |
| `density` | `"compact" \| "comfortable"` | no | `"comfortable"` | `comfortable` (default) is a bordered card row, for a short list of choices. `compact` is for a long pick list inside a menu, sheet or modal: no border or shadow, tighter block padding, a medium-weight title and a small muted description. The rows are separated by the parent's gap, or a hairline the parent draws. On a coarse pointer a compact row is still at least `--lufia-target-touch` tall. |
| `truncate` | `boolean` | no | `false` | Keeps the title, the description, the eyebrow and the meta each on one line, cut with an ellipsis, for a row in a narrow container such as a menu trigger. Default `false`: the text wraps. |
| `highlighted` | `boolean` | no | `false` | A purely visual emphasis: the accent subtle fill and border of `selected`, with no `aria-pressed` or `aria-current`. For a suggested or recommended option. Exposed as `data-highlighted`. |
| `interactive` | `boolean` | no | `true` | Default `true`. `false` renders the same layout as a plain `<div>` (or the element given to `render`) with no button semantics, no hover, press or focus affordance and no `onClick`, for a row that only displays. `selected` and `highlighted` still style it. `disabled` has no effect. |
| `ref` | `Ref<HTMLElement>` | no |  | The row's element (the button, or the `render` or static element), so a menu or popover can anchor to it. A trigger's spread props (`aria-expanded` and the rest) pass through. |
| `onClick` | `MouseEventHandler<HTMLElement>` | no |  | Called when the row is activated. Not called while `disabled`; not available with `interactive={false}`. |
| `render` | `ReactElement<RenderedElementProps, string \| JSXElementConstructor<any>>` | no |  | The element to render instead of the default `<button>`, such as a router link. It receives the row's class, state, content and `onClick`, and keeps its own props. It is not natively disabled: `disabled` marks it `aria-disabled` and ignores activation. Create it in a Client Component. With `interactive={false}` it is the static container instead. |

Other native element attributes pass through to the root element.

## Example

```tsx
import { OptionRow } from "@lufia/design-system/components/OptionRow";

<ul>
  <li>
    <OptionRow
      title="Team plan"
      description="Up to ten people."
      leading={<UsersIcon />}
      selected={picked === "team"}
      trailing={picked === "team" ? <CheckIcon /> : undefined}
      onClick={() => setPicked("team")}
    />
  </li>
</ul>;
```

## Accessibility

Keyboard:

| Key | Action |
| --- | --- |
| `Tab` | Moves focus to the row (a disabled one is skipped) |
| `Enter` / `Space` | Activates the row |

- The row is a native `<button type="button">`; its name is the title, the description and any text in the trailing slot.
- `selected` is `aria-pressed`, so the chosen row is announced as pressed and the state is never colour alone: the border and fill change, and the trailing slot can carry a check. Group the rows in a list or a labelled group.
- The leading slot is decorative and hidden from assistive technology.
- The `selected` state is `aria-pressed` on the button and `aria-current` on an element given to `render`; pick the one the element's role fits and do not set both.
- Comfortable rows are at least 3.5rem tall, above the touch target floor. Compact rows are 2.5rem on a fine pointer and at least `--lufia-target-touch` on a coarse one. Focus shows the shared ring.
- In forced-colors mode a selected, highlighted or expanded row takes a thicker `Highlight` border.
- `highlighted` and the eyebrow are not announced as a state. A static row is plain content, not a control.
- The press scale is off under `prefers-reduced-motion`.

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thick`, `--lufia-border-width-thin`, `--lufia-color-accent-border`, `--lufia-color-accent-subtle`, `--lufia-color-bg-surface`, `--lufia-color-bg-surface-raised`, `--lufia-color-border-strong`, `--lufia-color-border-subtle`, `--lufia-color-focus-ring`, `--lufia-color-text-accent`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-font-size-sm`, `--lufia-font-size-xs`, `--lufia-font-weight-bold`, `--lufia-font-weight-medium`, `--lufia-font-weight-semibold`, `--lufia-motion-duration-instant`, `--lufia-motion-easing-out`, `--lufia-motion-scale-press-subtle`, `--lufia-opacity-disabled`, `--lufia-option-row-description-size`, `--lufia-option-row-min-block-size`, `--lufia-option-row-padding-block`, `--lufia-option-row-padding-inline`, `--lufia-option-row-title-size`, `--lufia-radius-card`, `--lufia-radius-control`, `--lufia-target-touch`.

## Content guidelines

A title of one to four words, and a description that says what picking it means.

## Stories

- `components-forms-optionrow--default`
- `components-forms-optionrow--selected`
- `components-forms-optionrow--with-trailing-text`
- `components-forms-optionrow--title-only`
- `components-forms-optionrow--disabled`
- `components-forms-optionrow--rendered`
- `components-forms-optionrow--long-text`
- `components-forms-optionrow--guide-row`
- `components-forms-optionrow--truncated-trigger`
- `components-forms-optionrow--expanded`
- `components-forms-optionrow--highlighted`
- `components-forms-optionrow--static`
- `components-forms-optionrow--size-hooks`
- `components-forms-optionrow--choice-list`
- `components-forms-optionrow--compact-list`
- `components-forms-optionrow--compact-as-link`
- `components-forms-optionrow--compact-disabled`
- `components-forms-optionrow--phone-320`
- `components-forms-optionrow--right-to-left`
- `components-forms-optionrow--all-themes`
