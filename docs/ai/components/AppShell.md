# AppShell

> The application frame: sidebar, content area and the phone navigation sheet.

- Status: beta
- Category: Navigation
- Import: `import { APP_SHELL_BREAKPOINT, AppShell, MobileFloatBar, MobileFloatBarButton, MobileFloatBarSeparator, NavSheet, ROUTE_PROGRESS_DONE_EVENT, ROUTE_PROGRESS_START_EVENT, RouteProgress, SHEET_DRAG_THRESHOLD, SHELL_COUNT_CAP, ShellFooter, ShellFooterItem, ShellNavigation, ShellPrimaryActionOwner, ShellPrimaryActionSlot, Sidebar, SidebarGroup, SidebarItem, doneRouteProgress, findActiveNavKey, formatShellCount, parseShellState, serializeShellState, startRouteProgress, useSheetDrag, useShellPrimaryAction, useShellPrimaryActionState } from "@lufia/design-system/components/AppShell"`
- Also from: `@lufia/design-system`
- Source: [src/components/AppShell](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/AppShell)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-navigation-appshell--docs)

## Purpose

The frame of an application. On wide screens a sidebar with groups that open and close and that can shrink to a rail. On
phones a sticky top bar, a floating bar within thumb reach, and a navigation sheet that rises from the bottom. The
navigation is data, so both layouts always agree.

## When to use

- A signed-in application with a handful of top-level areas, on both phones and desktops.

## When not to use

- A marketing site (use a header), or navigation that is only a few peer views of one page (use `PeerNav`).

## Exports

| Name | Kind |
| --- | --- |
| `APP_SHELL_BREAKPOINT` | constant |
| `AppShell` | component |
| `MobileFloatBar` | component |
| `MobileFloatBarButton` | component |
| `MobileFloatBarSeparator` | component |
| `NavSheet` | component |
| `ROUTE_PROGRESS_DONE_EVENT` | constant |
| `ROUTE_PROGRESS_START_EVENT` | constant |
| `RouteProgress` | component |
| `SHEET_DRAG_THRESHOLD` | constant |
| `SHELL_COUNT_CAP` | constant |
| `ShellFooter` | component |
| `ShellFooterItem` | component |
| `ShellNavigation` | component |
| `ShellPrimaryActionOwner` | component |
| `ShellPrimaryActionSlot` | component |
| `Sidebar` | component |
| `SidebarGroup` | component |
| `SidebarItem` | component |
| `doneRouteProgress` | function |
| `findActiveNavKey` | function |
| `formatShellCount` | function |
| `parseShellState` | function |
| `serializeShellState` | function |
| `startRouteProgress` | function |
| `useSheetDrag` | hook |
| `useShellPrimaryAction` | hook |
| `useShellPrimaryActionState` | hook |

## API

