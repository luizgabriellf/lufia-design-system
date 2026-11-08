# AppShell

> The application frame: sidebar, content area and the phone navigation sheet.

- Status: beta
- Category: Navigation
- Import: `import { APP_SHELL_BREAKPOINT, AppShell, MobileFloatBar, MobileFloatBarButton, MobileFloatBarSeparator, NavSheet, RouteProgress, SHELL_COUNT_CAP, ShellFooter, ShellFooterItem, ShellNavigation, ShellPrimaryActionSlot, Sidebar, SidebarGroup, SidebarItem, findActiveNavKey, formatShellCount, parseShellState, serializeShellState, useSheetDrag, useShellPrimaryAction } from "@lufia/design-system/components/AppShell"`
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
| `RouteProgress` | component |
| `SHELL_COUNT_CAP` | constant |
| `ShellFooter` | component |
| `ShellFooterItem` | component |
| `ShellNavigation` | component |
| `ShellPrimaryActionSlot` | component |
| `Sidebar` | component |
| `SidebarGroup` | component |
| `SidebarItem` | component |
| `findActiveNavKey` | function |
| `formatShellCount` | function |
| `parseShellState` | function |
| `serializeShellState` | function |
| `useSheetDrag` | hook |
| `useShellPrimaryAction` | hook |

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
| `routeProgress` | `boolean` | no | `true` | Draw the progress bar when `routeKey` is given. Default `true`. |
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

### `MobileFloatBarSeparator`

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
| `closeOnNavigate` | `boolean` | no | `false` | Close the sheet when a link inside it is followed (a plain click on an `<a href>` in the body or footer; not an open-in-new-tab click). `AppShell` turns it on so footer and slot links behave like the navigation's own. Default `false`. |
| `container` | `HTMLElement \| null` | no |  | Where the sheet is mounted. Defaults to `document.body`, so the rest of the page can be made inert. |
| `renderAs` | `"portal" \| "dialog"` | no | `"portal"` | `portal` (default) renders a fixed-position layer in a portal, with an animated exit. `dialog` renders a native `<dialog>` opened with `showModal()`, so the sheet sits in the browser's top layer; the page behind is made inert by the browser, the backdrop is the native `::backdrop` and the exit is immediate. Focus trap, Escape, scroll lock, swipe to dismiss and the layer stack work the same in both. |
| `children` | `ReactNode` | yes |  |  |

Other native element attributes pass through to the root element.

