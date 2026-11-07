# @lufia/design-system

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