### `AppShell`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `groups` | `readonly ShellNavGroup[]` | yes |  | The navigation, as data. It renders in the sidebar and again in the phone sheet. |
| `currentPath` | `string` | no |  | The path being shown: the matching item is current (`aria-current="page"`). |
| `isActive` | `(item: ShellNavItem) => boolean` | no |  | Takes over from `currentPath`. Return true for the current item. |
| `labels` | `AppShellLabels` | yes |  |  |
| `brand` | `Slot` | no |  | Brand or workspace switcher, at the top of the sidebar, the sheet and the phone top bar. A function gets the rail state. |
| `context` | `Slot` | no |  | Between the brand and the search, in the sidebar, and above the navigation in the sheet: the workspace, company or account the person is in, and a switcher for it. A function gets the surface (see `AppShellSlotState`), so a switcher can open as a dropdown in the sidebar and inline in the sheet. Rendered once per surface, so do not give its parts a fixed `id`. |
| `footer` | `Slot` | no |  | Bottom of the sidebar, and of the sheet: account, help and sign-out links. |
| `topBarEnd` | `ReactNode` | no |  | Right side of the phone top bar: a workspace chip, a status. |
| `search` | `AppShellSearch` | no |  | A search entry in the sidebar and on the floating bar. |
| `searchTrigger` | `Slot` | no |  | Replaces the sidebar's search entry with your own (a function gets the rail state). The floating bar's entry still comes from `search`. |
| `primaryAction` | `AppShellPrimaryAction` | no |  | The main action when no page registers its own with `useShellPrimaryAction`: on the floating bar, and in any `ShellPrimaryActionSlot`. |
| `desktopPrimaryFallback` | `boolean` | no | `true` | Whether wide screens show the shell's `primaryAction` in `ShellPrimaryActionSlot` while no page has registered its own. Default `true`. Set `false` when the default makes sense only on phones (the floating bar still shows it), so a hard load never flashes an action the page is about to replace or remove. |
| `menuData` | `FloatBarDataAttributes` | no |  | `data-*` attributes for the floating bar's menu button. |
| `navigationPending` | `ReactNode` | no |  | Shown in place of the navigation, in the sidebar and in the sheet, while the next route loads: a skeleton. The navigation landmarks are `aria-busy` meanwhile. Leave it out when the navigation is ready. |
| `topBar` | `ReactNode` | no |  | A bar above the page, beside the sidebar, at every width: a unit or context picker. |
| `statusRow` | `ReactNode` | no |  | A row between `topBar` and the page: sync state, a notice. Give it the live-region semantics it needs. |
| `sheetAs` | `"portal" \| "dialog"` | no | `"portal"` | `portal` (default) or a native `<dialog>` for the phone navigation sheet (`NavSheet` `renderAs`). |
| `sheetDragThreshold` | `SheetDragThreshold` | no |  | When a released drag dismisses the phone navigation sheet (`NavSheet` `dragThreshold`). Defaults unchanged. |
| `sheetProps` | `AppShellSheetProps` | no |  | A class and `data-*` attributes for the phone sheet's outermost layer (`NavSheet` `layerProps`), and where it mounts (`container`, default `document.body`). The sheet is portalled out of the shell, so a palette scoped to an app wrapper does not reach it: repeat the class or attribute here. Without them the sheet copies `data-lufia-theme` and `data-lufia-mode` from the closest ancestor of the shell that sets them. |
| `menuOpen` | `boolean` | no |  | The phone navigation sheet is open. Controlled: open it from your own control (a context chip in the top bar) and hear it close through `onMenuOpenChange`. Leave it out and the menu button drives it. |
| `onMenuOpenChange` | `(open: boolean) => void` | no |  |  |
| `hideSheetNavigation` | `boolean` | no | `false` | Hide the navigation inside the phone sheet and leave the `context` slot and footer: a switcher that takes over the sheet while it is open. The sidebar is not affected. |
| `collapsed` | `boolean` | no |  | Sidebar as a rail. Controlled. |
| `defaultCollapsed` | `boolean` | no | `false` |  |
| `onCollapsedChange` | `(collapsed: boolean) => void` | no |  |  |
| `openGroups` | `readonly string[]` | no |  | Keys of the open collapsible groups. Controlled; the owner then also decides what arriving on a page opens. |
| `defaultOpenGroups` | `readonly string[]` | no |  |  |
| `onOpenGroupsChange` | `(keys: readonly string[]) => void` | no |  |  |
| `fixedSidebar` | `boolean` | no | `false` | Hide the rail button. Default `false`. |
| `routeKey` | `string` | no |  | Identifies the page being shown, usually the pathname. When it changes, the page inside `<main>` enters with a short fade and rise (`RouteTransition`), the route progress bar finishes, and the navigation skeleton gives way. A search-param change or a refresh keeps the key and plays nothing; neither does the first load. Nothing remounts for it. Pass the pathname, not the query string. Wrapping the page adds one element around `children`. |
| `routePending` | `boolean` | no |  | A navigation to another route has started and the page is not there yet: drives a thin progress bar at the top of the window. Needs `routeKey`. The bar appears only when the wait outlasts 150 ms, so fast navigations do not flash, and, unless you pass this prop, a plain click on a link to another path starts it by itself. |
| `routeTrackLinks` | `boolean` | no |  | Let a plain click on a link to another path start the progress bar as well, alongside `routePending`: the bar then shows while either is in progress. Default: `true` without `routePending`, `false` with it (the app drives the bar alone). Set it `true` to drive query-string navigations through `routePending` and still track link clicks. `RouteProgress` `trackLinks`. |
| `routeTransitionProps` | `AppShellRouteTransitionProps` | no |  | A class and `data-*` attributes for the region that wraps the page and plays the route motion, so an app can hook its own entrance CSS (a stagger over the page's sections) onto the `data-route-enter` its children get. Needs `routeKey`. |
| `routeProgress` | `boolean` | no | `true` | Draw the progress bar when `routeKey` is given. Default `true`. |
| `routeProgressEvents` | `RouteProgressEvents` | no |  | The window events that start and end the progress bar from code (`RouteProgress` `events`). Default the ones `startRouteProgress()` and `doneRouteProgress()` dispatch. |
| `mainPending` | `ReactNode` | no |  | A skeleton shown in `<main>` in place of the page while a slow navigation loads. The page stays mounted but hidden, so its state and the providers around it survive, and `mainStart` stays visible. `<main>` is `aria-busy` meanwhile. Decide when to show it (most apps wait a few hundred milliseconds so fast navigations never flash one) and give it the shape of the page it stands in for. |
| `floatScrim` | `boolean` | no | `false` | Fade the page out behind the floating bar on phones, so content scrolling under it does not end in a hard edge. Default `false`: nothing is drawn unless asked for. |
| `mainProps` | `AppShellMainProps` | no |  | Attributes for the `<main>` the shell owns: `id` (the skip link follows it), `className`, `data-*`, `tabIndex`, ARIA. `className` is added to the shell's own. |
| `mainKey` | `Key` | no |  | Remounts the `<main>` and everything in it when it changes, as React's `key` does: a workspace or scope switch that must drop the page's state. Leave it out for a page change, which `children` handles. |
| `mainStart` | `ReactNode` | no |  | The first thing inside `<main>`, before `children`: banners that belong to the page area and scroll with it (a trial notice, a cookie or install hint). Unlike `topBar` and `statusRow`, which sit beside `<main>` and stay put, this remounts with `mainKey` and takes the page's padding. |
| `children` | `ReactNode` | yes |  | The page. The shell renders the one `<main>` landmark around it. |

Other native element attributes pass through to the root element.

### `MobileFloatBar`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `label` | `string` | yes |  | Accessible name of the bar. |
| `children` | `ReactNode` | yes |  | `MobileFloatBarButton` and `MobileFloatBarSeparator`, in reading order. |
| `followViewport` | `boolean` | no | `true` | Follow the visual viewport: when the on-screen keyboard or a browser toolbar covers the bottom of the page (iOS Safari keeps `position: fixed` on the layout viewport, behind them), the bar moves up above it, once per frame. Does nothing where `window.visualViewport` does not exist, and while the page is pinch-zoomed. Default `true`. |

Other native element attributes pass through to the root element.

### `MobileFloatBarButton`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `label` | `string` | yes |  | The accessible name. Shown as text on `search` and `primary`, hidden on `icon`. |
| `variant` | `"search" \| "primary" \| "icon"` | no | `"search"` | `search` is a wide, quiet button; `primary` is the filled pill for the page's main action; `icon` is round. |
| `icon` | `ReactNode` | no |  |  |
| `href` | `string` | no |  |  |
| `onClick` | `() => void` | no |  |  |

Other native element attributes pass through to the root element.

#### Variants

The props are a union of forms; `href` selects the form. Only the props that differ between forms are listed: a prop with the same type and requirement in every form is not repeated.

##### `href: undefined`

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `href` | `undefined` | no |  |
| `onClick` | `MouseEventHandler<HTMLButtonElement>` | no | Native attribute in this form. In every form; only its type differs. |
| `type` | `"button" \| "submit" \| "reset"` | no | Native attribute in this form. |

##### `href: string`

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `href` | `string` | yes |  |
| `onClick` | `() => void` | no | In every form; only its type differs. |

### `MobileFloatBarSeparator`, `ShellPrimaryActionOwner`

No props of its own.

### `NavSheet`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `open` | `boolean` | yes |  |  |
| `onOpenChange` | `(open: boolean) => void` | yes |  |  |
| `label` | `string` | yes |  | Accessible name of the dialog. |
| `header` | `ReactNode` | no |  | Next to the close button: a brand or a title. |
| `footer` | `ReactNode` | no |  | Below the scrolling body, pinned to the bottom: account and help links. |
| `closeLabel` | `string` | no |  | Accessible name of the close button. Defaults to the provider's `close` label. |
| `swipeToDismiss` | `boolean` | no | `true` | Let the grabber and header be dragged down to dismiss, and the body too while it is scrolled to the top. Default `true`. |
| `dragThreshold` | `SheetDragThreshold` | no |  | When a released drag dismisses the sheet: a share of its height kept between a shortest and a longest distance, or a quick flick. Each field you leave out keeps its default (`SHEET_DRAG_THRESHOLD`: 18% of the height, kept between 64 and 112 pixels; a flick of 0.6 px/ms over 24 pixels). Applies to the grabber, the header and the body alike. |
| `closeOnNavigate` | `boolean` | no | `false` | Close the sheet when a link inside it is followed (a plain click on an `<a href>` in the body or footer; not an open-in-new-tab click). `AppShell` turns it on so footer and slot links behave like the navigation's own. Default `false`. |
| `container` | `HTMLElement \| null` | no |  | Where the sheet is mounted. Defaults to `document.body`, so the rest of the page can be made inert. |
| `layerProps` | `NavSheetLayerProps` | no |  | A class and `data-*` attributes for the outermost layer: the fixed root that holds the backdrop and the panel, or the `<dialog>` with `renderAs="dialog"`. The sheet is portalled out of the app's tree, so a palette an app scopes to a class or a `data-*` attribute on its own wrapper does not reach it: put the same class or attribute here. The theme attributes `data-lufia-theme` and `data-lufia-mode` work too. |
| `inheritThemeFrom` | `RefObject<HTMLElement \| null>` | no |  | An element inside the app's tree (`AppShell` passes its `<main>`). While the sheet is shown, its layer copies `data-lufia-theme` and `data-lufia-mode` from the closest ancestor of that element that sets them (not from `<html>`, which already applies everywhere), so a theme or mode scoped to part of the page reaches the portalled sheet. Attributes given in `layerProps` win. |
| `renderAs` | `"portal" \| "dialog"` | no | `"portal"` | `portal` (default) renders a fixed-position layer in a portal, with an animated exit. `dialog` renders a native `<dialog>` opened with `showModal()`, so the sheet sits in the browser's top layer; the page behind is made inert by the browser, the backdrop is the native `::backdrop` and the exit is immediate. Focus trap, Escape, scroll lock, swipe to dismiss and the layer stack work the same in both. |
| `children` | `ReactNode` | yes |  |  |

Other native element attributes pass through to the root element.

### `RouteProgress`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `routeKey` | `string` | yes |  | Identifies the page being shown (the pathname). When it changes, the navigation has arrived and the bar finishes. `AppShell` passes its own `routeKey`. |
| `pending` | `boolean` | no |  | A navigation has started and not arrived. Set it from the router's pending state, or from your own click handler for a programmatic navigation (a query-string change the link tracking does not see). Going back to `false` without a new `routeKey` (a cancelled navigation) finishes the bar, unless a tracked link click is still on its way. When you pass it (even as `false`), link clicks stop starting the bar unless `trackLinks` is set explicitly. |
| `trackLinks` | `boolean` | no |  | Start on a plain click on a same-origin link that leads to another path (`<a href>`, which includes a router's links). Not for modified clicks, `target` other than `_self`, downloads, the current path or a link that only changes the query string or hash. A run started this way ends when `location.href` changes, when `routeKey` changes, or after 10 seconds, whichever comes first. Default `true` without `pending` and `false` with it; set it `true` together with `pending` and the bar shows while either is in progress. |
| `revealDelay` | `number` | no | `ROUTE_PROGRESS_REVEAL_DELAY_MS` | Milliseconds to wait before showing the bar. Default 150. |
| `events` | `RouteProgressEvents` | no | `DEFAULT_EVENTS` | The window events that start and end a run from code. Default `ROUTE_PROGRESS_START_EVENT` and `ROUTE_PROGRESS_DONE_EVENT`, which `startRouteProgress()` and `doneRouteProgress()` dispatch. Pass your own names when existing code (or an end-to-end test) already raises events of its own. A started run combines with `pending` and `trackLinks`: the bar shows while any of them is in progress. |
| `className` | `string` | no |  |  |

### `ShellFooter`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `aria-label` | `string` | yes |  | Defines a string value that labels the current element. Accessible name of the group ("Account and site"). |
| `children` | `ReactNode` | yes |  | `ShellFooterItem`s. |

Other native element attributes pass through to the root element.

### `ShellFooterItem`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `label` | `string` | yes |  | The name of the action. Visible beside the icon, kept as the accessible name and the tooltip in the rail. |
| `icon` | `ReactNode` | no |  | Decorative icon. Shown alone in the rail. |
| `href` | `string` | no |  | Makes the item a link, rendered through the configured `linkComponent`. Without it the item is a button. |
| `external` | `boolean` | no | `false` | Render a plain `<a>` that leaves the app (another site), not the router's link. Needs `href`. |
| `target` | `string` | no |  | Link target, with `href`. `_blank` also sets `rel="noopener noreferrer"` unless `rel` is given. |
| `rel` | `string` | no |  |  |
| `type` | `"button" \| "submit"` | no | `"button"` | Button type. Use `submit` inside a form (a sign-out form). Default `button`. |
| `active` | `boolean` | no | `false` | This is the current page: `aria-current="page"` and the active style. |
| `pending` | `boolean` | no | `false` | The action is running (signing out): dimmed, `aria-busy`, and further clicks are ignored. Focus stays put. |
| `disabled` | `boolean` | no | `false` |  |
| `count` | `number` | no |  | A number after the label (unread replies). Hidden at 0, "99+" above 99, on the icon in the rail. |
| `countTone` | `"neutral" \| "success" \| "warning" \| "danger"` | no | `"neutral"` |  |
| `ariaLabel` | `string` | no |  | Accessible name when it should add to the label ("Help, 2 unread"). Keep the visible label in it. |
| `pressed` | `boolean` | no |  | `pressed` makes it a toggle button (`aria-pressed`): theme, density. Buttons only. |
| `tone` | `"warning" \| "default"` | no | `"default"` | `warning` colours it as a caution (an admin area). |
| `onClick` | `(event: MouseEvent<HTMLElement, MouseEvent>) => void` | no |  |  |
| `className` | `string` | no |  |  |

### `ShellNavigation`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `groups` | `readonly ShellNavGroup[]` | yes |  |  |
| `currentPath` | `string` | no |  | The path being shown. Items whose `href` it equals or sits under are current. |
| `isActive` | `(item: ShellNavItem) => boolean` | no |  | Takes over from `currentPath`: return true for the current item. The first match wins. |
| `openGroups` | `readonly string[]` | yes |  | Keys of the open collapsible groups. |
| `onToggleGroup` | `(key: string, open: boolean) => void` | yes |  |  |
| `pendingKey` | `string` | no |  | Key of the item a click is heading to: it looks active before the page arrives, `aria-current` stays put. |
| `onItemChoose` | `(item: ShellNavItem) => void` | no |  | An item was chosen by a plain click or by keyboard (not an open-in-new-tab click). |

### `ShellPrimaryActionSlot`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `className` | `string` | no |  |  |

### `Sidebar`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `label` | `string` | yes |  | Accessible name of the navigation landmark inside the sidebar. |
| `collapsed` | `boolean` | no | `false` | Render as a rail: icons only. The parts keep their labels for assistive technology. |
| `onCollapsedChange` | `(collapsed: boolean) => void` | no |  | When given, a button in the header asks for the rail to open or close. |
| `collapseLabel` | `string` | no |  | Accessible name of that button while the sidebar is open ("Collapse sidebar"). |
| `expandLabel` | `string` | no |  | Accessible name of that button while it is a rail ("Expand sidebar"). |
| `busy` | `boolean` | no | `false` | The navigation is being replaced (a route is loading): `aria-busy` on the landmark. Pass the skeleton as `children`. |
| `header` | `ReactNode` | no |  | Above the navigation: a brand, an account or workspace switcher. |
| `context` | `ReactNode` | no |  | Between the header and the search: the workspace or account the person is in, with its switcher. |
| `search` | `ReactNode` | no |  | Between the header and the navigation: a search entry. |
| `footer` | `ReactNode` | no |  | Below the navigation, pinned to the bottom: account and help links. |
| `children` | `ReactNode` | yes |  | One or more `SidebarGroup`. |

Other native element attributes pass through to the root element.

### `SidebarGroup`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `label` | `string` | no |  | Heading of the group. Without one the group is a plain run of items. |
| `icon` | `ReactNode` | no |  | Icon of the disclosure button. |
| `collapsible` | `boolean` | no | `false` | Turns the heading into a button that shows and hides the items. Needs a `label`. |
| `open` | `boolean` | no |  | Controlled open state of a collapsible group. |
| `defaultOpen` | `boolean` | no | `true` | Initial open state when uncontrolled. Default `true`. |
| `onOpenChange` | `(open: boolean) => void` | no |  |  |
| `current` | `boolean` | no | `false` | The current page is inside this group. While the group is closed its button stands in for it. |
| `children` | `ReactNode` | yes |  | `SidebarItem`s. |

Other native element attributes pass through to the root element.

### `SidebarItem`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `label` | `string` | yes |  |  |
| `ariaLabel` | `string` | no |  | Accessible name when it should differ from the visible label. Keep the visible label in it (WCAG 2.5.3). |
| `href` | `string` | no |  | Makes the item a link, rendered through the configured `linkComponent`. |
| `icon` | `ReactNode` | no |  |  |
| `badge` | `ReactNode` | no |  | A short mark after the label, such as "New". For a number use `count`. |
| `badgeTone` | `"neutral" \| "success" \| "warning" \| "danger"` | no | `"warning"` | Colour of `badge`. Default `warning`. |
| `count` | `number` | no |  | A number after the label. Hidden at 0, and capped at `maxCount` ("99+"). In the rail it sits on the icon. |
| `countTone` | `"neutral" \| "success" \| "warning" \| "danger"` | no | `"neutral"` | Colour of `count`. Default `neutral`. |
| `maxCount` | `number` | no |  | Where `count` stops growing and shows a plus sign. Default 99. |
| `data` | `ShellDataAttributes` | no |  | `data-*` attributes on the link or button (analytics, guided tours, test ids). |
| `active` | `boolean` | no | `false` | This is the current page: `aria-current="page"` and the active style. |
| `highlighted` | `boolean` | no |  | Draw the active style without claiming the page: the item a click is heading to, before the page arrives. |
| `disabled` | `boolean` | no | `false` |  |
| `onClick` | `(event: MouseEvent<HTMLElement, MouseEvent>) => void` | no |  |  |
| `className` | `string` | no |  |  |
| `children` | `ReactNode` | no |  | Sub-items: `SidebarItem`s listed under this one, indented, one level deep. They are shown while `expanded` and never in the rail, where this item stands in for them. |
| `expanded` | `boolean` | no | `false` | Show the sub-items (`children`). They open and close with the `Collapse` motion. Default `false`. |
| `currentBranch` | `boolean` | no | `false` | One of the sub-items is the current page. In the rail, where they are hidden, this item takes the active style and `aria-current="true"`; elsewhere it is drawn as the open branch and the sub-item carries `aria-current="page"`. |
| `highlightedBranch` | `boolean` | no |  | Draw the branch as current without claiming it: a click is heading to one of the sub-items. |

### `doneRouteProgress`

Ends a run started by `startRouteProgress()` (a cancelled or failed navigation). The bar finishes unless `pending` or a tracked link click still keeps it going. Dispatches `ROUTE_PROGRESS_DONE_EVENT` on `window`; does nothing on the server.

```ts
doneRouteProgress(): void
```

### `findActiveNavKey`

The key of the item that `currentPath` belongs to, or `undefined`, sub-items included. Each item matches as its `match` says (see `ShellNavMatch`); when several match, the strongest claim wins, so two items are never current at once. With `isActive` the first item it returns true for wins, a sub-item before the item that holds it.

```ts
findActiveNavKey(groups: readonly ShellNavGroup[], currentPath: string | undefined, isActive?: ((item: ShellNavItem) => boolean) | undefined): string | undefined
```

### `formatShellCount`

The text of a count badge: `undefined` for nothing to show (not a number, zero or negative), the number itself up to `cap`, and `"99+"` (with the cap) above it.

```ts
formatShellCount(count: number | undefined, cap?: number): string | undefined
```

### `parseShellState`

Reads what `serializeShellState` wrote, on the server (from the request's cookie) or in the browser, and returns the values to hand to `defaultCollapsed` and `defaultOpenGroups` so the first paint is already right. A missing or malformed value gives the defaults: expanded, groups undecided. Safe in a React Server Component: import it from `@lufia/design-system/app-shell-state`.

```ts
parseShellState(raw: string | null | undefined): ShellState
```

### `serializeShellState`

Turns the person's sidebar choices into a short cookie value (`c=1&g=insights&g=admin`), for the app to store. The package never stores anything itself; see "Remembering the rail and the groups" in the docs. Pass `openGroups` as `undefined` to leave the groups to their defaults.

```ts
serializeShellState(state: ShellState): string
```

### `startRouteProgress`

Starts the route progress bar from code, for a navigation no link click or `pending` state describes (a `router.push` after a save, a search-param change). It dispatches `ROUTE_PROGRESS_START_EVENT` on `window`, so it works from anywhere, outside React too. The run ends on `doneRouteProgress()`, a `routeKey` change or the 10-second timeout. Does nothing on the server.

```ts
startRouteProgress(): void
```

### `useSheetDrag`

Swipe-down-to-dismiss for a bottom sheet, on pointer events. Spread the returned handlers on the drag zone only (the grabber and the header), never on the scrolling body: that keeps the list scrollable without any gesture arbitration. The zone needs `touch-action: none` so the browser does not claim the gesture for scrolling or pull-to-refresh. While dragging, the offset is written to the `--lufia-sheet-drag` custom property on the enclosing `[role="dialog"]` (or native `dialog`) and `data-dragging` is set on it; the panel's CSS turns that into a `transform`. A release past the threshold, or a quick flick, calls `onDismiss` (the sheet then slides the rest of the way out); anything shorter springs back. Escape and the close button remain the keyboard route, so the gesture is never the only way out. `threshold` changes when a release dismisses (see `SheetDragThreshold`); the defaults suit a navigation sheet.

```ts
useSheetDrag(onDismiss: () => void, enabled?: boolean, threshold?: SheetDragThreshold | undefined): { onPointerDown(event: PointerEvent<HTMLElement>): void; onPointerMove(event: PointerEvent<HTMLElement>): void; onPointerUp(event: PointerEvent<HTMLElement>): void; onPointerCancel(event: PointerEvent<HTMLElement>): void; }
```

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `onDismiss` | `() => void` | yes |  |
| `enabled` | `boolean` | no |  |
| `threshold` | `SheetDragThreshold` | no |  |

Returned members:

| Member | Type | Required | Description |
| --- | --- | --- | --- |
| `onPointerDown` | `(event: PointerEvent<HTMLElement>) => void` | yes |  |
| `onPointerMove` | `(event: PointerEvent<HTMLElement>) => void` | yes |  |
| `onPointerUp` | `(event: PointerEvent<HTMLElement>) => void` | yes |  |
| `onPointerCancel` | `(event: PointerEvent<HTMLElement>) => void` | yes |  |

### `useShellPrimaryAction`

Hands the page's one main action to the shell, which shows it on the floating bar (phones) and wherever a `ShellPrimaryActionSlot` sits (wide screens). Pass `null` to register nothing. When several pages are mounted at once the latest registration wins, and the previous one comes back when it unmounts. Returns whether a shell hosts the action. When it does, leave your own trigger out; outside a shell keep it. The shell re-registers when `label`, `href` or `description` change; `icon` and `data` are read at that moment, `onSelect` is always the latest. It registers before the browser paints, so a client navigation never shows the previous page's action; for the first server render, see `ShellPrimaryActionOwner`.

```ts
useShellPrimaryAction(action: AppShellPrimaryAction | null): boolean
```

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | `AppShellPrimaryAction \| null` | yes |  |

### `useShellPrimaryActionState`

Reads the shell's current primary action without registering one: to list it in a command palette, a keyboard shortcut or a help panel, in step with the floating bar. `null` outside a shell. `onSelect` and `onIntent` call the registering page's latest handlers.

```ts
useShellPrimaryActionState(): ShellPrimaryActionState | null
```

Returned members:

| Member | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | `AppShellPrimaryAction \| undefined` | yes | The latest registered action, else the shell's `primaryAction`; `undefined` when there is neither. |
| `isFallback` | `boolean` | yes | `action` is the shell's own default, because no page has registered one. |

## Types

- `AppShellLabels`: `{ skipToContent: string; navigation: string; menu: string; floatBar: string; collapseSidebar: string; expandSidebar: string; }`
- `AppShellMainProps`: `Omit<HTMLAttributes<HTMLElement>, "children"> & ShellDataAttributes`
- `AppShellPrimaryAction`: `{ label: string; description?: string | undefined; icon?: ReactNode; href?: string | undefined; onSelect?: (() => void) | undefined; onIntent?: (() => void) | undefined; data?: FloatBarDataAttributes | undefined; }`
- `AppShellRouteTransitionProps`: `{ className?: string | undefined; } & ShellDataAttributes`
- `AppShellSearch`: `{ label: string; onSelect: () => void; shortcut?: string | undefined; keyShortcuts?: string | undefined; opensDialog?: boolean | undefined; data?: FloatBarDataAttributes | undefined; }`
- `AppShellSheetProps`: `{ className?: string | undefined; container?: HTMLElement | null | undefined; } & ShellDataAttributes`
- `AppShellSlotState`: `{ collapsed: boolean; surface: "sidebar" | "sheet" | "topBar"; closeSheet: () => void; openSheet: () => void; }`
- `FloatBarDataAttributes`: `{ [name: 'data-${string}']: string | number | boolean | undefined; }`
- `MobileFloatBarProps`: `Omit<HTMLAttributes<HTMLDivElement>, "children"> & { label: string; children: ReactNode; followViewport?: boolean | undefined; }`
- `NavSheetLayerProps`: `{ className?: string | undefined; } & ShellDataAttributes`
- `RouteProgressEvents`: `{ start: string; done: string; }`
- `RouteProgressProps`: `{ routeKey: string; pending?: boolean | undefined; trackLinks?: boolean | undefined; revealDelay?: number | undefined; events?: RouteProgressEvents | undefined; className?: string | undefined; }`
- `SheetDragThreshold`: `{ ratio?: number | undefined; min?: number | undefined; max?: number | undefined; flickVelocity?: number | undefined; flickDistance?: number | undefined; }`
- `ShellBadgeTone`: `"neutral" | "success" | "warning" | "danger"`
- `ShellDataAttributes`: `{ [name: 'data-${string}']: string | number | boolean | undefined; }`
- `ShellFooterProps`: `Omit<HTMLAttributes<HTMLDivElement>, "children"> & { "aria-label": string; children: ReactNode; }`
- `ShellNavGroup`: `{ key: string; label?: string | undefined; icon?: ReactNode; items: readonly ShellNavItem[]; collapsible?: boolean | undefined; defaultOpen?: boolean | undefined; }`
- `ShellNavMatch`: `"prefix" | "exact" | "query" | ((currentPath: string, item: ShellNavItem) => boolean)`
- `ShellPrimaryActionState`: `{ action: AppShellPrimaryAction | undefined; isFallback: boolean; }`
- `ShellState`: `{ collapsed: boolean; openGroups: readonly string[] | undefined; }`

## Example

```tsx
import { AppShell } from "@lufia/design-system/components/AppShell";

<AppShell
  groups={[
    {
      key: "workspace",
      label: "Workspace",
      items: [
        { key: "home", label: "Overview", href: "/", icon: <HomeIcon />, exact: true },
        { key: "inbox", label: "Inbox", href: "/inbox", icon: <InboxIcon />, badge: 3 },
      ],
    },
    {
      key: "insights",
      label: "Insights",
      collapsible: true,
      items: [{ key: "reports", label: "Reports", href: "/insights/reports" }],
    },
  ]}
  currentPath={pathname}
  labels={{
    skipToContent: "Skip to content",
    navigation: "Main navigation",
    menu: "Menu",
    floatBar: "Quick navigation",
    collapseSidebar: "Collapse sidebar",
    expandSidebar: "Expand sidebar",
  }}
  brand={({ collapsed }) => <Logo compact={collapsed} />}
  footer={<AccountLinks />}
  search={{ label: "Search…", shortcut: "Ctrl K", onSelect: openPalette }}
  primaryAction={{ label: "New item", icon: <PlusIcon />, onSelect: createItem }}
>
  <PageContent />
</AppShell>;
```

## Accessibility

Keyboard:

| Key | Action |
| --- | --- |
| Tab / Shift+Tab | Everywhere \| Moves through the skip link, the sidebar and the page in order |
| Enter | Link \| Follows it |
| Enter / Space | Button, group head \| Activates it; a group head toggles `aria-expanded` |
| Escape | Sheet \| Closes it; focus returns to the menu button |
| Tab / Shift+Tab | Sheet \| Cycle inside the sheet; the page behind is inert |

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thick`, `--lufia-border-width-thin`, `--lufia-color-bg-canvas`, `--lufia-color-bg-surface-raised`, `--lufia-color-bg-surface-solid`, `--lufia-color-border-strong`, `--lufia-color-border-subtle`, `--lufia-color-focus-ring`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-color-text-subtle`, `--lufia-font-family-mono`, `--lufia-font-size-2xs`, `--lufia-font-size-sm`, `--lufia-radius-control`, `--lufia-radius-xs`, `--lufia-shadow-md`, `--lufia-shell-sidebar-width`, `--lufia-space-1`, `--lufia-space-2`, `--lufia-space-3`, `--lufia-space-4`, `--lufia-space-8`, `--lufia-z-sticky`, `--lufia-z-toast`.

## Content guidelines

Item labels are one or two words. Put the rarely used areas in a collapsible group and the one thing the page is for in
`primaryAction`. The search label is a verb phrase ("Search…").

## Stories

- `components-navigation-appshell--desktop`
- `components-navigation-appshell--rail`
- `components-navigation-appshell--group-open-on-arrival`
- `components-navigation-appshell--phone`
- `components-navigation-appshell--small-phone`
- `components-navigation-appshell--tablet`
- `components-navigation-appshell--phone-without-primary-action`
- `components-navigation-appshell--right-to-left`
- `components-navigation-appshell--custom-slots`
- `components-navigation-appshell--top-bar-and-status-row`
- `components-navigation-appshell--navigation-pending`
- `components-navigation-appshell--custom-search-trigger`
- `components-navigation-appshell--static-headings`
- `components-navigation-appshell--float-bar-data-attributes`
- `components-navigation-appshell--native-dialog-sheet`
- `components-navigation-appshell--sheet-in-scoped-dark-mode`
- `components-navigation-appshell--registered-primary-action`
- `components-navigation-appshell--counts-and-badges`
- `components-navigation-appshell--footer`
- `components-navigation-appshell--footer-in-rail`
- `components-navigation-appshell--main-slots`
- `components-navigation-appshell--context-slot`
- `components-navigation-appshell--controlled-sheet-with-switcher`
- `components-navigation-appshell--route-motion-and-pending`
- `components-navigation-appshell--route-progress-from-code`
- `components-navigation-appshell--primary-action-in-palette`
- `components-navigation-appshell--primary-action-owner-mark`
- `components-navigation-appshell--primary-action-fallback-on-phones-only`
- `components-navigation-appshell--nested-navigation`
- `components-navigation-appshell--nested-navigation-rail`
- `components-navigation-appshell--nested-navigation-phone`
- `components-navigation-appshell--staggered-route-entrance`