### `RouteProgress`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `routeKey` | `string` | yes |  | Identifies the page being shown (the pathname). When it changes, the navigation has arrived and the bar finishes. `AppShell` passes its own `routeKey`. |
| `pending` | `boolean` | no |  | A navigation has started and not arrived. Set it from the router's pending state, or from your own click handler for a programmatic navigation. Going back to `false` without a new `routeKey` (a cancelled navigation) finishes the bar. When you pass it (even as `false`) the app is in charge, and link clicks no longer start the bar by themselves. |
| `trackLinks` | `boolean` | no | `true` | Without `pending`, also start on a plain click on a same-origin link that leads to another path (`<a href>`, which includes a router's links). Not for modified clicks, `target` other than `_self`, downloads, the current path or a link that only changes the query string or hash. A run started this way ends when `location.href` changes, when `routeKey` changes, or after 10 seconds, whichever comes first. Default `true`. |
| `revealDelay` | `number` | no | `ROUTE_PROGRESS_REVEAL_DELAY_MS` | Milliseconds to wait before showing the bar. Default 150. |
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
| `countTone` | `"neutral" \| "warning" \| "danger"` | no | `"neutral"` |  |
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
| `badgeTone` | `"neutral" \| "warning" \| "danger"` | no | `"warning"` | Colour of `badge`. Default `warning`. |
| `count` | `number` | no |  | A number after the label. Hidden at 0, and capped at `maxCount` ("99+"). In the rail it sits on the icon. |
| `countTone` | `"neutral" \| "warning" \| "danger"` | no | `"neutral"` | Colour of `count`. Default `neutral`. |
| `maxCount` | `number` | no |  | Where `count` stops growing and shows a plus sign. Default 99. |
| `data` | `ShellDataAttributes` | no |  | `data-*` attributes on the link or button (analytics, guided tours, test ids). |
| `active` | `boolean` | no | `false` | This is the current page: `aria-current="page"` and the active style. |
| `highlighted` | `boolean` | no |  | Draw the active style without claiming the page: the item a click is heading to, before the page arrives. |
| `disabled` | `boolean` | no | `false` |  |
| `onClick` | `(event: MouseEvent<HTMLElement, MouseEvent>) => void` | no |  |  |
| `className` | `string` | no |  |  |

### `findActiveNavKey`

The key of the item that `currentPath` belongs to, or `undefined`. A path belongs to an item when it is equal to the item's `href` or below it (`/settings/billing` belongs to `/settings`); when several match, the most specific wins, so two items are never current at once. `exact` items match only themselves. Query strings and hashes are ignored.

```ts
findActiveNavKey(groups: readonly ShellNavGroup[], currentPath: string | undefined, isActive?: ((item: ShellNavItem) => boolean) | undefined): string | undefined
```

### `formatShellCount`

The text of a count badge: `undefined` for nothing to show (not a number, zero or negative), the number itself up to `cap`, and `"99+"` (with the cap) above it.

```ts
formatShellCount(count: number | undefined, cap?: number): string | undefined
```

### `parseShellState`

Reads what `serializeShellState` wrote, on the server (from the request's cookie) or in the browser, and returns the values to hand to `defaultCollapsed` and `defaultOpenGroups` so the first paint is already right. A missing or malformed value gives the defaults: expanded, groups undecided.

```ts
parseShellState(raw: string | null | undefined): ShellState
```

### `serializeShellState`

Turns the person's sidebar choices into a short cookie value (`c=1&g=insights&g=admin`), for the app to store. The package never stores anything itself; see "Remembering the rail and the groups" in the docs. Pass `openGroups` as `undefined` to leave the groups to their defaults.

```ts
serializeShellState(state: ShellState): string
```

### `useSheetDrag`

Swipe-down-to-dismiss for a bottom sheet, on pointer events. Spread the returned handlers on the drag zone only (the grabber and the header), never on the scrolling body: that keeps the list scrollable without any gesture arbitration. The zone needs `touch-action: none` so the browser does not claim the gesture for scrolling or pull-to-refresh. While dragging, the offset is written to the `--lufia-sheet-drag` custom property on the enclosing `[role="dialog"]` (or native `dialog`) and `data-dragging` is set on it; the panel's CSS turns that into a `transform`. A release past the threshold, or a quick flick, calls `onDismiss` (the sheet then slides the rest of the way out); anything shorter springs back. Escape and the close button remain the keyboard route, so the gesture is never the only way out.

```ts
useSheetDrag(onDismiss: () => void, enabled?: boolean): { onPointerDown(event: PointerEvent<HTMLElement>): void; onPointerMove(event: PointerEvent<HTMLElement>): void; onPointerUp(event: PointerEvent<HTMLElement>): void; onPointerCancel(event: PointerEvent<HTMLElement>): void; }
```

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `onDismiss` | `() => void` | yes |  |
| `enabled` | `boolean` | no |  |

Returned members:

| Member | Type | Required | Description |
| --- | --- | --- | --- |
| `onPointerDown` | `(event: PointerEvent<HTMLElement>) => void` | yes |  |
| `onPointerMove` | `(event: PointerEvent<HTMLElement>) => void` | yes |  |
| `onPointerUp` | `(event: PointerEvent<HTMLElement>) => void` | yes |  |
| `onPointerCancel` | `(event: PointerEvent<HTMLElement>) => void` | yes |  |

### `useShellPrimaryAction`

Hands the page's one main action to the shell, which shows it on the floating bar (phones) and wherever a `ShellPrimaryActionSlot` sits (wide screens). Pass `null` to register nothing. When several pages are mounted at once the latest registration wins, and the previous one comes back when it unmounts. Returns whether a shell hosts the action. When it does, leave your own trigger out; outside a shell keep it. The shell re-registers when `label` or `href` change; `icon` and `data` are read at that moment, `onSelect` is always the latest.

```ts
useShellPrimaryAction(action: AppShellPrimaryAction | null): boolean
```

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | `AppShellPrimaryAction \| null` | yes |  |

## Types

- `AppShellLabels`: `{ skipToContent: string; navigation: string; menu: string; floatBar: string; collapseSidebar: string; expandSidebar: string; }`
- `AppShellMainProps`: `Omit<HTMLAttributes<HTMLElement>, "children"> & ShellDataAttributes`
- `AppShellPrimaryAction`: `{ label: string; icon?: ReactNode; href?: string | undefined; onSelect?: (() => void) | undefined; onIntent?: (() => void) | undefined; data?: FloatBarDataAttributes | undefined; }`
- `AppShellSearch`: `{ label: string; onSelect: () => void; shortcut?: string | undefined; keyShortcuts?: string | undefined; opensDialog?: boolean | undefined; data?: FloatBarDataAttributes | undefined; }`
- `AppShellSlotState`: `{ collapsed: boolean; surface: "sidebar" | "sheet" | "topBar"; closeSheet: () => void; openSheet: () => void; }`
- `FloatBarDataAttributes`: `{ [name: 'data-${string}']: string | number | boolean | undefined; }`
- `MobileFloatBarProps`: `Omit<HTMLAttributes<HTMLDivElement>, "children"> & { label: string; children: ReactNode; }`
- `RouteProgressProps`: `{ routeKey: string; pending?: boolean | undefined; trackLinks?: boolean | undefined; revealDelay?: number | undefined; className?: string | undefined; }`
- `ShellBadgeTone`: `"neutral" | "warning" | "danger"`
- `ShellDataAttributes`: `{ [name: 'data-${string}']: string | number | boolean | undefined; }`
- `ShellFooterProps`: `Omit<HTMLAttributes<HTMLDivElement>, "children"> & { "aria-label": string; children: ReactNode; }`
- `ShellNavGroup`: `{ key: string; label?: string | undefined; icon?: ReactNode; items: readonly ShellNavItem[]; collapsible?: boolean | undefined; defaultOpen?: boolean | undefined; }`
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
- `components-navigation-appshell--registered-primary-action`
- `components-navigation-appshell--counts-and-badges`
- `components-navigation-appshell--footer`
- `components-navigation-appshell--footer-in-rail`
- `components-navigation-appshell--main-slots`
- `components-navigation-appshell--context-slot`
- `components-navigation-appshell--controlled-sheet-with-switcher`
- `components-navigation-appshell--route-motion-and-pending`
- `components-navigation-appshell--primary-action-fallback-on-phones-only`
