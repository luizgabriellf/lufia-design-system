# @lufia/design-system

## 0.73.1

### Patch Changes

- [#255](https://github.com/luizgabriellf/lufia-design-system/pull/255) [`af8b1bb`](https://github.com/luizgabriellf/lufia-design-system/commit/af8b1bb5b15b4731e8e8380af535c845cd7912b5) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Fix `Combobox` list height in short spaces: the list is never taller than the room left on its side (it was raised to about six rem and clipped), opens on the side with more room when both are short, and re-measures against the visual viewport so an on-screen keyboard that shrinks a dialog is accounted for.

## 0.73.0

### Minor Changes

- [#252](https://github.com/luizgabriellf/lufia-design-system/pull/252) [`360e436`](https://github.com/luizgabriellf/lufia-design-system/commit/360e4366bf5034755f1bc070524a08abcf591209) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - New tokens `--lufia-control-height` (2.75rem) and `--lufia-control-height-sm` (2rem). Form controls and the rows that hold them read their height from them, so a theme can set density in one place. No visual change at the default values.

- [#253](https://github.com/luizgabriellf/lufia-design-system/pull/253) [`96ac616`](https://github.com/luizgabriellf/lufia-design-system/commit/96ac6167f06487ece5cc61e9f3b8b867c78bdc78) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - `Toast`: on touch screens a toast can be swiped sideways to dismiss it. It follows the finger, leaves in the direction of the swipe past 40% of its width or on a quick flick, and returns otherwise. The close button and the timer are unchanged.

## 0.72.0

### Minor Changes

- [#250](https://github.com/luizgabriellf/lufia-design-system/pull/250) [`aa3e587`](https://github.com/luizgabriellf/lufia-design-system/commit/aa3e587f0d92ee43a7c2cdda674e519583cfb322) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - `Combobox`, `SearchInput` and `DateField` take `size="sm"`, the same compact height `TextInput` and `Select` already offer, so a dense filter bar lines up.

## 0.71.0

### Minor Changes

- [#247](https://github.com/luizgabriellf/lufia-design-system/pull/247) [`6dff178`](https://github.com/luizgabriellf/lufia-design-system/commit/6dff1789bf103c6a6bbab27a00ba5eb4dfa3ec12) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - `Reveal` takes `as` (`"div"`, `"section"`, `"article"`, `"p"` or `"li"`), so a notice, a paragraph or a list item can be the revealed element itself instead of sitting in a wrapper `div`.

## 0.70.0

### Minor Changes

- [#246](https://github.com/luizgabriellf/lufia-design-system/pull/246) [`027016d`](https://github.com/luizgabriellf/lufia-design-system/commit/027016df98fae6031af943fae270d63f94cf9379) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Three motion tokens name the scale a surface arrives from and leaves to: `--lufia-motion-scale-enter` (0.96, anchored panels), `--lufia-motion-scale-enter-subtle` (0.98, dialogs and palettes) and `--lufia-motion-scale-exit` (0.98). `Menu`, `Popover`, `NotificationCenter`, `Modal` and `CommandPalette` read them instead of repeating the numbers, so an app's own panels can match. The values are unchanged, and like the press tokens they reset to `1` under reduced motion.

- [#242](https://github.com/luizgabriellf/lufia-design-system/pull/242) [`d02d5c3`](https://github.com/luizgabriellf/lufia-design-system/commit/d02d5c33cf87e8a591364088d5887cc6e058b616) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - `ProgressBar` gets `indeterminate`, for work whose length is not known yet. The bar states no value (`aria-valuenow` is absent), a short fill travels along the track with a transform-only animation that mirrors in right-to-left, and under reduced motion the fill stays in place and fades gently. `value` is left out with `indeterminate`; every existing use is unchanged.

### Patch Changes

- [#243](https://github.com/luizgabriellf/lufia-design-system/pull/243) [`ea20a71`](https://github.com/luizgabriellf/lufia-design-system/commit/ea20a714c905d9f2ba840574855c1e7a3eef84db) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Menu items ease their hover fill and answer a press with the subtle press scale, and the `Disclosure` summary eases its hover fill, so both match the rows, tabs and cards around them. Nothing changes under reduced motion beyond the fill, since the press token is `1` there.

- [#245](https://github.com/luizgabriellf/lufia-design-system/pull/245) [`01f84da`](https://github.com/luizgabriellf/lufia-design-system/commit/01f84dafcd771bafa3abe85a351727996d4f6e5e) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Every prop of every exported component now has a description in its JSDoc, so editors and the generated AI docs explain what each prop does; no runtime or type change.

## 0.69.0

### Minor Changes

- [#240](https://github.com/luizgabriellf/lufia-design-system/pull/240) [`ef166d8`](https://github.com/luizgabriellf/lufia-design-system/commit/ef166d8883ac4270a171904bd1bcc744b3284c0e) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - `Stagger` renders as a description list with `as="dl"` and takes a `ref` to its root element.

## 0.68.0

### Minor Changes

- [#238](https://github.com/luizgabriellf/lufia-design-system/pull/238) [`e586539`](https://github.com/luizgabriellf/lufia-design-system/commit/e586539dffb9c9a39bc3a9e23835720ef3bb4787) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - `Stagger` can now render as a real list: pass `as="ul"` or `as="ol"` with `li` children and they stay the direct children of the list, so list semantics are intact (the default is still a `div`). In `Menu`, native link items (`native` with `href`, `download`, `target`, `rel`) now add `rel="noopener noreferrer"` automatically for `target="_blank"` when no `rel` is given, and a disabled native item is rendered without `href`.

## 0.67.1

### Patch Changes

- [#236](https://github.com/luizgabriellf/lufia-design-system/pull/236) [`9e4498b`](https://github.com/luizgabriellf/lufia-design-system/commit/9e4498b1270ca5aa77d1c2b6c38c0a431c297084) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - `ListTransition`: form controls inside a leaving item are disabled, so they no longer take part in form submission or validation during the exit, and a leaving item under a non-rendered ancestor unmounts at once. The item content wrapper is now a `fieldset` with `role="none"` instead of a `div`: it is listed in `form.elements`, and selectors that targeted the inner `div` need updating.

## 0.67.0

### Minor Changes

- [#234](https://github.com/luizgabriellf/lufia-design-system/pull/234) [`fb078ff`](https://github.com/luizgabriellf/lufia-design-system/commit/fb078ffd9ae0e00c6be39381eebb9db86efe7222) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - `IconButton` now shows the package tooltip instead of a native `title` attribute: it appears on mouse hover and keyboard focus, is `aria-hidden` (the `aria-label` stays the name) and no `title` attribute is rendered. Consuming apps that query an icon button by title should query by accessible name. New props: `tooltipPlacement` (default `top`) and `tooltip` (default `true`; pass `false` when you wrap the button in your own `Tooltip`). `MoreActions` and `NotificationCenter` hide the tooltip while their popup is open.

## 0.66.0

### Minor Changes

- [#233](https://github.com/luizgabriellf/lufia-design-system/pull/233) [`84d0086`](https://github.com/luizgabriellf/lufia-design-system/commit/84d00860c9796d31a029398426199bc19822e0a6) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `ListTransition` (beta), a motion primitive that animates the items of a list as they are added and removed, keeping `ul > li` valid and honouring reduced motion.

- [#231](https://github.com/luizgabriellf/lufia-design-system/pull/231) [`312e0db`](https://github.com/luizgabriellf/lufia-design-system/commit/312e0dbb431333a6f6a00fc10dda3fee547e5d9b) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `Tooltip` (hover and focus, flips to fit, `aria-describedby` or `aria-labelledby`) and `MenuToggleIcon` (three bars that morph into a cross). The `AppShell` rail tooltip now runs on the same behaviour.

## 0.65.0

### Minor Changes

- [#229](https://github.com/luizgabriellf/lufia-design-system/pull/229) [`6a8eaaa`](https://github.com/luizgabriellf/lufia-design-system/commit/6a8eaaace4d7cb5e0885d1148df5988c758baa5c) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `ChoiceTile`, a pressable, selectable tile for picking one value from a short visible set laid out in a row, a wrapping grid or a scrolling strip, such as a day, a time slot or a plan. It has an optional eyebrow and description, `solid` and `subtle` selected emphasis, `sm` and `md` sizes with a touch-sized target, and `fullWidth`.

- [#230](https://github.com/luizgabriellf/lufia-design-system/pull/230) [`a5428a3`](https://github.com/luizgabriellf/lufia-design-system/commit/a5428a333bfda4421f3ac263d271884ffd371a85) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Extend `OptionRow` for card-style rows and menu triggers: `eyebrow` and `meta` lines, `truncate` for one-line text with an ellipsis, a visual-only `highlighted` state, an open look for `aria-expanded="true"`, `interactive={false}` for a static non-button row, a `ref` prop, and the `--lufia-option-row-*` size hooks (minimum height, padding, title and description size) that keep the touch floor. Add `size="xl"` (4rem) and `shape="circle"` to `IconButton`, with the `--lufia-icon-button-size` and `--lufia-icon-button-icon-size` hooks. All defaults and existing rendering are unchanged.

- [#227](https://github.com/luizgabriellf/lufia-design-system/pull/227) [`9774b74`](https://github.com/luizgabriellf/lufia-design-system/commit/9774b7429a21fdac4d68d603d19bfc863ba92957) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `density="compact"` to `OptionRow` for long pick lists in menus, sheets and modals. Add `iconStart` to `Link`, with a touch-sized target for the standalone variant on coarse pointers. Add `tone` to `Chip` and document that a pressable chip forwards `aria-expanded`, `aria-haspopup` and `aria-controls`. Give a pressed `IconButton` or `Button` (`aria-pressed`) a distinct accent style. Add `description` and `meta` to `Disclosure`.

## 0.64.0

### Minor Changes

- [#226](https://github.com/luizgabriellf/lufia-design-system/pull/226) [`4a9a0ad`](https://github.com/luizgabriellf/lufia-design-system/commit/4a9a0ad4f566b8d024c60a55bb4068a144c9688b) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Button: add `variant="link"`, text-styled for an action inside a sentence or a quiet "show more". It inherits the
  surrounding font size when `size` is omitted and stays text-sized on touch screens, where a pseudo-element takes the touch.

- [#226](https://github.com/luizgabriellf/lufia-design-system/pull/226) [`4a9a0ad`](https://github.com/luizgabriellf/lufia-design-system/commit/4a9a0ad4f566b8d024c60a55bb4068a144c9688b) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Chip: new compact pill control for an action to apply, a toggle (`selected`, `aria-pressed`) or a removable value
  (`onRemove` with a required `removeLabel`), with `--lufia-chip-*` theme hooks.

- [#226](https://github.com/luizgabriellf/lufia-design-system/pull/226) [`4a9a0ad`](https://github.com/luizgabriellf/lufia-design-system/commit/4a9a0ad4f566b8d024c60a55bb4068a144c9688b) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Link: add `variant` (`inline`, the default, or `standalone`) and `iconEnd`, a decorative trailing icon that nudges along
  the inline axis on hover.

- [#226](https://github.com/luizgabriellf/lufia-design-system/pull/226) [`4a9a0ad`](https://github.com/luizgabriellf/lufia-design-system/commit/4a9a0ad4f566b8d024c60a55bb4068a144c9688b) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - OptionRow: new full-width row that is one button, with a leading slot, a title, an optional description, a trailing slot
  and a selected state (`aria-pressed`), for a list of choices.

- [#226](https://github.com/luizgabriellf/lufia-design-system/pull/226) [`4a9a0ad`](https://github.com/luizgabriellf/lufia-design-system/commit/4a9a0ad4f566b8d024c60a55bb4068a144c9688b) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - PendingSubmit: add `iconStart`, a decorative icon before the label that the pending ring replaces without a layout shift.

### Patch Changes

- [#224](https://github.com/luizgabriellf/lufia-design-system/pull/224) [`7e7bb69`](https://github.com/luizgabriellf/lufia-design-system/commit/7e7bb697113c84f3f0c44b88e1e2669515abbc12) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Button: throw a clear error when `render` is not a React element, such as a lazy reference from a Server Component,
  instead of a `TypeError` about `className`.

## 0.63.0

### Minor Changes

- [#222](https://github.com/luizgabriellf/lufia-design-system/pull/222) [`887c06b`](https://github.com/luizgabriellf/lufia-design-system/commit/887c06bff7aeaddbf927db4e8ba152478d77de45) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Button: add `render`, which swaps in an element of your own (a router link with a route object or a locale, or a plain
  anchor) and gives it the button's class, state and content.

## 0.62.0

### Minor Changes

- [#220](https://github.com/luizgabriellf/lufia-design-system/pull/220) [`bc9c5b0`](https://github.com/luizgabriellf/lufia-design-system/commit/bc9c5b0f57fbc46103e93535d71f280e9fd2840c) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - `Button` gains theme hooks for a more expressive surface, with no new props. `--lufia-button-primary-border` and `-border-hover` (also `secondary-border-hover` and `danger-border`) set the border apart from the fill, so a gradient fill no longer degrades the border to `currentcolor`; unset, the border is transparent with the fill painted under it, which renders the same as before. `--lufia-button-{primary,secondary,ghost,danger}-shadow` and `-shadow-hover` add elevation (default `none`), and `--lufia-button-hover-lift` (default `0`) raises a hovered button by a length, only where a pointer can hover, never while disabled or loading, and not under reduced motion; the press scale takes over while held. A theme that set only `--lufia-button-primary-bg` or `--lufia-button-danger-bg` to a translucent colour now gets no separate border ring.
  
  Behaviour change: a `loading` button no longer reacts to hover. It keeps its resting fill (and `danger` keeps its resting brightness) instead of taking the hover fill, since it cannot be pressed while loading.

- [#219](https://github.com/luizgabriellf/lufia-design-system/pull/219) [`5d0e0f6`](https://github.com/luizgabriellf/lufia-design-system/commit/5d0e0f692a31137e229e9e282a3ba81a7ab7064e) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Surfaces and numbers read as more finished, through tokens only. The light `--lufia-shadow-sm`, `-md` and `-lg` are now two layers each, a tight contact shadow plus a soft ambient one with negative spread, whose hue comes from the new `--lufia-shadow-color` (override it to tint every light level; a theme that sets `--lufia-shadow-*` wholesale keeps working, and the dark levels are unchanged). New `--lufia-font-numeric-tabular` is applied to stat values, table numeric cells, counts, pagination, percentages, date and time fields and chart labels. New `--lufia-letter-spacing-tight` (-0.03em), `-caps` (0.06em) and `-wide` (0.1em) replace the literal tracking values: no label moves by more than 0.02em. Focus rings read `--lufia-border-width-thick`, and the narrow-screen `DetailSurface` cards read `--lufia-radius-card`. Stylelint now rejects a literal `letter-spacing`, focus-ring width, radius or `box-shadow` colour in component CSS. No component API changes.

- [#217](https://github.com/luizgabriellf/lufia-design-system/pull/217) [`b055b65`](https://github.com/luizgabriellf/lufia-design-system/commit/b055b6542df4678316f81e873d48b326dfed0809) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - The overlays that vanished on close now animate out, with the exit duration and easing, a fade and the reverse of their entrance: the `MoreActions` sheet and its backdrop, the `NotificationCenter` sheet, the `Combobox` popup (which holds its list as it was while it leaves), the app shell's rail tooltip, a `Modal` rendered as a native `dialog` (it stays open while it leaves, then closes and returns focus to the opener), and a `keepMounted` `Modal` panel and backdrop. A leaving surface is inert and takes no pointer, opening it again during the exit goes straight to open, and under reduced motion it goes at once. The shared presence hook also gets a timeout for an `animationend` that never arrives.
  
  Migration for tests: after a close, these now stay in the document, inert, until the exit ends (a frame in jsdom, which has no stylesheet): a `renderAs="dialog"` `Modal` (focus returns to its opener only once it has closed), a `keepMounted` `Modal` panel (hidden, not removed), the `Combobox` listbox, the `MoreActions` and `NotificationCenter` sheets, and the rail tooltip. Assertions made right after a close must await the removal (`waitFor`, `findBy*`, `waitForElementToBeRemoved`); role queries do not treat `inert` as hidden, so `queryByRole` still finds a leaving surface. To remove them at once instead, make `window.matchMedia("(prefers-reduced-motion: reduce)").matches` true in the test setup (stub `matchMedia`); the package offers no other switch and exports nothing new for it.

- [#216](https://github.com/luizgabriellf/lufia-design-system/pull/216) [`5810ed7`](https://github.com/luizgabriellf/lufia-design-system/commit/5810ed740fca43466e30713252b6a00795ea3c08) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Small controls feel physical. New tokens `--lufia-motion-easing-spring` (a gentle spring: a `linear()` curve where supported, a cubic-bezier elsewhere), `--lufia-motion-scale-press` (0.97) and `--lufia-motion-scale-press-subtle` (0.985); both scales reset to 1 under reduced motion. Button, Switch (the thumb), Checkbox, RadioGroup, SegmentedToggle, PeerNav, Tabs, NavRow, Card (interactive), Pagination and FilterLinks compress while pressed, never when disabled. The switch thumb, the segmented and peer-navigation indicators and the radio dot use the spring; the checkbox check draws in and unchecking is a plain fast fade. The mobile float bar and StatTile press effects now read the tokens, so the float bar press is 0.97 instead of 0.94, and the Button press is a scale instead of a 1px shift. Spring is for small elements travelling under about 2 rem, never for dialogs, sheets, popovers, menus or toasts (docs/MOTION.md).

## 0.61.0

### Minor Changes

- [#214](https://github.com/luizgabriellf/lufia-design-system/pull/214) [`decf021`](https://github.com/luizgabriellf/lufia-design-system/commit/decf021c3be21d1638f7ce6d884c0ad18aca6086) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - FilterLinks has a `layout="grid"` option: equal columns, as many as fit, where each chip fills its cell with the label at the start and the count at the end. It suits many filters with counts, whose ragged widths are hard to scan when wrapped. The narrowest column is `--lufia-filter-links-column-min` (default `9rem`). `count` also accepts an element, for a count that carries its own emphasis.

## 0.60.0

### Minor Changes

- [#212](https://github.com/luizgabriellf/lufia-design-system/pull/212) [`4ddffca`](https://github.com/luizgabriellf/lufia-design-system/commit/4ddffcae1bdbd4e8541a46702ebaad0965bf5570) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Button `primary` and `secondary` fills have optional theme hooks, like `danger` already had: `--lufia-button-primary-bg`, `--lufia-button-primary-bg-hover`, `--lufia-button-primary-fg`, `--lufia-button-secondary-bg`, `--lufia-button-secondary-bg-hover`, `--lufia-button-secondary-border` and `--lufia-button-secondary-fg`. Unset, each falls back to the semantic token the variant used before, so nothing changes until a theme sets one.

## 0.59.0

### Minor Changes

- [#209](https://github.com/luizgabriellf/lufia-design-system/pull/209) [`74dd6f1`](https://github.com/luizgabriellf/lufia-design-system/commit/74dd6f17459d4e3435c2106d692f0bd7f459647f) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - FilterLinks: an item accepts `native`, which renders a plain `<a>` instead of going through the `LufiaProvider` link
  adapter, for a link that must do a full document navigation. It has the same meaning as the `native` option of `Menu` items.

### Patch Changes

- [#210](https://github.com/luizgabriellf/lufia-design-system/pull/210) [`7fb6b02`](https://github.com/luizgabriellf/lufia-design-system/commit/7fb6b02a29d0729464f0d5cc2d1ea221c7e881d6) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Text controls: the autofill colour now fills the whole field box, so a prefix or suffix (a unit, a show/hide button) sits on
  the same tint as the autofilled text instead of the field looking cut in two. Read-only and disabled boxes keep their
  surface colour, the invalid inner line and the focus ring are unchanged, and forced-colors keeps the system colours.

## 0.58.0

### Minor Changes

- [#206](https://github.com/luizgabriellf/lufia-design-system/pull/206) [`f390b74`](https://github.com/luizgabriellf/lufia-design-system/commit/f390b74d512a2e8b8b506b7c16c077785037a9ec) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - FilterLinks (beta): a labelled row of links that each apply a filter to one list through the URL, with an optional count. Links render
  through the `LufiaProvider` link adapter, the current one is marked `aria-current="true"`, the row wraps onto more lines
  without widening the page, and chips are 44px tall under a coarse pointer. It carries no state, so a Server Component can render
  it. Themed with `--lufia-filter-links-*` hooks.

- [#207](https://github.com/luizgabriellf/lufia-design-system/pull/207) [`3f9bb7d`](https://github.com/luizgabriellf/lufia-design-system/commit/3f9bb7d479f4752e31cd4d92e058c48e2bcc2425) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - OneWayDisclosure (beta): a button that reveals a region and hides itself once it has, for an invitation such as "Fill in now" that opens a
  form in place. The button carries `aria-expanded` and `aria-controls`; on activation the content is shown and focus moves into it
  before the button is hidden, so focus is never lost. Uncontrolled (`defaultOpen`) or controlled (`open`, `onOpenChange`); `label`
  exposes the content as a named region, `variant` styles the button. Focus does not move on first render.

## 0.57.0

### Minor Changes

- [#204](https://github.com/luizgabriellf/lufia-design-system/pull/204) [`f1c9570`](https://github.com/luizgabriellf/lufia-design-system/commit/f1c95709ee6b6a2592d1d25e0e1c6de724040f1a) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Banner: `ref` now reaches the root element (typed), and the opt-in `focusOnMount` gives the root `tabIndex={-1}` and moves
  focus to it once when it mounts, for a message that replaces what the person was doing. It never takes focus again on a
  re-render. The `live` roles are unchanged and the banner still never takes focus by default; the page documents when to
  use `live` and when to use `focusOnMount`. Banner is now a client component, as it owns a ref and an effect.

- [#202](https://github.com/luizgabriellf/lufia-design-system/pull/202) [`5649234`](https://github.com/luizgabriellf/lufia-design-system/commit/5649234bdb37b54a9ff8f7e77f495b5c969b343d) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Disclosure: `summaryClassName` for the `<summary>` row, `size="compact"` for a tighter row and padding (with
  `--lufia-disclosure-summary-padding-block`, `--lufia-disclosure-summary-min-block-size` and
  `--lufia-disclosure-panel-padding-block` hooks), and `indicator` to replace the chevron with any node or remove it with
  `null`. Without the props the rendering is unchanged.

- [#203](https://github.com/luizgabriellf/lufia-design-system/pull/203) [`2f8adc3`](https://github.com/luizgabriellf/lufia-design-system/commit/2f8adc3a249f1d37946cf19f8dd8461d8b3def29) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Menu: a link item can be `native`. It renders a plain `<a>` with `href`, and `download`, `target` and `rel` passed
  through, instead of going through the `LufiaProvider` link adapter, so it is never prefetched and never a client-side
  transition (file downloads, server routes). Keyboard, type-ahead and closing on activation work as for every other item.

- [#201](https://github.com/luizgabriellf/lufia-design-system/pull/201) [`563dba4`](https://github.com/luizgabriellf/lufia-design-system/commit/563dba44ad8f35e6e3f6f55adb4419c6715c759a) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Tabs (beta): views of one page where one is shown at a time, as a WAI-ARIA tablist. `tab` buttons with roving tabindex,
  arrow keys, Home and End (Left and Right reversed in right-to-left), `orientation="vertical"`, automatic activation or
  `activation="manual"`, controlled (`value`, `onValueChange`) or uncontrolled (`defaultValue`) state, disabled tabs, a name
  through `label` or `labelledBy`, panels optionally kept mounted (`keepMounted`), and sideways scrolling inside the row when
  the tabs do not fit. When every item has an `href` it renders a `<nav>` of links through the `LufiaProvider` link adapter
  with `aria-current="page"` instead of a tablist. Themed with `--lufia-tabs-*` hooks.

## 0.56.1

### Patch Changes

- [#199](https://github.com/luizgabriellf/lufia-design-system/pull/199) [`398f06a`](https://github.com/luizgabriellf/lufia-design-system/commit/398f06a36a0d66e0840d3e818b06a4762bde6569) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Disclosure: the `plain` variant no longer outranks a consumer's own rules. The summary and panel inline padding are now the documented `--lufia-disclosure-summary-padding-inline` and `--lufia-disclosure-panel-padding-inline` custom properties, and an ordinary `root > summary` rule also wins. The default rendering is unchanged. Menu: add a story and browser test for an inline listbox inside a modal sheet.

## 0.56.0

### Minor Changes

- [#197](https://github.com/luizgabriellf/lufia-design-system/pull/197) [`da69189`](https://github.com/luizgabriellf/lufia-design-system/commit/da691898d8ef7b762a1908b8eb164dd8df7bd38d) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Menu (beta): a list of choices that hangs from its own trigger, for pickers such as a scope switcher or an export menu.
  `role="menu"` (default, `menuitem`) or `role="listbox"` (`option`, the `current` one `aria-selected`); action items
  (`onSelect`) and link items (`href`, through the provider's link adapter, `aria-current="page"` on the current one), each
  with an optional `description`, `meta` text and `icon`, plus groups with headings and separators. Roving focus with the
  arrow keys, Home, End and type-ahead; Escape and Tab close and focus returns to the trigger. Controlled or uncontrolled
  `open`, `placement` and `align` with the same clip-aware flip as `Popover`, `matchTriggerWidth`, `closeOnSelect`, and
  `presentation="inline"` for the same items as an always-visible list. Themed with `--lufia-menu-*` hooks.

## 0.55.0

### Minor Changes

- [#195](https://github.com/luizgabriellf/lufia-design-system/pull/195) [`2010fea`](https://github.com/luizgabriellf/lufia-design-system/commit/2010feaa972ef7423f5a12c3c85e62143706e99c) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Table can be named without a visible caption: pass `aria-label` or `aria-labelledby` instead of `caption` (exactly one of the three), and the same name goes on the table and its scroll region. In card mode `cardColumns` (2, 3 or 4, with `cardLayout="grid"`) sets how many labelled cells share a line, for comparison rows. `Th` and `Td` take `emphasis` to highlight a column in table and card mode, with `emphasisLabel` for visually hidden text that carries its meaning, themed through `--lufia-table-emphasis-bg`, `-color` and `-font-weight`. Defaults leave existing tables unchanged.

## 0.54.0

### Minor Changes

- [#193](https://github.com/luizgabriellf/lufia-design-system/pull/193) [`e534899`](https://github.com/luizgabriellf/lufia-design-system/commit/e5348991a3439158ef5d3bc71529703da533b3de) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Table: add style hooks for tables placed in prose and hide idle scroll covers. New custom properties
  `--lufia-table-header-*` (font family, size, weight, letter spacing, text transform; they restyle the column headers and
  the card labels), `--lufia-table-caption-color`, `-font-size` and `-font-weight`, `--lufia-table-cell-vertical-align`,
  `--lufia-table-cell-color` and `--lufia-table-primary-color`, plus a `captionTone="muted"` prop. Every default is unchanged.
  Where the browser supports scroll-driven animations, the scroll covers and shadows are no longer painted when the table does
  not overflow, which removes the edge bands on a translucent surface; other browsers keep the previous behaviour.

## 0.53.0

### Minor Changes

- [#191](https://github.com/luizgabriellf/lufia-design-system/pull/191) [`af681a1`](https://github.com/luizgabriellf/lufia-design-system/commit/af681a123dab5664f0bb0990031f502f5b665094) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - `Table` headers can take less width, and two card-mode layouts are hardened.
  
  - New `Th wrap` and `SortableTh wrap`: the header text may wrap onto two balanced lines, aligned to the bottom of the header row, so a wide table with long uppercase headers scrolls sideways less. Default off.
  - New `Th abbr` and `SortableTh abbr`: a short visible text for a long header. The children (or `label`) stay the full name, which assistive technology reads, which is the `title` tooltip of the short text, and which the revealed header row shows in card mode. The native `abbr` attribute is set on the `th`. Default off.
  - Fix: in card mode a `Td cardSlot="corner"` now ignores an inline `width` (such as `width: 1%` kept for a narrow desktop column) and keeps the size of its content, instead of collapsing to a few pixels. Table layout still honours the width. This is the one visible change for existing consumers.
  - Change: with `cardLayout="grid"` a badge keeps its text on one line and a half-width cell is never narrower than its content, so a long pill takes a line of its own instead of wrapping onto two lines; short pills and text still pair up. A pill wider than the whole card can opt back in with `Badge wrap`. The cards are now a wrapping flex row instead of a CSS grid; the two-column and one-column behaviour is unchanged.

## 0.52.0

### Minor Changes

- [#189](https://github.com/luizgabriellf/lufia-design-system/pull/189) [`8951393`](https://github.com/luizgabriellf/lufia-design-system/commit/89513937d4a6182f86f1d28928d3427a2484e4f1) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add card layout controls to `Table` and fix three card and action alignments. New, all opt-in and card mode only: `Table cardLayout="grid"` (two columns of label-over-value pairs, one column under 20rem), `Td cardSpan="full"`, `Td cardSlot="corner"` (pinned to the top end corner, the title reserves room), `Td cardOrder` (CSS `order`), `Td stretch` (block content takes the full value width) and `Td`/`Th hideInCards` (hidden visually, kept for assistive technology). Fixes that change existing tables: the controls of a `Td actions` cell in table layout are now centre-aligned instead of baseline-aligned (an icon button and a text-only button no longer sit a few pixels apart; a lone control or equal-height controls do not move); in card mode the `primary` cell is now always the first line of the card even when it is not the first column (cards with the primary cell first look the same), and each card row is now a flex column instead of a block (no visible change; `tr` computed `display` is `flex`).

## 0.51.0

### Minor Changes

- [#187](https://github.com/luizgabriellf/lufia-design-system/pull/187) [`0d5e119`](https://github.com/luizgabriellf/lufia-design-system/commit/0d5e11956c5ce59f8258ac2b859cc99abb174b10) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `TableFoot` to `Table`: a `<tfoot>` part for total rows. Its rows are ordinary `TableRow`s with a `Td rowHeader` first cell and `Td numeric` cells, read stronger than body rows with a rule above and no hover, and become one last summary card in `responsive="cards"` mode.

## 0.50.0

### Minor Changes

- [#184](https://github.com/luizgabriellf/lufia-design-system/pull/184) [`3795fb5`](https://github.com/luizgabriellf/lufia-design-system/commit/3795fb5114d07a99a96a041599c6e5eb8683a34d) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Table: add `Td rowHeader`, which renders the row's `<th scope="row">` with the look of a body cell and, with `primary`, the card title in card mode. A `Th` with `scope="row"` in a body row now also looks like a body cell instead of a column header.

- [#186](https://github.com/luizgabriellf/lufia-design-system/pull/186) [`ff4da7f`](https://github.com/luizgabriellf/lufia-design-system/commit/ff4da7fb2e831052f19e4ef1e17c4664f7924825) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Table: `TableRow`, `TableHead`, `TableBody`, `Th`, `Td` and the root now type `ref` (and `style`) as the element they render, so a sortable-list library can drive a row. `Td` gains `activateDisabled`: a disabled row control that keeps the button focusable with `aria-disabled="true"` and ignores activation, or renders the link without `href`, in the muted text colour. `TableRow` gains `group` for a group header row (`Th scope="colgroup"` with `colSpan`) inside one of several `TableBody`s; in card mode it is a full-width heading, not a card. A `Th` with `scope="rowgroup"` now has the `rowheader` role.

## 0.49.2

### Patch Changes

- [#182](https://github.com/luizgabriellf/lufia-design-system/pull/182) [`c88570a`](https://github.com/luizgabriellf/lufia-design-system/commit/c88570adea2c276d4d4e9bf6cd3726f6b13c496c) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Fix `Table`: with `Td actions wrap` the actions column no longer collapses to one button wide. With room the controls share one line; they wrap only when the table would overflow.

## 0.49.1

### Patch Changes

- [#180](https://github.com/luizgabriellf/lufia-design-system/pull/180) [`4ce97f7`](https://github.com/luizgabriellf/lufia-design-system/commit/4ce97f7b0b850455742853874ebc0f1a058ad05e) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Fix four `Table` layout defects. In card mode a badge wraps instead of being clipped by the value column (a container can opt badges in with `--lufia-badge-white-space: normal`), and under 30rem the label stacks above the value so a long label word is no longer split inside the word. The scroll-shadow covers take their own `--lufia-table-cover-bg` token (opaque; defaults to `--lufia-table-bg`), which `frame="flush"` on a translucent surface needs. In table layout the actions column shrinks to its buttons and end-aligns them.

- [#180](https://github.com/luizgabriellf/lufia-design-system/pull/180) [`4ce97f7`](https://github.com/luizgabriellf/lufia-design-system/commit/4ce97f7b0b850455742853874ebc0f1a058ad05e) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - `Table`: numeric cells no longer wrap in table layout, so ISO dates and date-times stay on one line. `Td` takes a new `wrap` prop (with `actions`) that lets a row's controls wrap onto a second line, end-aligned, instead of forcing a sideways scroll; the default stays one line.

## 0.49.0

### Minor Changes

- [#178](https://github.com/luizgabriellf/lufia-design-system/pull/178) [`0cb832f`](https://github.com/luizgabriellf/lufia-design-system/commit/0cb832f8b14d85b9b28c587e0286782d8817dfa3) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Table: add `frame="flush"` for a table inside an already framed container; `Td` props `activateLabel`, `activateDescribedBy`, `description` and `after` (a slot for extra links outside the row control); `Th actions` with a required `label` for the hidden header of an actions column; a title-less `TableEmpty` that renders one muted line; `TableRow` `selected` and `current` state; and the `--lufia-table-row-scroll-margin` theming hook for focus under sticky bars.

## 0.48.0

### Minor Changes

- [#175](https://github.com/luizgabriellf/lufia-design-system/pull/175) [`a5cdd8a`](https://github.com/luizgabriellf/lufia-design-system/commit/a5cdd8a1dd8fc8dcbac3e2cb4679289c73fda3d4) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `Table`, `Spinner` and `Disclosure` (all `beta`).
  
  `Table` is a CSS-only data table for Server Components: a surface that scrolls sideways with edge shadows, monospace capital headers and, under 40rem of its own width, a list of cards (`responsive="cards"`, or `"scroll"` to keep the table). Parts: `TableHead`, `TableBody`, `TableRow`, `Th`, `Td` (`label`, `numeric`, `primary`, `actions`), `TableEmpty` (a full-width `EmptyState` row) and a `footer` slot for a `Pagination`. A row opens something through a real link (`href`) or button (`onActivate`) in one cell, stretched over the row, so it needs no handler or `role="button"` on the `<tr>`. `SortableTh` works in its header row. It holds no sorting, filtering or paging state.
  
  `Spinner` is a small inline loading ring in three sizes that takes the colour of its text, is a labelled status or decorative, and stands still under reduced motion. The ring of `SearchInput`, `Combobox`, `CommandPalette` and `PendingSubmit` is now this component, with the same look.
  
  `Disclosure` renders a native `<details>` and `<summary>` (so it works without script and in Server Components) with a turning chevron, `defaultOpen`, `name` for exclusive groups and a progressive height animation. `disclosureClasses` exposes its class names to style an existing `<details>`.

### Patch Changes

- [#176](https://github.com/luizgabriellf/lufia-design-system/pull/176) [`6ce4979`](https://github.com/luizgabriellf/lufia-design-system/commit/6ce4979630a6cc27d5851049a5f393685658081c) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Tour: with `dialogLayout.dock` on a phone, a sheet shorter than the viewport (a bottom sheet with a top offset, a native dialog sheet) now docks above the card too, whenever the card would cover it, so its footer stays reachable; it is capped and lifted, not stretched, and handed back when the step changes or the tour ends. With `dialogLayout.beside`, a wide dialog with no room beside, below or above it now gets the card inside it, where it covers the least (never the target or the dialog's header and footer, and as few controls as possible), instead of landing on the target's sibling fields. With `clipSpotlight`, and for a card docked on the bottom edge, the ring's own padding is kept inside the clipped edge, so the ring is no longer partly hidden under the card.

## 0.47.2

### Patch Changes

- [#173](https://github.com/luizgabriellf/lufia-design-system/pull/173) [`650b51c`](https://github.com/luizgabriellf/lufia-design-system/commit/650b51c7f411669b631ccc57192baf7ec33c7890) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Fix `Tour` and the shared portal host. A closed, kept-mounted `Modal` no longer hosts anything: the card of a step with no target (and the popups of `Popover` and `MoreActions`) were rendered inside it at no size and could not be seen. A closed `Modal` no longer carries `aria-modal`. A step with no target inside an open modal now follows `dialogLayout` (`dock` on a phone, `beside` on a wide screen, falling back to below or above the modal). With `beside`, a target card with no room beside the modal goes below or above it instead of over its fields. The spotlight ring is not drawn across the target's own open listbox or menu, and stops where a docked sheet starts.

## 0.47.1

### Patch Changes

- [#171](https://github.com/luizgabriellf/lufia-design-system/pull/171) [`68fa472`](https://github.com/luizgabriellf/lufia-design-system/commit/68fa4721f95406e06cf14a2096f27f7f89206cef) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Tour: the tour layer now stacks at its own `--lufia-tour-z` (default: the new `--lufia-z-tour` token, 450, above the modal, sheet, menu and popover layers and below toasts and tooltips), so a sheet, menu or modal opened after the tour started no longer paints over the card or intercepts presses on its buttons. Tab on the card is no longer pulled back into such an overlay's focus trap. `--lufia-overlay-z` no longer affects the tour; set `--lufia-tour-z` to raise it above an app's own fixed elements.

## 0.47.0

### Minor Changes

- [#168](https://github.com/luizgabriellf/lufia-design-system/pull/168) [`5d2b390`](https://github.com/luizgabriellf/lufia-design-system/commit/5d2b39003f38664fc45ee8cd1ea956d294fdd7b7) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Tour: a step with no resolved target is now hosted in the topmost open modal (a native `dialog` opened with `showModal()`, else an `aria-modal` region) instead of the body, so its card stays visible and clickable. `compactOnTyping` also accepts `{ hideBelowHeight }` to hide the card (`data-typing-hidden`) while typing on a short visual viewport; the compact card now also hides the note and the step counter. `step.placement` accepts `"auto"` (bottom, top, end, start). The heading is focused again when `targetStatus` turns `ready`, without taking focus from a field or control in use. `CHANGELOG.md` is now part of the published package files.

## 0.46.2

### Patch Changes

- [#166](https://github.com/luizgabriellf/lufia-design-system/pull/166) [`707e156`](https://github.com/luizgabriellf/lufia-design-system/commit/707e156ca03e47925b50f6542ade949eb2d3e657) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Tour: with `dialogLayout.dock`, the target is scrolled clear of the dialog's footer again whenever the dialog docks or its dock changes size. A modal still animating in docks only once its entrance ends; on a slow device that came after the tour's last reveal, which had measured the undocked dialog, so the target stayed hidden behind the footer.

## 0.46.1

### Patch Changes

- [#164](https://github.com/luizgabriellf/lufia-design-system/pull/164) [`0c8bad4`](https://github.com/luizgabriellf/lufia-design-system/commit/0c8bad4444c4347705d47e72f59ecec89c695392) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Tour: `dialogLayout.dock` now resizes only the modal itself and lifts it clear of the card with a bottom margin, so docking into the package `Modal` (either `renderAs`) no longer stretches its header. A wrapper that fills a custom dialog opts in with `data-lufia-tour-shell` (it was the dialog's first child before). The reveal, `clipSpotlight` and docking also work for a portal `Modal`, read only the modal's own header and footer (not ones inside the content), and `clipSpotlight` stops at the sticky header and footer.

## 0.46.0

### Minor Changes

- [#162](https://github.com/luizgabriellf/lufia-design-system/pull/162) [`0d4c20e`](https://github.com/luizgabriellf/lufia-design-system/commit/0d4c20eae91da96cd88e39e558f3e7604dbb8866) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Tour: add `skipOnLastStep` to keep the skip button (`onClose("skip")`) on the last step. A last `do` step with `showCloseButton={false}` now shows the skip button even without it, so the card is never left with no action.

## 0.45.0

### Minor Changes

- [#160](https://github.com/luizgabriellf/lufia-design-system/pull/160) [`4bd2467`](https://github.com/luizgabriellf/lufia-design-system/commit/4bd24675b01faf751a1cf54bc792ab1f3e6a4c31) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - `Tour`: add steps that wait for the person (`mode: "do"`), a host-supplied `targetStatus` (`ready`, `seeking`, `missing`,
  `blocked`) with `missingBody` and the labels `doHint`, `skipStep`, `seeking` and `blocked`, a `resolveTarget` resolver with
  `isStandIn` and `standInNote`, a typing guard that keeps focus in a filled text field, `compactOnTyping` for phones, a
  `dialogLayout` option (`dock`, `beside`, `clipSpotlight`) for targets inside a dialog, and the switches `showCloseButton`,
  `closeOnEscape` and `arrowKeyNavigation`. The card also exposes `data-lufia-part="card"`, `data-mode`, `data-status` and
  `data-compact`. Everything is opt-in; existing behaviour is unchanged.

## 0.44.1

### Patch Changes

- [#158](https://github.com/luizgabriellf/lufia-design-system/pull/158) [`89de366`](https://github.com/luizgabriellf/lufia-design-system/commit/89de366af23e096dd716e0bd644dc8edde4ffd73) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - **FileField:** in a narrow slot (under 28rem, such as a modal on a phone) the choose button now spans the drop area with its icon and label on one row and the drag hint sits under it, instead of the icon dropping above the label beside a floating hint. On a touch-first device (`hover: none` and `pointer: coarse`) the drag hint is hidden. The field's root is now an inline-size query container, so it needs a slot with a definite inline size, as a form field has.

## 0.44.0

### Minor Changes

- [#155](https://github.com/luizgabriellf/lufia-design-system/pull/155) [`fc83d35`](https://github.com/luizgabriellf/lufia-design-system/commit/fc83d3537623b497ff56f0665832ad4bd93c9472) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Layout and target-size fixes found in a review at phone and desktop widths.
  
  - **Badge and StatusBadge (default change):** a badge now keeps its text on one line and does not shrink in a flex row or an auto-layout table cell (`flex: none; white-space: nowrap`). Add the new `wrap` prop to restore the previous wrapping and shrinking for long labels; `truncate` is unchanged.
  - **Checkbox:** the box has a 24 by 24px hit area without changing the drawn box, and the new `size="sm"` prop (default `"md"`) gives dense panels a smaller label in a shorter row.
  - **Textarea:** the new `rootClassName` prop goes on the root element (`className` still goes on the box). The root now fills the space left in a flex row (`flex: 1 1 auto; min-inline-size: 0`), so `autoSize` no longer collapses there.
  - **Modal:** the new `sheetHeight="full"` prop (default `"auto"`) makes the phone sheet fill the screen below `--lufia-modal-sheet-offset`, with no reset of the size rule.
  - **FormField and controls:** a read-only `TextInput`, `Textarea`, `SearchInput` or `Combobox` inside a required field is no longer `required` or `aria-required`, and the field hides the required mark and its accessible text.
  - **StatusTimeline:** the content column and the action slot can shrink, so a wide action no longer widens the card past its container on a phone.
  - **FileField:** in a narrow slot the choose button wraps its icon above the label instead of breaking the label into one word per line.
  - **NavRow:** documents that `meta` and a numeric `badge` must carry their own context.

## 0.43.0

### Minor Changes

- [#153](https://github.com/luizgabriellf/lufia-design-system/pull/153) [`342cb8a`](https://github.com/luizgabriellf/lufia-design-system/commit/342cb8a4490d26a1380755179d35b991257de133) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - RadioGroup can be named without a visible legend: pass `aria-label` or `aria-labelledby` instead of `label` (exactly one of the three). A required group named this way is announced through `aria-required` only.

## 0.42.0

### Minor Changes

- [#151](https://github.com/luizgabriellf/lufia-design-system/pull/151) [`be4db18`](https://github.com/luizgabriellf/lufia-design-system/commit/be4db186a0f1beadd741c510e7f5531e38ba0979) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `wrapValue` and `maxValueLines` to `Combobox`: a long chosen label wraps onto up to `maxValueLines` lines (default 2) while the list is closed, instead of being cut with an ellipsis. Opt-in; the default is unchanged.

## 0.41.1

### Patch Changes

- [#149](https://github.com/luizgabriellf/lufia-design-system/pull/149) [`d4f0dc3`](https://github.com/luizgabriellf/lufia-design-system/commit/d4f0dc3d3cc433ea38c23b8710bf5fd76e8c3754) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Fix three narrow-screen defects in form controls. `ListField`: the add button keeps its label on one line and wraps under the input when the two cannot share the row, instead of breaking the word. `FormField` and `ListField`: the label text and the required mark now sit in one inline wrapper, so a stylesheet that turns the label into a flex or grid container no longer drops the mark onto its own line. `TextInput`, `Textarea`, `Select`, `SearchInput`, `Combobox` and `DateField`: a focused control draws a single focus ring over its border, with no border colour change and no gap, instead of two rings (an invalid control keeps its danger border visible beside the ring).

## 0.41.0

### Minor Changes

- [#147](https://github.com/luizgabriellf/lufia-design-system/pull/147) [`34edb32`](https://github.com/luizgabriellf/lufia-design-system/commit/34edb32266cf82c2cf374517a8a6f9637456aeda) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `Checklist`, a read-only list of items with a status icon and text, and `CitationList`, a compact wrapping list of references that link when they have a URL.

## 0.40.0

### Minor Changes

- [#145](https://github.com/luizgabriellf/lufia-design-system/pull/145) [`65cc5ed`](https://github.com/luizgabriellf/lufia-design-system/commit/65cc5ed6afe4e1ac4c0bf30093389868ca13f19f) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - `ListField` closes four gaps for adoption in forms. `includeDraft` (off by default) submits the text still in the add input as if it had been added, without calling `onChange`, and lets a valid draft satisfy `required`; without it the 0.39 behaviour is unchanged, and `required` still ignores a draft. `labels.addInput` names the add input apart from the group and the add button; without it the input keeps the group label. `renderCount({ count, maxItems, length, maxTotalLength })` renders a counter under the hint, linked to the group with `aria-describedby`; nothing is rendered without it. New exported type `ListFieldCount`.

## 0.39.0

### Minor Changes

- [#143](https://github.com/luizgabriellf/lufia-design-system/pull/143) [`7a04e3d`](https://github.com/luizgabriellf/lufia-design-system/commit/7a04e3dae871352315f8a3ed953353a176c04a54) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `ListField`: a form field that holds a list of short text entries. One text input per entry (editable in place), an add row where Enter adds and never submits the surrounding form, and a remove button on each entry. The entries are submitted as one hidden text value under `name`, joined with a line feed or by your `serialize`. It works controlled (`items`, `onChange`) and uncontrolled (`defaultItems`), supports `sanitizeItem`, `maxItems`, `itemMaxLength`, `maxTotalLength` and `required` (custom validity on the add input), and exposes `commitDraft()` on its ref for the pending text before a submit. Every string comes through the `labels` prop.

### Patch Changes

- [#143](https://github.com/luizgabriellf/lufia-design-system/pull/143) [`7a04e3d`](https://github.com/luizgabriellf/lufia-design-system/commit/7a04e3dae871352315f8a3ed953353a176c04a54) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Fix `SearchInput` taking 12rem of height inside a column flex container, which includes a `FormField` (the field is a column flex container, so a labelled search box in a filter form was 192px tall). The box now holds its block size at the height of its content, so the flex-basis no longer reaches the block axis: it still grows and wraps in a toolbar row, fills a grid track and keeps its 8rem floor.

- [#143](https://github.com/luizgabriellf/lufia-design-system/pull/143) [`7a04e3d`](https://github.com/luizgabriellf/lufia-design-system/commit/7a04e3dae871352315f8a3ed953353a176c04a54) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Document the `TextInput` `size` typing. Since `size="sm"` was added, `TextInputProps` omits the native numeric `size` attribute, so props types that extend the native input attributes and are spread into `TextInput` must omit `size`: `Omit<InputHTMLAttributes<HTMLInputElement>, "size">`. `SearchInput`, `DateField` and `Select` already follow this convention. No runtime change.

## 0.38.0

### Minor Changes

- [#141](https://github.com/luizgabriellf/lufia-design-system/pull/141) [`b9d4198`](https://github.com/luizgabriellf/lufia-design-system/commit/b9d4198a404fa736c8797f6f0e512c544a1c6c91) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `sheetPlacement="none"` to `Modal`: on a phone the dialog stays a centred floating panel with a margin on every side and the scale entrance, instead of becoming an edge sheet. The default (`bottom`) is unchanged.

- [#141](https://github.com/luizgabriellf/lufia-design-system/pull/141) [`b9d4198`](https://github.com/luizgabriellf/lufia-design-system/commit/b9d4198a404fa736c8797f6f0e512c544a1c6c91) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `size="sm"` to `TextInput`: a compact control with the height, font size and padding of `Select size="sm"`, for toolbars and filter rows. It grows to the touch target on touch screens and phone widths. The default size is unchanged.

## 0.37.0

### Minor Changes

- [#138](https://github.com/luizgabriellf/lufia-design-system/pull/138) [`c9ecd7e`](https://github.com/luizgabriellf/lufia-design-system/commit/c9ecd7e22488dc3db9a4b19a3e08306612a97883) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `Popover`, a non-modal panel anchored to a trigger. It is a named `role="dialog"` that traps no focus and locks no scroll, with controlled and uncontrolled `open`, `placement` and `align` that flip and shift to stay in the viewport, Escape and outside-press dismissal, and focus returned to the trigger. The panel is portalled out of clipping ancestors and inherits the trigger's theme scope and direction.

- [#139](https://github.com/luizgabriellf/lufia-design-system/pull/139) [`dccdbcc`](https://github.com/luizgabriellf/lufia-design-system/commit/dccdbcc1d8b870ba6629823f3906266d4725d43f) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `Tour`, a non-modal guided tour. A card walks through `steps` with a spotlight on each target (a CSS selector or a ref) that follows scroll and resize, scrolls the target into view, and becomes a centred card when the target is missing or hidden. The page stays operable. Controlled `open` and `stepIndex`, `onStepChange`, `onClose(reason)` and `onFinish`, all labels through props, arrow keys and Escape, focus on the step heading and returned on close, and a polite announcement of the step counter. Persistence stays in the app.

### Patch Changes

- [#136](https://github.com/luizgabriellf/lufia-design-system/pull/136) [`4eff53e`](https://github.com/luizgabriellf/lufia-design-system/commit/4eff53e882b0e9ee790d5b0efc3c2478cd412cd1) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Fix `FormField` controls: an explicit `id` on a control inside a field is kept and the label follows it, and a second control in the same field no longer receives the field's id (it keeps its own or a generated one).

- [#136](https://github.com/luizgabriellf/lufia-design-system/pull/136) [`4eff53e`](https://github.com/luizgabriellf/lufia-design-system/commit/4eff53e882b0e9ee790d5b0efc3c2478cd412cd1) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Fix `SearchInput` collapsing to about 20px in a flex row on a phone: the box now has a usable minimum width and can grow.

- [#136](https://github.com/luizgabriellf/lufia-design-system/pull/136) [`4eff53e`](https://github.com/luizgabriellf/lufia-design-system/commit/4eff53e882b0e9ee790d5b0efc3c2478cd412cd1) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Fix `SearchInput` used with `value` and `onChange`: the native `onChange` handler was overwritten, so the value never updated. It is now called before `onValueChange` and is part of the props type.

## 0.36.0

### Minor Changes

- [#134](https://github.com/luizgabriellf/lufia-design-system/pull/134) [`3ade775`](https://github.com/luizgabriellf/lufia-design-system/commit/3ade775de8127439a3fd7de649200ae71ef3060d) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Select: add `size="sm"`, a compact box for toolbars and filter rows that sizes to its content, and `variant="pill"`, a fully rounded box. Both keep the room for the chevron, so text still ellipsizes before it, and the compact box grows to the touch target on phone widths and coarse pointers. A compact select needs an `aria-label` or a visually hidden label.

- [#134](https://github.com/luizgabriellf/lufia-design-system/pull/134) [`3ade775`](https://github.com/luizgabriellf/lufia-design-system/commit/3ade775de8127439a3fd7de649200ae71ef3060d) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - StatTile: the label of a button tile (`onClick`, with or without `pressed`) now has a box of at least 24 px high on phone widths and coarse pointers (WCAG 2.5.8), kept in place with an equal negative margin so the tile layout does not change.

- [#134](https://github.com/luizgabriellf/lufia-design-system/pull/134) [`3ade775`](https://github.com/luizgabriellf/lufia-design-system/commit/3ade775de8127439a3fd7de649200ae71ef3060d) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Textarea: add the opt-in `autoSize` prop, with `maxRows`, so the box grows with its content from `rows` (the minimum) up to the maximum. It uses CSS `field-sizing: content` where the browser supports it and a small measuring fallback elsewhere, and works controlled and uncontrolled.

## 0.35.1

### Patch Changes

- [#127](https://github.com/luizgabriellf/lufia-design-system/pull/127) [`3c45d98`](https://github.com/luizgabriellf/lufia-design-system/commit/3c45d98c265801f486cf8ecf802fb0069692b37b) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Banner: the icon now centres on the first line of text at every size. Its box was one line of the icon's own size tall, which is taller than a line of the text, so the glyph sat below the line, most visibly in the `inline` and default sizes.

## 0.35.0

### Minor Changes

- [#121](https://github.com/luizgabriellf/lufia-design-system/pull/121) [`0812c86`](https://github.com/luizgabriellf/lufia-design-system/commit/0812c86bfc963f7db5299116e02df9a2f92b4c43) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Banner: add `size="inline"` (no card chrome, tone-coloured start border, for guidance between form fields) and a `lead` prop for a bold lead-in in the same paragraph. `live="off"` now renders `role="note"` instead of no role.

- [#122](https://github.com/luizgabriellf/lufia-design-system/pull/122) [`adfd5ca`](https://github.com/luizgabriellf/lufia-design-system/commit/adfd5ca4f84b418e2af21e5fcfc873941a040bca) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `DateField` (a native date, time, date-and-time or month control in the shared field box, with a calendar or clock icon and an optional clear button) and `DateRangeField` (two date fields in a fieldset, where an edit that would put the start after the end keeps the edited end and moves the other to the same value, reported in one `onValueChange`).

### Patch Changes

- [#124](https://github.com/luizgabriellf/lufia-design-system/pull/124) [`fa4ab6b`](https://github.com/luizgabriellf/lufia-design-system/commit/fa4ab6b1de22190ea5182df0cf63006e6e4c00dc) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - DateField: the native control reads `--lufia-target-touch` with the 2.75rem fallback, like every other component, so it keeps its minimum height on a page that has not loaded the tokens.

- [#126](https://github.com/luizgabriellf/lufia-design-system/pull/126) [`4326a8b`](https://github.com/luizgabriellf/lufia-design-system/commit/4326a8bf49528598b9b813ec0130055b9870ae3e) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - AppShell: the skip link is transparent and ignores touches until it is focused. It used to be only moved above the top edge, so a touch browser that lets the page be pulled down past its start showed it.

- [#123](https://github.com/luizgabriellf/lufia-design-system/pull/123) [`dbf2766`](https://github.com/luizgabriellf/lufia-design-system/commit/dbf2766e6c2cf5ad3a0e5de06873ec9b972abf97) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Touch targets: every component now reads `--lufia-target-touch` with a 2.75rem fallback, so the table toolbar search input, the combobox toggle and the other narrow-width controls keep their minimum size on a page that has not loaded the tokens. The file field remove button takes the touch size at narrow widths and on coarse pointers. The navigation sheet scrolls a focused item clear of its docked bar (`scroll-padding-block-end`).

## 0.34.3

### Patch Changes

- [#119](https://github.com/luizgabriellf/lufia-design-system/pull/119) [`a14e63a`](https://github.com/luizgabriellf/lufia-design-system/commit/a14e63ae1ccbc7ef09c284440d7854385b76c78e) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - RouteProgress: hide the bar when a run restarted during the finish animation ends before its reveal delay, instead of leaving it on screen at full width.

## 0.34.2

### Patch Changes

- [#117](https://github.com/luizgabriellf/lufia-design-system/pull/117) [`c249619`](https://github.com/luizgabriellf/lufia-design-system/commit/c2496197bb7d6ef5b29ac7e434fbf9e6730cd1f6) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Select: keep the room reserved for the chevron, so a long or narrow selected label ellipsizes before the chevron instead of running under it.

## 0.34.1

### Patch Changes

- [#114](https://github.com/luizgabriellf/lufia-design-system/pull/114) [`234aa80`](https://github.com/luizgabriellf/lufia-design-system/commit/234aa807c93aec1ee6043970f6f4de224eca0b6b) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Mirror the timeline connector, the stepper connector and the detail section action under right-to-left text by using logical properties, and fail Stylelint on new physical left/right declarations.

## 0.34.0

### Minor Changes

- [#111](https://github.com/luizgabriellf/lufia-design-system/pull/111) [`94e1461`](https://github.com/luizgabriellf/lufia-design-system/commit/94e1461997a3d855f811a98bda1da8a215a2615e) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `Banner`: an inline message for a page or section, with `info`, `success`, `warning`, `danger` and `neutral` variants, an optional title, icon, action slot and dismiss button, a `compact` size, `live` control over how it is announced, and `--lufia-banner-*` theming hooks.

## 0.33.0

### Minor Changes

- [#108](https://github.com/luizgabriellf/lufia-design-system/pull/108) [`13ba808`](https://github.com/luizgabriellf/lufia-design-system/commit/13ba80853e0acb4b8352ff60a533e92643e9f6c7) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - StatTile: add `toneSurface`, `labelLines` and `quiet`; hover effects apply only on hover-capable pointers, and labels wrap between words, hyphenating long words in narrow tiles

## 0.32.0

### Minor Changes

- [#106](https://github.com/luizgabriellf/lufia-design-system/pull/106) [`414a222`](https://github.com/luizgabriellf/lufia-design-system/commit/414a22201fd4950ac25abd435a6c2e466103050b) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add QueueSummary and a row layout for StatTile, and a title basis token for SectionHeader

## 0.31.0

### Minor Changes

- [#104](https://github.com/luizgabriellf/lufia-design-system/pull/104) [`987f7e2`](https://github.com/luizgabriellf/lufia-design-system/commit/987f7e20db768789d23af3f0368f9f4e20278d79) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - AttentionList gains `groups`: rows under urgency headers (status mark, label, count) on a neutral surface. Items gain `href`, `onSelect` and `count`, which make the whole row one link or button with a trailing chevron. `items`, `action` and `barStyle` are unchanged.

## 0.30.2

### Patch Changes

- [#102](https://github.com/luizgabriellf/lufia-design-system/pull/102) [`7bef524`](https://github.com/luizgabriellf/lufia-design-system/commit/7bef5245aee060f3d04df43144e28302fb7937fb) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - New optional `--lufia-shell-label-weight` hook for the app shell navigation and footer labels. It defaults to medium, so nothing changes unless a theme sets it; the current page stays at medium.

## 0.30.1

### Patch Changes

- [#100](https://github.com/luizgabriellf/lufia-design-system/pull/100) [`333d6ed`](https://github.com/luizgabriellf/lufia-design-system/commit/333d6ed15e5e616028b0a9af39eb6cbbef73854d) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - PeerNav in the scroll layout keeps the label and the description on one line each, with an ellipsis at the item's maximum width and the full text as a tooltip, so every tab has the same height.

## 0.30.0

### Minor Changes

- [#98](https://github.com/luizgabriellf/lufia-design-system/pull/98) [`5a86e2a`](https://github.com/luizgabriellf/lufia-design-system/commit/5a86e2a7645db561883b2c8ab5d2fa67437685df) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Phone targets and overflow. New `--lufia-target-touch` token: Button (every size), TableToolbar search, Combobox trigger and CommandPalette field and close are 44px on phones and coarse pointers, desktop keeps its density. CommandPalette follows `visualViewport`, so it fits above an on-screen keyboard, and its focus ring is no longer clipped. Badge gains `truncate` and `--lufia-badge-max-inline-size` and never overflows its pill. PeerNav labels no longer run into the next item and `layout="scroll"` sizes items to their label. New optional `--lufia-button-danger-bg` and `--lufia-button-danger-fg` hooks. StatTile long figures and a read-only Textarea's resize handle are fixed.

## 0.29.0

### Minor Changes

- [#95](https://github.com/luizgabriellf/lufia-design-system/pull/95) [`bdcc9e4`](https://github.com/luizgabriellf/lufia-design-system/commit/bdcc9e4900b83160211de63003386f066e88a16d) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Phone shell bottom: a scrim behind the floating bar, the bar kept on top of the open menu, and dark-mode shadows.
  
  - `MobileFloatBar` draws a scrim by default: the page fades into the canvas behind the bar, from a little above it to the
    bottom edge of the screen, through the safe area. It belongs to the bar (shown only where the bar is, lifted with it
    above the keyboard, never takes a tap). `scrim={false}` turns it off; tune it with `--lufia-float-bar-scrim-block-size`,
    `--lufia-float-bar-scrim-color` and `--lufia-float-bar-scrim-stop`. The pill's surface is now drawn by `::before`.
  - `AppShell` `floatScrim` now defaults to `true` and drives the bar's `scrim`; pass `floatScrim={false}` for the old look.
    The phone page's end padding is `--lufia-app-shell-float-clearance` (default unchanged, `6.5rem` plus the safe area).
  - `NavSheet` takes a `dock`: a control bar kept in place at the bottom of the screen over the open sheet, inside the dialog
    and its focus trap, out of the drag. With a dock, the header has no close button of its own, the end of the sheet keeps
    clear of it (`--lufia-nav-sheet-dock-clearance`), and the dialog role is on the sheet's layer.
  - `AppShell` keeps its floating bar on top of the open phone menu: the menu button turns into the close button
    (`labels.closeMenu`) with a turning cross-fade, and back whichever way the sheet closes (the button, a drag down, a tap
    outside, Escape). Search and the main action on that bar close the menu first. The sheet's own close button is gone.
  - Dark modes of `default` and `example-brand` redefine `--lufia-shadow-sm`, `-md` and `-lg`: stronger alpha, and a 1px
    inset top highlight on `md` and `lg`, so floating surfaces read as lifted on dark canvases. Light is unchanged.

## 0.28.0

### Minor Changes

- [#93](https://github.com/luizgabriellf/lufia-design-system/pull/93) [`861855a`](https://github.com/luizgabriellf/lufia-design-system/commit/861855a2a378502d12c77e9348ee441373632212) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Close follow-up gaps that consuming apps found after moving onto `AppShell`.
  
  - `AppShell`: the rules that hide the floating bar on wide screens and `ShellPrimaryActionSlot` on phones are scoped under
    the shell, so a `MobileFloatBar` or `Button` stylesheet that loads later no longer shows them in the wrong place.
  - `AppShell` `labels.openMenu` names the floating bar's menu button (defaults to `labels.menu`), and `labels.closeMenu`
    names the sheet's close button (defaults to the provider's `close` label).
  - `AppShell` `routeTimeout` and `RouteProgress` `timeout`: how long a `pending` or code-driven run may show (default 10
    seconds, `Infinity` allowed). Runs started only by a link click stay capped at 10 seconds.
  - `AppShell` `routeTrackLinks="query"` and `RouteProgress` `trackLinks="query"`: a link that changes only the query string
    starts the bar too.
  - `ShellPrimaryActionSlot` `size`: a `Button` size, or `touch` for the medium look at 44px.
  - `--lufia-shell-item-min-block-size` sets the height of a top-level navigation item (default unchanged).
  - The sidebar footer is capped at 40% of the sidebar (`--lufia-shell-footer-max-block-size`) and scrolls on its own, so
    the navigation keeps a usable height in a short window.
  - A closed `SidebarGroup` that holds the current page gets `aria-current="true"` with its active look.
  - `NavSheet` `context`: a fixed region under the header, outside the scrolling body, with a divider. `AppShell` puts its
    `context` slot there, so a scope or company picker stays in view while the navigation scrolls and never touches the
    first item; a tall one is capped and scrolls on its own. With `hideSheetNavigation` it still fills the body.
  - `NavSheet`: a drag can start on a link in the header; past a short slop it becomes a drag and the link's click is
    cancelled, while a plain tap still follows the link.
  - `CommandPalette` `className` and `data-*` props go on its portalled outermost layer; `onSubmit(query)` runs on Enter
    while `bodyOverride` is shown; a `keepOpen` command picked with the pointer gives focus back to the field.
  - `useBodyScrollLock` restores the scroll with `behavior: "instant"`, so `scroll-behavior: smooth` does not animate it.
  - `PendingSubmit` `variant="unstyled"`: a plain button that takes its look from `className` only, for apps that keep their
    own button classes for now.
  - `FileField` docs map an app's own file-input props (`label`, `hint`, `error`, `labelClassName`, `ariaLabel`, `onFiles`,
    `clearable`) onto `FormField` and the existing props.

## 0.27.0

### Minor Changes

- [#91](https://github.com/luizgabriellf/lufia-design-system/pull/91) [`b1bb3a4`](https://github.com/luizgabriellf/lufia-design-system/commit/b1bb3a40f0704a7f71b2ecab9e15470c1ee95f1c) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add skeleton building blocks and fix two visual details.
  
  - `SkeletonTable` (`rows`, `columns`, `stackBelow`, `still`), `SkeletonCard` (`header`, `lines`, `block`, `padding`,
    `still`) and `SkeletonPageHeader` (`eyebrow`, `description`, `actions`, `still`): decorative loading placeholders that
    keep the layout of the table, the card and the page header they stand for, and never overflow their container.
    A loading key figure keeps using `StatTile`'s `loading` prop.
  - New theme tokens `--lufia-skeleton-bg` and `--lufia-skeleton-shine`, used by `Skeleton`. A theme without them keeps the
    previous colours. In dark mode the shine is now lighter than the fill instead of darker.
  - `StatusIcon`: the `ring` and `mark` variants draw one simple mark per tone (check, exclamation, cross, serifed "i",
    clock hands, dash, three dots), optically centred and with one stroke weight. Warning no longer draws a triangle inside
    the ring, and danger (a `Toast` error) shows a cross. The `bare` glyphs are unchanged.
  - `AppShell`: below 60rem the shell is at least as tall as the viewport, so a short page no longer shows the page
    background under it.

## 0.26.0

### Minor Changes

- [#89](https://github.com/luizgabriellf/lufia-design-system/pull/89) [`bfda5a1`](https://github.com/luizgabriellf/lufia-design-system/commit/bfda5a15710531e25a5cdbdf2aede50fe0ad17b4) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - A unified icon system, owned by the package, with no new dependency.
  
  - **Icon set**: about fifty named icons (`CloseIcon`, `CheckIcon`, `ChevronDownIcon`, `SearchIcon`, `WarningIcon`,
    `SettingsIcon`, `SignOutIcon`...) on one 24-unit grid, `currentColor` strokes with round caps and joins. The geometry is
    adapted from Lucide (ISC); the notice ships in `THIRD_PARTY_NOTICES.md`. Exported from the new
    `@lufia/design-system/icons` subpath, from `components/Icon` and from the root; each icon is a separate pure export, so a
    bundler keeps only the ones an app imports.
  - **`Icon` and `createIcon`**: the primitive the set is built on, and a helper that gives an app's own glyphs the same grid,
    stroke, sizes and accessibility. Decorative by default (`aria-hidden`); `title` or `aria-label` makes an icon an image
    with a name.
  - **Tokens**: `--lufia-icon-size-sm|md|lg` (16, 20, 24px), `--lufia-icon-stroke` (1.75) and `--lufia-icon-stroke-sm` (2,
    so a 16px icon keeps the weight of a larger one). `size` takes `sm`, `md` (default), `lg`, `1em` or a number of px.
  - **`StatusIcon`**: one family of status markers (`success`, `warning`, `danger`, `info`, `pending`, `neutral`,
    `needsInput`), each with its own shape, in `bare`, `ring` or `mark` variants. `Toast`, the `FormField` error,
    `DetailAttentionCard`, `StatusTimeline` and `Stepper` now draw their markers with it. An optional `drawOn` draws the glyph in
    once on mount (the `SuccessCheck` motion, off under reduced motion); a success toast keeps its animated check with it.
  - **Every glyph in the package moved onto the set**: AppShell, Sidebar and NavSheet, Combobox, Select, SearchInput, the
    TableToolbar search field, CommandPalette, FileField, Modal, Toast, NotificationCenter and NotificationPanel,
    MoreActions, Link, NavRow, StatTile, SuccessCheck (it keeps its draw-on motion), Stepper, DetailAttentionCard and
    SortableTh. Text glyphs used as icons are gone, and every icon is `aria-hidden` unless named. Some icons change size
    slightly to land on the 16 or 20px steps.
  - **Deprecated**: `DeleteIcon`, `DuplicateIcon`, `PendingIcon`, `OpenIcon`, `ReportIcon` and `ACTION_ICONS` are now aliases
    of `TrashIcon`, `CopyIcon`, `ClockIcon`, `RotateCcwIcon`, `FileTextIcon` and `ICONS`, and will be removed in the next
    minor release. `EditIcon` is the set's own. The action icons now default to `md` (20px); pass `size={13}` for the old
    size. `SuccessCheck` props are now `IconProps`.
  - **StatusTimeline**: node states read as `StatusBadge` pills, dates use the body font with tabular figures, and the nodes
    carry `data-state` in place of a per-state class.
  - **AppShell / NavSheet dark mode**: the portalled phone sheet now copies `data-lufia-theme` and `data-lufia-mode` from an
    ancestor of the shell, takes `sheetProps` (`className`, `data-*`, `container`) on `AppShell` and `layerProps` on
    `NavSheet` to carry an app's scoped palette, and exposes `data-lufia-part="nav-sheet-layer"`, `"nav-sheet-backdrop"` and
    `"nav-sheet"`.
  - **Stepper**: the step list is its own stacking context, so its dots no longer paint over a sticky modal header.
  - An ESLint rule rejects hand-drawn inline SVG icons and text glyphs in components.

## 0.25.0

### Minor Changes

- [#87](https://github.com/luizgabriellf/lufia-design-system/pull/87) [`3f3f697`](https://github.com/luizgabriellf/lufia-design-system/commit/3f3f697086a6c48b86e36ead58856ac3a5e69be1) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Close gaps that kept consuming apps on their own shell, palette, picker and form code.
  
  - `RouteProgress`: `startRouteProgress()` and `doneRouteProgress()` start and end the bar from code through window events
    (`ROUTE_PROGRESS_START_EVENT`, `ROUTE_PROGRESS_DONE_EVENT`); an `events` prop (`routeProgressEvents` on `AppShell`) listens
    for other names. A run started from code combines with `pending` and `trackLinks`.
  - `NavSheet` `dragThreshold` (`sheetDragThreshold` on `AppShell`): the release distance (`ratio`, `min`, `max`) and flick
    (`flickVelocity`, `flickDistance`) are configurable; `SHEET_DRAG_THRESHOLD` holds the unchanged defaults.
  - Shell primary action: `useShellPrimaryActionState()` reads the current action (to list it in a palette), the action takes
    a `description`, registration runs before paint, and `ShellPrimaryActionOwner` keeps the shell's default hidden on a hard
    load until the page's own action registers.
  - `Modal` `footerStackAt="sheet"` stacks a `footerLayout="stack"` footer from 37.5rem, where the dialog becomes a sheet.
  - `CommandPalette` `escapeClearsQuery`: the first Escape clears the typed text, the next closes.
  - `FileField` `preview`: local thumbnails for chosen images.
  - `Combobox` `maxResults` caps the list after the filter; `resultsLabel` also gets the total that matched.

## 0.24.0

### Minor Changes

- [#85](https://github.com/luizgabriellf/lufia-design-system/pull/85) [`4c0e089`](https://github.com/luizgabriellf/lufia-design-system/commit/4c0e089a99e288ce4a993943b95923b0faaa935a) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - AppShell:
  
  - `parseShellState` and `serializeShellState` now live in a pure module, also exported from the new `@lufia/design-system/app-shell-state` subpath, so a React Server Component can import them. The main and `components/AppShell` exports keep them.
  - `RouteProgress` takes `pending` and `trackLinks` together: with both, the bar shows while either is in progress. `trackLinks` defaults to `true` without `pending` and `false` with it, as before. `AppShell` passes it through as `routeTrackLinks`.
  - `AppShell` `routeTransitionProps`: a `className` and `data-*` attributes for the region that plays the route motion.
  - A `success` tone for `badgeTone` and `countTone` (nav items, `SidebarItem`, `ShellFooterItem` `countTone`).
  - `MobileFloatBar` follows the visual viewport (`followViewport`, default on): it stays above the on-screen keyboard and covering toolbars, rAF-throttled, and does nothing without `window.visualViewport`.
  - Nav items take one level of sub-items (`items`, `expanded`) and a `match` option (`"prefix"`, `"exact"`, `"query"` or a function) for query-string sections. In the rail the sub-items are hidden and their item is marked `aria-current="true"` while one of them is current. `SidebarItem` takes the sub-items as `children`, with `expanded`, `currentBranch` and `highlightedBranch`.

## 0.23.0

### Minor Changes

- [#83](https://github.com/luizgabriellf/lufia-design-system/pull/83) [`29aa92c`](https://github.com/luizgabriellf/lufia-design-system/commit/29aa92c65a26d8af544e8e1622270db7b2bb9312) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - FormField: new `nativeRequired` prop (default `true`). With `nativeRequired={false}` a required field gives its control `aria-required="true"` and no native `required`, for forms that run their own validation and messages. `useFormFieldControl` now also returns `aria-required`, and lists each `aria-describedby` id once, in order, when a control repeats an id the field already supplies.

## 0.22.0

### Minor Changes

- [#81](https://github.com/luizgabriellf/lufia-design-system/pull/81) [`98ddeb8`](https://github.com/luizgabriellf/lufia-design-system/commit/98ddeb86957e904e3ea86339045cfc139246d602) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Modal: on a narrow phone the footer actions now stay in a row (primary at the inline end, shared width, wrapping when the labels cannot fit; icon-only triggers keep their size). New `footerLayout` prop (`"row"` default, `"stack"` for the previous full-width column).

## 0.21.0

### Minor Changes

- [#77](https://github.com/luizgabriellf/lufia-design-system/pull/77) [`46a4b40`](https://github.com/luizgabriellf/lufia-design-system/commit/46a4b40edab371cc813b26cd8d8bbeae64b598dc) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - AppShell: a `context` slot (sidebar and sheet) and slot functions that receive the surface with `closeSheet` and `openSheet`; a controllable phone sheet (`menuOpen`, `onMenuOpenChange`, `hideSheetNavigation`); route motion and progress (`routeKey`, `routePending`, `routeProgress`, new `RouteProgress`) and a `mainPending` skeleton that keeps the page mounted; `primaryAction.onIntent` and `desktopPrimaryFallback`; an opt-in fade under the floating bar (`floatScrim`); and navigation scroll hints (edge fades, current page brought into view).
  
  The page now always sits in a wrapper element inside `<main>` (`display: contents`, so layout is unchanged); app CSS that targets the page through `main > …` child selectors needs to target one level deeper. `<main>` also defaults to `tabIndex={-1}` so the skip link and pending focus can land on it (override with `mainProps.tabIndex`).

- [#76](https://github.com/luizgabriellf/lufia-design-system/pull/76) [`93348b0`](https://github.com/luizgabriellf/lufia-design-system/commit/93348b0295fae78396ff0f53d88c32c48e542c0d) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - AppShell: nav items take `count` (capped, toned, hidden at 0), `badgeTone`, `className` and `data-*`; new `ShellFooter` and `ShellFooterItem` (link, external link, button, active, pending, count); a real tooltip in the rail instead of the native `title`; `mainProps`, `mainKey` and `mainStart` for the shell's `<main>`; `serializeShellState` and `parseShellState` for a cookie that restores the rail and open groups on the first paint.

- [#78](https://github.com/luizgabriellf/lufia-design-system/pull/78) [`958323b`](https://github.com/luizgabriellf/lufia-design-system/commit/958323b8c0bac3b410a7489b628b530f335729b9) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - NavSheet and AppShell: the phone navigation sheet can also be dragged down from its body when the body is scrolled to the top (cancelling the browser's pull to refresh and swallowing the click after the drag), besides the grabber and the header. `swipeToDismiss={false}` turns off all of it.

- [#79](https://github.com/luizgabriellf/lufia-design-system/pull/79) [`f33b520`](https://github.com/luizgabriellf/lufia-design-system/commit/f33b520a324bbbcf9a0c7597c15d5828da0c863c) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `computeStatDelta`, a pure helper that turns a current and a previous number into the `delta`, `trend`,
  `trendLabel` and `deltaTone` props of `StatTile`. It formats a percentage by default, switches to an absolute change on a
  zero or small base (`minBase`, default 5), treats changes within `flatThreshold` as flat, maps `goodDirection` to the tone
  and returns `null` without a previous value. All text comes in through `labels`.

## 0.20.0

### Minor Changes

- [#74](https://github.com/luizgabriellf/lufia-design-system/pull/74) [`ca2f285`](https://github.com/luizgabriellf/lufia-design-system/commit/ca2f285bbeaa3b9b553953695c9a7f5893774075) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `StackedBar`: one bar split into proportional segments, with an optional legend. Each segment has a label, a value and
  a chart tone (or a `hatch` pattern). The text alternative lists every label, value and share, `formatValue` and
  `formatPercent` format them, a zero total and zero segments are handled, forced-colors gives each segment its own fill
  pattern, and the draw-in is removed under reduced motion.

### Patch Changes

- [#73](https://github.com/luizgabriellf/lufia-design-system/pull/73) [`abea566`](https://github.com/luizgabriellf/lufia-design-system/commit/abea566c01dcf03ea2ba26b64fe230fc7b989c48) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - `CommandPalette` no longer renders an empty row when `labels.empty` returns `null`, `undefined`, `false` or an empty
  string, and the results area drops its padding when nothing is left to show (no results, no hint, no loading row), so a
  notice that explains the state leaves no blank gap.

## 0.19.0

### Minor Changes

- [#71](https://github.com/luizgabriellf/lufia-design-system/pull/71) [`e4b873d`](https://github.com/luizgabriellf/lufia-design-system/commit/e4b873d1f3ec5e2e22869bda7964a7b81834c544) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Style browser autofill on every field control from tokens. The new optional `--lufia-color-bg-field-autofill` token
  defaults to `bg.field`, so existing themes need no change. An invalid field keeps its inner danger line, read-only and
  disabled fields use the surface colour, forced-colors hands the colours to the system, and fields with a prefix or suffix
  square their inner corners. `Select` gains a `groups` prop that renders labelled `<optgroup>`s.

## 0.18.0

### Minor Changes

- [#69](https://github.com/luizgabriellf/lufia-design-system/pull/69) [`7c876f4`](https://github.com/luizgabriellf/lufia-design-system/commit/7c876f433a511fcfb1c885279b15036af8a625a3) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Close the gaps that kept apps from replacing a local combobox with `Combobox`. New `freeText` prop: the typed text is the value when no option is chosen (trimmed, `null` when empty), it follows every keystroke, Enter, Tab, Escape, the toggle button and blur settle it, and Enter never picks an unhighlighted first match. The list now opens upward and shortens to the room left in every overflow-clipping ancestor and the viewport, and re-measures on scroll and resize (one measure per frame). `maxLength` and a given `id` (`<id>-listbox`, `<id>-option-<encoded value>`) are now covered by tests and docs. Existing usage is unchanged.

- [#68](https://github.com/luizgabriellf/lufia-design-system/pull/68) [`ee54d65`](https://github.com/luizgabriellf/lufia-design-system/commit/ee54d65964e8c52010c29639f67d4584aeedb541) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Close the gaps of a server-backed `CommandPalette`. `labels.loading` shows a spinner row below the commands while `loading` is true and announces it once, `hint` may be a function of `{ query }` and `hintPlacement="top"` keeps it above the list, `notice` renders a message (such as an error) above the results without replacing them so keyboard selection keeps working, and `CommandItem.tone` (`default`, `accent`, `danger`) tints an item's icon. Existing usage is unchanged.

## 0.17.0

### Minor Changes

- [#66](https://github.com/luizgabriellf/lufia-design-system/pull/66) [`3493864`](https://github.com/luizgabriellf/lufia-design-system/commit/3493864df80b210408b3f1ac13dfdb5c8fe7d4c3) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Make `SegmentedToggle` usable as a status picker. `value={null}` (or `defaultValue={null}`) means nothing is chosen (no checked segment, hidden indicator, and a form reset returns to it), `allowDeselect` clears the choice when the chosen segment is activated again and reports it through the new `onDeselect` callback (`onValueChange` still always receives a `string`), `SegmentedToggleOption.tone` colours the chosen segment with the status tokens, `size="sm"` gives a denser variant, and the hidden `name` input submits nothing while unset. Existing usage is unchanged.

## 0.16.0

### Minor Changes

- [#64](https://github.com/luizgabriellf/lufia-design-system/pull/64) [`b576c9c`](https://github.com/luizgabriellf/lufia-design-system/commit/b576c9c8b92929c7a985e9e23f411697c1c261f0) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add a `pressed` prop to `StatTile`. On a button tile it sets `aria-pressed` and shows a selected state (accent border and background, a thicker inset border and a check mark), so a row of tiles can act as list filters. It is ignored for link, plain and loading tiles.

## 0.15.0

### Minor Changes

- [#62](https://github.com/luizgabriellf/lufia-design-system/pull/62) [`fa78928`](https://github.com/luizgabriellf/lufia-design-system/commit/fa7892861a96560ff0adc61e9186422defd4e17b) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - `MoreActions` popover is no longer clipped by an ancestor with `overflow: hidden`. Once mounted, the open menu is portalled out of the component (to the body, or into the open modal it sits in) and placed with `position: fixed` from the button's box. It opens upward when there is no room below, keeps flipping horizontally, follows the button on scroll and resize (closing when the button is hidden or scrolls out of view), and scrolls inside when the list is taller than the room.
  
  Consumers: the open menu is no longer inside the component's root element, so query it by role (`getByRole("menu")`) rather than within the root. A nested `data-lufia-theme`/`data-lufia-mode` scope, `dir`, `lang` and the root's inline `--lufia-*` properties are copied onto the menu. `useDismiss` takes an optional fifth argument for a portalled popup that counts as inside.
  
  Test DOMs without layout (jsdom) need no mocks: the menu opens and stays open, and the hidden-trigger and scrolled-away checks apply only when the trigger had layout as the menu opened.

### Patch Changes

- [#61](https://github.com/luizgabriellf/lufia-design-system/pull/61) [`843367f`](https://github.com/luizgabriellf/lufia-design-system/commit/843367f3125c420912e4cab24a5782d8c4e9f844) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Badge: keep a status word whole in a squeezed table column. The badge now uses `overflow-wrap: break-word` instead of
  `anywhere`, so an auto-layout column can no longer shrink it to one character per line; a word still breaks when it
  cannot fit on a line of its own.

## 0.14.0

### Minor Changes

- [#58](https://github.com/luizgabriellf/lufia-design-system/pull/58) [`a73c5a9`](https://github.com/luizgabriellf/lufia-design-system/commit/a73c5a98288429f0e5f9d2afd24493a2c76afa01) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `NotificationCenter`: a bell with an unread count that opens a panel of notifications, as a non-modal popover on wide pages and a modal sheet below 60rem. Also exports `NotificationPanel` (the panel alone, for a page) and `NotificationSummary` (a highlight card). Tabs, groups, loading, empty and error states, an unread live region, and reduced-motion-aware motion.

- [#59](https://github.com/luizgabriellf/lufia-design-system/pull/59) [`bec1453`](https://github.com/luizgabriellf/lufia-design-system/commit/bec1453c5518f6d2f99093711faa85761ddfa373) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - `PageActions` gains `collapse="container"`, which collapses the secondary actions by the width of the nearest ancestor that declares `container-type: inline-size` (below 50rem) instead of the viewport. `MoreActions` gains `narrowOnlyScope` for the same choice. Menu items and page actions gain `attributes`, a `data-*` passthrough rendered on the item element.

## 0.13.0

### Minor Changes

- [#54](https://github.com/luizgabriellf/lufia-design-system/pull/54) [`ababaad`](https://github.com/luizgabriellf/lufia-design-system/commit/ababaad1f52c97af1929ea9a3691db92bd1c4111) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - PageActions and MoreActions items accept a `hint` (tooltip plus accessible description; a hinted disabled action stays focusable as `aria-disabled`). PageActions adds `size`, `hideBelow`, `primaryPlacement`, a stable `data-lufia-part="page-actions"` root and attribute pass-through.

## 0.12.0

### Minor Changes

- [#52](https://github.com/luizgabriellf/lufia-design-system/pull/52) [`bfffd2d`](https://github.com/luizgabriellf/lufia-design-system/commit/bfffd2d1805cdda6a52406f90354dbe3f96be21d) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - `MoreActions` gains `presentation="auto" | "popover" | "sheet"`: a full-width bottom sheet in a portal, over a backdrop that covers the viewport, with focus trap, inert page, scroll lock and a `--lufia-overlay-z` stacking hook. `PageActions` uses `auto`, so its menu is a sheet below 60rem. Items without an icon now keep a leading slot when others have one.

## 0.11.0

### Minor Changes

- [#47](https://github.com/luizgabriellf/lufia-design-system/pull/47) [`91135a8`](https://github.com/luizgabriellf/lufia-design-system/commit/91135a8d9e883162f46d5031836389b9f4758031) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Extend the agent-facing component manifest. Hooks that return an object type now list its members (`returnMembers`),
  props typed as a union of forms now list their `variants` with the discriminant and the props that differ per form, and the
  Select and Combobox summaries mention "dropdown". The flat `props` list is unchanged. The `ai:search` lookup also matches
  the start of a word.

- [#51](https://github.com/luizgabriellf/lufia-design-system/pull/51) [`95f070c`](https://github.com/luizgabriellf/lufia-design-system/commit/95f070c050d6cd46502b9826d78b1eb63971c28c) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Ship the AI docs (`components.json`, per-component specs, `llms.txt`) inside the package under `./ai/*`, and add the `lufia-ai` bin: a version-matched, offline lookup CLI (`search`, `list`, `show`, `version`) and a local stdio MCP server (`lufia-ai mcp`) for coding agents.

## 0.10.0

### Minor Changes

- [#39](https://github.com/luizgabriellf/lufia-design-system/pull/39) [`3995d63`](https://github.com/luizgabriellf/lufia-design-system/commit/3995d6355a9d8144dc9accac8b6d37161ce03787) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Forms: `RadioGroup` and `SegmentedToggle` dispatch a bubbling `input` and then `change` Event from their hidden input (from the group when there is no `name`) when the user chooses an option by click or arrow key, so a native `change` listener on the form, or a React `onInput`, sees them like native radios (a React `onChange` does not: React ignores hidden inputs). A parent-set `value`, a form reset and choosing what is already chosen dispatch nothing. Charts: `ColumnChart` gets opt-in `interactive` with `columns[].detail` (the columns are one tab stop with arrow keys, Home and End between them, announced as a `columnLabel` ("column"), named "label: values · detail", with a tooltip on hover, focus and tap that Escape dismisses), `printValues` (`"auto"` prints totals for 6 columns or fewer), `columns[].band` (an error bar counted in the scale and listed in the data table, named by `bandLabel`) and `series[].pattern="hatch"` (a non-colour cue in the columns and legend). `BarList` gets opt-in `valueWrap`, which lets a long `value` wrap. All off by default.

### Patch Changes

- [#39](https://github.com/luizgabriellf/lufia-design-system/pull/39) [`3995d63`](https://github.com/luizgabriellf/lufia-design-system/commit/3995d6355a9d8144dc9accac8b6d37161ce03787) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Fix a form reset after a form action restoring the previous default. `RadioGroup`, `SegmentedToggle`, `Switch`, `SearchInput`, `Combobox`, `Textarea` and `FileField` reset to the `defaultValue` or `defaultChecked` of the latest render, like native fields do, when React 19 resets the form right after an action commits and the action changed the default. `Checkbox`, `Select` and `SwitchInput` are native inputs and were not affected.

- [#40](https://github.com/luizgabriellf/lufia-design-system/pull/40) [`0032d7b`](https://github.com/luizgabriellf/lufia-design-system/commit/0032d7b81b019e67ec12fe5a74288db4a6c8f8f1) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - `useFocusTrap` (and so `Modal`, `ConfirmDialog` and every component built on it) now follows the browser's keyboard Tab order: elements with a negative `tabindex` (for example the inactive items of a roving tab stop) and disabled controls are no longer tab stops inside a trap, and positive `tabindex` values come before the natural DOM order. `getFocusableElements` returns the elements in that order.

## 0.9.0

### Minor Changes

- [#37](https://github.com/luizgabriellf/lufia-design-system/pull/37) [`70fd390`](https://github.com/luizgabriellf/lufia-design-system/commit/70fd3909d042d36b2b0025a9dab606abd32401b6) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Charts: add `ColumnChart` (single or stacked columns on one baseline, per-series tones, a legend and a hidden data table, `--lufia-column-chart-plot-height`); `BarList` gets `reference` (a dashed reference tick on every track, described by its label) and `titleVisibility="hidden"` (screen-reader-only title); `ProgressBar` gets opt-in `animateChanges` (a `transform: scaleX` transition, none under reduced motion). All off by default.

- [#37](https://github.com/luizgabriellf/lufia-design-system/pull/37) [`70fd390`](https://github.com/luizgabriellf/lufia-design-system/commit/70fd3909d042d36b2b0025a9dab606abd32401b6) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - `StatTile` with `loading` changes its default rendering (not opt-in): the skeleton now holds one line per `delta` and `hint` you pass, a placeholder where a `sparkline` is passed, and a `1lh` value height (with a rem fallback for engines without `lh`), so the loaded tile keeps its exact height. Pass the same `delta`, `hint` and `sparkline` while loading as when loaded. `Badge` reads its corner radius from `--lufia-badge-radius`, falling back to the current pill.

- [#37](https://github.com/luizgabriellf/lufia-design-system/pull/37) [`70fd390`](https://github.com/luizgabriellf/lufia-design-system/commit/70fd3909d042d36b2b0025a9dab606abd32401b6) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Forms: `FormField` parts carry stable `data-lufia-part` hooks (`field`, `label`, `hint`, `error`, `control`). Behaviour change: the children now sit inside a `data-lufia-part="control"` wrapper element (`display: contents`), so direct-child selectors on the field root (`.f > input`, `:nth-child`) no longer reach the control. `LufiaProvider` gets a `required` label that is the default `requiredLabel` of `FormField` and `RadioGroup` (an explicit prop still wins). `RadioGroup` gets `variant="card"` and per-option `meta` and `content` slots. New `SwitchInput`, a native `<input type="checkbox" role="switch">` whose value is read from the form; `Switch` is unchanged. `LufiaLabels` gains a required `required` key, so code that builds a complete `LufiaLabels` object must add it.

- [#37](https://github.com/luizgabriellf/lufia-design-system/pull/37) [`70fd390`](https://github.com/luizgabriellf/lufia-design-system/commit/70fd3909d042d36b2b0025a9dab606abd32401b6) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Overlays: export `hasOpenOverlay()` and `overlayDepth()`, public readers of the shared overlay stack, so apps stop reading the global key. `Modal` publishes the height its sticky header covers as `--lufia-modal-header-block-size` on the panel (kept current with a `ResizeObserver`, `0px` with `scrollShadow`), so sticky content in the body can use it as its offset.

## 0.8.0

### Minor Changes

- [#35](https://github.com/luizgabriellf/lufia-design-system/pull/35) [`d9c6a1a`](https://github.com/luizgabriellf/lufia-design-system/commit/d9c6a1a64814b8c9068b996b16a4f8b3fb162f01) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Fix a modal opened over another modal being left `inert`. A portal `Modal` now renders no layer while it is closed and its exit animation has finished, and the inert bookkeeping is recomputed from the open modals: only the topmost modal's root is live, the roots below it are inert, and nothing stays inert once the last one closes, whatever the order. This also covers a layer that stays mounted (`keepMounted`, or a `useConfirmDialog` that keeps its options after it settles). `Reveal` gains an `onExited` callback, and `notifyTopModalDialogChanged` is now exported from `components/Modal`.
  
  Inert state now lives on a new global key, so an older copy of the package (0.7.0 or earlier) loaded on the same page can never crash or leave the page stuck inert. Known limits while such an older copy has its own modal open: the background can stay interactive until the newer copy's modals close, and a newer modal whose root was already in the body before the older modal opened (`keepMounted`, or a pre-existing `container`) stays inert until the older modal closes. Nothing stays inert once every modal has closed. Upgrading every copy removes these limits.
  
  A `Reveal` exit now also completes after a safety timeout (its animation duration and delay plus a short margin) if `animationend` never fires.

## 0.7.0

### Minor Changes

- [#33](https://github.com/luizgabriellf/lufia-design-system/pull/33) [`d427c4e`](https://github.com/luizgabriellf/lufia-design-system/commit/d427c4e4baf45a87d9ed850a9e0e4309e4402eb9) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add the hooks an app needs to migrate its own modal, confirm dialog and toast onto the package.
  
  - `Modal` and `ConfirmDialog` parts carry a stable `data-lufia-part` and take per-part class names through `classNames`. `ConfirmDialog` also takes `size`, `sheetPlacement` and `classNames`, and `useConfirmDialog().confirm()` passes them through.
  - `registerOverlayLayer()` and `isTopOverlayLayer()` expose the focus-trap and dismiss stack, now kept on `globalThis.__lufiaOverlayStack`, so an app's own trap and duplicated copies of the package agree on which layer handles Escape and Tab.
  - `ToastProvider` takes `viewportClassName`. New component tokens, with fallbacks equal to the previous values in left-to-right layouts: `--lufia-toast-width`, `-min-width`, `-max-width`, `-gap`, `-padding-block`, `-padding-inline` (and `-start` / `-end`), `-align-items` and `-line-height`.
  - `Pagination` takes `disabledMode="native"` to render a real `disabled` attribute on previous and next (default `"aria"`).
  - `PeerNav` items accept any `href` type the configured link component accepts (`PeerNavItem<Href>`); strings keep working.
  - Toast item padding is now logical (`padding-inline`, start and end), in line with the tone stripe on `border-inline-start`. In right-to-left layouts the larger padding therefore sits on the right, where the old physical shorthand put it on the left. Left-to-right output is unchanged.
  - `--lufia-toast-gap` also sets the space between the two stacks (errors and the rest) inside the region.
  - The inert bookkeeping of modals is shared on `globalThis` like the layer stack, so duplicated copies of the package agree. A legacy overlay portaled into `document.body` above an open `Modal` must carry `data-lufia-inert-exempt`.

## 0.6.0

### Minor Changes

- [#30](https://github.com/luizgabriellf/lufia-design-system/pull/30) [`8a642eb`](https://github.com/luizgabriellf/lufia-design-system/commit/8a642eb16def0b170208427dd7331bf7894e7956) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add component tokens: `--lufia-page-header-eyebrow-dash-thickness`, `--lufia-page-header-eyebrow-weight`, `--lufia-stat-tile-label-font`, `--lufia-attention-list-bar-inset-inline` and `-block` (the shorthand `--lufia-attention-list-bar-inset` stays the fallback), and `--lufia-card-body-padding-block` and `-inline` (they default to the `padding` prop; when `--lufia-card-body-padding` is set it wins and the axis tokens are ignored). Fallbacks equal the previous values, so nothing changes by default.

## 0.5.0

### Minor Changes

- [#27](https://github.com/luizgabriellf/lufia-design-system/pull/27) [`050fd89`](https://github.com/luizgabriellf/lufia-design-system/commit/050fd89a433a8dca82e0c60b6f51c07074f808d7) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Fix entrance animations leaving a resting `transform`, and add component tokens.
  
  - Fix: `RouteTransition`, `Stagger`, `Reveal` and the entrance animations of `Modal`, `NavSheet`, `CommandPalette`, `Toast`, `Combobox`, `MoreActions` and the chart bars used `animation-fill-mode: both`, which left an identity `transform` on the element after the animation. That made it the containing block of any `position: fixed` descendant rendered inline. They now fill `backwards`, so the resting state is `transform: none`. (`NavSheet` rests with its own `translateY(var(--lufia-sheet-drag, 0))`, which follows a drag; it sits inside a fixed root, so that is harmless.)
  - Add component tokens, with defaults equal to the current values: `--lufia-page-header-eyebrow-{color,tracking,dash-size,dash-gap}`, `--lufia-page-header-title-{size,tracking}`, `--lufia-stat-tile-label-{color,size,tracking}`, `--lufia-stat-tile-value-size{,-narrow}`, `--lufia-card-{header-padding,body-padding,shadow,shadow-hover,divider-color}` and `--lufia-attention-list-bar-{width,inset}`.
  - Add `Card` `divider` and `AttentionList` `barStyle="edge" | "inset"`.
  - Document every component token on the new "Theming components" page.

## 0.4.0

### Minor Changes

- [#25](https://github.com/luizgabriellf/lufia-design-system/pull/25) [`e605c36`](https://github.com/luizgabriellf/lufia-design-system/commit/e605c36563584113d7a9f06edffebc825e01ee21) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add dashboard primitives (beta): `StatTile`, the chart kit `Sparkline`, `BarList`, `BulletBar` and `ProgressBar`, `SectionHeader`, `AttentionList` and `ActivityList`, and the motion primitives `Stagger` and `RouteTransition`. `Card` gains an optional `description` and a `flush` body; existing cards render as before.

## 0.3.0

### Minor Changes

- [#24](https://github.com/luizgabriellf/lufia-design-system/pull/24) [`414cd76`](https://github.com/luizgabriellf/lufia-design-system/commit/414cd76dc224ff78de4f3beae5518f5fe028c335) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `AppShell` slots and options: `navigationPending`, `topBar`, `statusRow`, `searchTrigger` (and `keyShortcuts`/`opensDialog` on `search`), page-registered primary actions (`useShellPrimaryAction`, `ShellPrimaryActionSlot`), per-item `ariaLabel`, `data-*` attributes forwarded on the floating bar, and `sheetAs="dialog"` (also `NavSheet` `renderAs="dialog"`) for a native top-layer navigation sheet.

- [#20](https://github.com/luizgabriellf/lufia-design-system/pull/20) [`11132ee`](https://github.com/luizgabriellf/lufia-design-system/commit/11132ee1021717f3615f4ff409df60119280ffcd) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `Badge` and `StatusBadge`, a pill label with neutral, info, success, warning, danger and ai tones and an optional dot. The text is always present, so the tone never carries the meaning alone.

- [#20](https://github.com/luizgabriellf/lufia-design-system/pull/20) [`11132ee`](https://github.com/luizgabriellf/lufia-design-system/commit/11132ee1021717f3615f4ff409df60119280ffcd) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `Button` with primary, secondary, ghost and danger variants, three sizes, a width-preserving loading state, icon slots, full width, and a link rendering through `LufiaLink` when `href` is given.

- [#20](https://github.com/luizgabriellf/lufia-design-system/pull/20) [`11132ee`](https://github.com/luizgabriellf/lufia-design-system/commit/11132ee1021717f3615f4ff409df60119280ffcd) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `Card`, a surface with title, header action, body and footer slots, four padding sizes, and an interactive variant that makes the whole card clickable through a single stretched link.

- [#22](https://github.com/luizgabriellf/lufia-design-system/pull/22) [`c36d366`](https://github.com/luizgabriellf/lufia-design-system/commit/c36d3660ef08cc990dcf50778981b4bcf60a785f) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `Checkbox` (with the indeterminate state), `RadioGroup` (a radiogroup with roving arrow keys) and `Switch` (a `role="switch"` button).

- [#22](https://github.com/luizgabriellf/lufia-design-system/pull/22) [`c36d366`](https://github.com/luizgabriellf/lufia-design-system/commit/c36d3660ef08cc990dcf50778981b4bcf60a785f) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `Combobox`, a searchable single select following the WAI-ARIA combobox with listbox pattern. It supports typeahead, async options, empty and loading states, and dismisses through the shared layer stack. `FormField` now gives its label an id and exports `useFormFieldLabelId`.

- [#24](https://github.com/luizgabriellf/lufia-design-system/pull/24) [`414cd76`](https://github.com/luizgabriellf/lufia-design-system/commit/414cd76dc224ff78de4f3beae5518f5fe028c335) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `CommandPalette` `bodyOverride` (replaces the results, e.g. with an answer), `onEscape` (intercept the first Escape to leave a sub-mode), `groupOrder` (fixed section order) and `loading` (for server-side search driven by `onQueryChange`).

- [#22](https://github.com/luizgabriellf/lufia-design-system/pull/22) [`c36d366`](https://github.com/luizgabriellf/lufia-design-system/commit/c36d3660ef08cc990dcf50778981b4bcf60a785f) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `FileField`, a file picker with drag and drop, the native input kept in the form, type, size and count limits with messages supplied through props, and a list of chosen files with remove buttons. Also exports `formatFileSize` and `matchesAccept`.

- [#22](https://github.com/luizgabriellf/lufia-design-system/pull/22) [`c36d366`](https://github.com/luizgabriellf/lufia-design-system/commit/c36d3660ef08cc990dcf50778981b4bcf60a785f) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `FormField`, which wires a label, hint and error to its control through ids, `aria-describedby` and `aria-invalid`, marks required fields in text, and exposes its ids through context, a render prop and `useFormFieldControl`.

- [#20](https://github.com/luizgabriellf/lufia-design-system/pull/20) [`11132ee`](https://github.com/luizgabriellf/lufia-design-system/commit/11132ee1021717f3615f4ff409df60119280ffcd) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `IconButton`, an icon-only `Button` whose `aria-label` is required by the types and which shows it as a `title` tooltip.

- [#20](https://github.com/luizgabriellf/lufia-design-system/pull/20) [`11132ee`](https://github.com/luizgabriellf/lufia-design-system/commit/11132ee1021717f3615f4ff409df60119280ffcd) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `Link`, an inline text link rendered through `LufiaLink`, with an external-link indicator and a required visually hidden "opens in new tab" label.

- [#24](https://github.com/luizgabriellf/lufia-design-system/pull/24) [`414cd76`](https://github.com/luizgabriellf/lufia-design-system/commit/414cd76dc224ff78de4f3beae5518f5fe028c335) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `Modal` `keepMounted` (children stay mounted while closed, so typed input survives) and `renderAs="dialog"` (a native `<dialog>` opened with `showModal()` in the browser's top layer, with the same focus trap, Escape handling and layer stack).

- [#24](https://github.com/luizgabriellf/lufia-design-system/pull/24) [`414cd76`](https://github.com/luizgabriellf/lufia-design-system/commit/414cd76dc224ff78de4f3beae5518f5fe028c335) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `Modal` theming hooks: `--lufia-modal-*` custom properties (radius, header, body and footer padding, title size, close-button size, backdrop colour, phone sheet offset and radius), `sheetPlacement`, `titleWrap`, `scrollShadow`, and a `size` that also accepts a custom CSS length.

- [#20](https://github.com/luizgabriellf/lufia-design-system/pull/20) [`11132ee`](https://github.com/luizgabriellf/lufia-design-system/commit/11132ee1021717f3615f4ff409df60119280ffcd) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `MoreActions`, an overflow menu button following the WAI-ARIA menu button pattern: arrow keys, Home, End, typeahead, and Escape or outside press through `useDismiss`.

- [#20](https://github.com/luizgabriellf/lufia-design-system/pull/20) [`11132ee`](https://github.com/luizgabriellf/lufia-design-system/commit/11132ee1021717f3615f4ff409df60119280ffcd) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `PageActions`, a page action row with a primary action, secondary actions that collapse into the menu on narrow screens, and an overflow menu.

- [#20](https://github.com/luizgabriellf/lufia-design-system/pull/20) [`11132ee`](https://github.com/luizgabriellf/lufia-design-system/commit/11132ee1021717f3615f4ff409df60119280ffcd) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `PageHeader`: eyebrow, title with a heading level prop, description and an actions slot that wraps under the text on narrow screens.

- [#24](https://github.com/luizgabriellf/lufia-design-system/pull/24) [`414cd76`](https://github.com/luizgabriellf/lufia-design-system/commit/414cd76dc224ff78de4f3beae5518f5fe028c335) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `Pagination` `variant="compact"` (previous and next only, with the status line) and a `buttonClassName` slot for the controls.

- [#24](https://github.com/luizgabriellf/lufia-design-system/pull/24) [`414cd76`](https://github.com/luizgabriellf/lufia-design-system/commit/414cd76dc224ff78de4f3beae5518f5fe028c335) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `PeerNav` theming hooks (`--lufia-peer-nav-*` for radii, label and description type, indicator border and shadow, active icon colour, disabled opacity, focus ring width and maximum inline size), a `phoneGrid="2x2"` option for four items, and `onItemClick`, which fires for the current item and for modified clicks.

- [#22](https://github.com/luizgabriellf/lufia-design-system/pull/22) [`c36d366`](https://github.com/luizgabriellf/lufia-design-system/commit/c36d3660ef08cc990dcf50778981b4bcf60a785f) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `PendingSubmit`, a form submit button that blocks double submission, shows pending and progress labels, and follows the form through React 19 `useFormStatus` or a `pending` prop.

- [#22](https://github.com/luizgabriellf/lufia-design-system/pull/22) [`c36d366`](https://github.com/luizgabriellf/lufia-design-system/commit/c36d3660ef08cc990dcf50778981b4bcf60a785f) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `SearchInput`, a search box with a clear button, an optional shortcut hint, a loading state and a debounced `onSearch`.

- [#22](https://github.com/luizgabriellf/lufia-design-system/pull/22) [`c36d366`](https://github.com/luizgabriellf/lufia-design-system/commit/c36d3660ef08cc990dcf50778981b4bcf60a785f) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `SegmentedToggle`, a radiogroup of compact segments with roving arrow keys and an animated indicator.

- [#22](https://github.com/luizgabriellf/lufia-design-system/pull/22) [`c36d366`](https://github.com/luizgabriellf/lufia-design-system/commit/c36d3660ef08cc990dcf50778981b4bcf60a785f) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `Select`, a native select styled with tokens that joins a surrounding `FormField`.

- [#22](https://github.com/luizgabriellf/lufia-design-system/pull/22) [`c36d366`](https://github.com/luizgabriellf/lufia-design-system/commit/c36d3660ef08cc990dcf50778981b4bcf60a785f) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `TextInput` with prefix and suffix slots, and `Textarea` with an optional character count. Both join a surrounding `FormField` automatically.

- [#24](https://github.com/luizgabriellf/lufia-design-system/pull/24) [`414cd76`](https://github.com/luizgabriellf/lufia-design-system/commit/414cd76dc224ff78de4f3beae5518f5fe028c335) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - `ToastProvider` now announces from persistent, visually hidden live regions (`role="status"` and `role="alert"`): one in the body and one inside each open modal dialog, so a toast raised while a dialog is open, or as it closes, is still read out. Only the visible stack moves between hosts, without replaying its enter animation. Note for tests: the hidden announcer holds a copy of each message, so `getByText` can find two matches; assert what is announced with `getByRole("status")` (or `"alert"` for errors) and query the visible toast inside the `Notifications` region.

- [#24](https://github.com/luizgabriellf/lufia-design-system/pull/24) [`414cd76`](https://github.com/luizgabriellf/lufia-design-system/commit/414cd76dc224ff78de4f3beae5518f5fe028c335) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `ToastProvider` `container` (hosts the notification region inside the topmost open modal `<dialog>` by default, so toasts stay visible above a top-layer dialog, or in a given element) and `toneAliases` for an app's own tone names, plus `--lufia-toast-icon-size`, `--lufia-toast-radius` and `--lufia-toast-border-width`.

### Patch Changes

- [#24](https://github.com/luizgabriellf/lufia-design-system/pull/24) [`414cd76`](https://github.com/luizgabriellf/lufia-design-system/commit/414cd76dc224ff78de4f3beae5518f5fe028c335) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Render a portal `Modal` or `ConfirmDialog` opened over a native dialog inside that dialog, turn the native `close` event into `onClose`, compose the caller's `onClick` and `onPointerDown` on a native `Modal`, keep the registration order of `useShellPrimaryAction`, and honour a prevented `PeerNav` `onItemClick`.

## 0.2.0

### Minor Changes

- [#18](https://github.com/luizgabriellf/lufia-design-system/pull/18) [`06128ac`](https://github.com/luizgabriellf/lufia-design-system/commit/06128ac078f2e5f764303b80863f7a570e1cbaa1) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `AppShell`: a sidebar with collapsible groups that can shrink to a rail, header and footer slots and an active state from `currentPath`; on phones a top bar, a floating bar (`MobileFloatBar`) and a navigation sheet (`NavSheet`) with swipe-to-dismiss, focus trap, Escape and reduced-motion support. The parts (`Sidebar`, `SidebarGroup`, `SidebarItem`, `ShellNavigation`, `MobileFloatBar`, `NavSheet`) are exported for composition.

- [#17](https://github.com/luizgabriellf/lufia-design-system/pull/17) [`c40f6e8`](https://github.com/luizgabriellf/lufia-design-system/commit/c40f6e88e68d89abd140e21d1aa35f8980a3f53f) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `Modal` (beta): a portaled dialog with sizes, header and footer slots, focus trap, inert background, scroll lock, Escape and outside-click policies, a busy state and enter/exit motion. It follows the WAI-ARIA APG modal dialog pattern. A native `<dialog>` variant is deliberately not shipped: one API covers both.

- [#13](https://github.com/luizgabriellf/lufia-design-system/pull/13) [`ca6218c`](https://github.com/luizgabriellf/lufia-design-system/commit/ca6218c2b7c4ad115124154e28dec11e3a8cae72) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add motion: `--lufia-motion-distance-*` tokens and a reduced-motion policy that collapses durations and distances; the Reveal, Collapse, Skeleton, AnimatedNumber and ChangeHighlight primitives and the `usePrefersReducedMotion` hook (beta, from `@lufia/design-system/motion`); and the `lufia-verify-motion` command that flags literal durations and easings, animated layout properties and missing reduced-motion handling, with a shrink-only baseline.

- [#17](https://github.com/luizgabriellf/lufia-design-system/pull/17) [`c40f6e8`](https://github.com/luizgabriellf/lufia-design-system/commit/c40f6e88e68d89abd140e21d1aa35f8980a3f53f) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `ConfirmDialog` and `useConfirmDialog` (beta): an alert dialog with a destructive variant that starts focus on the safe action, and a busy state that refuses to close while the confirmed action runs. `useConfirmDialog` is a promise-based replacement for `window.confirm()`.

- [#18](https://github.com/luizgabriellf/lufia-design-system/pull/18) [`06128ac`](https://github.com/luizgabriellf/lufia-design-system/commit/06128ac078f2e5f764303b80863f7a570e1cbaa1) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `CommandPalette`, a Ctrl/Cmd+K search-and-run overlay built as a combobox with a listbox popup inside a modal dialog, with grouped, accent-insensitive filtering and a custom filter hook for server search.

- [#17](https://github.com/luizgabriellf/lufia-design-system/pull/17) [`c40f6e8`](https://github.com/luizgabriellf/lufia-design-system/commit/c40f6e88e68d89abd140e21d1aa35f8980a3f53f) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `ToastProvider`, `useToast` and `useOptionalToast` (beta): stacked notifications in four placements, assertive live region for errors and polite for the rest, auto-dismiss that pauses on hover and focus, errors and actions that persist, an action button, dismiss, de-duplication and a reduced-motion fallback.

- [#18](https://github.com/luizgabriellf/lufia-design-system/pull/18) [`06128ac`](https://github.com/luizgabriellf/lufia-design-system/commit/06128ac078f2e5f764303b80863f7a570e1cbaa1) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `NavRow`, a compact clickable list row with icon, title, badge, description, meta and a chevron, rendered as a link, a button or a plain block.

- [#18](https://github.com/luizgabriellf/lufia-design-system/pull/18) [`06128ac`](https://github.com/luizgabriellf/lufia-design-system/commit/06128ac078f2e5f764303b80863f7a570e1cbaa1) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `Pagination`, keyboard-accessible page navigation with `aria-current`, a constant-width ellipsis window, optional real links and a live status line, built to pair with `usePagination`.

- [#18](https://github.com/luizgabriellf/lufia-design-system/pull/18) [`06128ac`](https://github.com/luizgabriellf/lufia-design-system/commit/06128ac078f2e5f764303b80863f7a570e1cbaa1) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `PeerNav`, a horizontal set of sibling views with an animated active indicator. It renders a link list with `aria-current` when every item has an `href`, and a WAI-ARIA tablist with arrow-key navigation otherwise.

- [#16](https://github.com/luizgabriellf/lufia-design-system/pull/16) [`e51806b`](https://github.com/luizgabriellf/lufia-design-system/commit/e51806b2c33ff44d3401d61a33eed39e4c2af275) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add the foundations for overlays and navigation: `LufiaProvider` (a `linkComponent` adapter and aria-only `labels`) with `useLufia` and `LufiaLink`; the hooks `useFocusTrap` (APG dialog focus handling, optional `inert` background), `useMediaQuery` (SSR-safe), `useModalState` (modal state in the URL through a router-agnostic adapter), `useDismiss`, `usePagination` and `useStepDirection`; and `VisuallyHidden`. `useBodyScrollLock` now compensates the scrollbar width in document mode; its API is unchanged.

- [#18](https://github.com/luizgabriellf/lufia-design-system/pull/18) [`06128ac`](https://github.com/luizgabriellf/lufia-design-system/commit/06128ac078f2e5f764303b80863f7a570e1cbaa1) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `useSlidingIndicator`, a hook that slides a decorative indicator behind the active item of a tab-like row using `transform` only.

- [#17](https://github.com/luizgabriellf/lufia-design-system/pull/17) [`c40f6e8`](https://github.com/luizgabriellf/lufia-design-system/commit/c40f6e88e68d89abd140e21d1aa35f8980a3f53f) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `SuccessCheck` (beta): a decorative check mark whose stroke draws in once, and is simply drawn under reduced motion.

### Patch Changes

- [#15](https://github.com/luizgabriellf/lufia-design-system/pull/15) [`b284b43`](https://github.com/luizgabriellf/lufia-design-system/commit/b284b43d433c64d62e4ac79dbc4cbb48c854c786) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Build declarations with a larger Node heap so installs from a git tag do not run out of memory.

## 0.1.0

Initial public pre-release (consumed from a git tag; npm publishing is on hold).

- DTCG design tokens built with Style Dictionary: primitive and semantic layers, `default` and `example-brand` themes, light, dark and forced-colors, plus a WCAG AA contrast check in CI.
- First `beta` components: `ActionIcons`, `DetailAttentionCard`, `DetailList`, `DetailSectionCard`, `EmptyState`, `SortableTh`, `StatusTimeline`, `Stepper`, `TableToolbar` and the `useBodyScrollLock` hook.
- Storybook documentation site with theme, mode and viewport controls, deployed to GitHub Pages.

Later releases are generated from changesets.
