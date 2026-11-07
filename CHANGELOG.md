# @lufia/design-system

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
