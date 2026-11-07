# AppShell

> The application frame: sidebar, content area and the phone navigation sheet.

- Status: beta
- Category: Navigation
- Import: `import { APP_SHELL_BREAKPOINT, AppShell, MobileFloatBar, MobileFloatBarButton, MobileFloatBarSeparator, NavSheet, ShellNavigation, ShellPrimaryActionSlot, Sidebar, SidebarGroup, SidebarItem, findActiveNavKey, useSheetDrag, useShellPrimaryAction } from "@lufia/design-system/components/AppShell"`
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
| `ShellNavigation` | component |
| `ShellPrimaryActionSlot` | component |
| `Sidebar` | component |
| `SidebarGroup` | component |
| `SidebarItem` | component |
| `findActiveNavKey` | function |
| `useSheetDrag` | hook |
| `useShellPrimaryAction` | hook |

## API

### `AppShell`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `groups` | `readonly ShellNavGroup[]` | yes |  | The navigation, as data. It renders in the sidebar and again in the phone sheet. |
| `currentPath` | `string` | no |  | The path being shown: the matching item is current (`aria-current="page"`). |
| `isActive` | `((item: ShellNavItem) => boolean)` | no |  | Takes over from `currentPath`. Return true for the current item. |
| `labels` | `AppShellLabels` | yes |  |  |
| `brand` | `Slot` | no |  | Brand or workspace switcher, at the top of the sidebar, the sheet and the phone top bar. A function gets the rail state. |
| `footer` | `Slot` | no |  | Bottom of the sidebar, and of the sheet: account, help and sign-out links. |
| `topBarEnd` | `ReactNode` | no |  | Right side of the phone top bar: a workspace chip, a status. |
| `search` | `AppShellSearch` | no |  | A search entry in the sidebar and on the floating bar. |
| `searchTrigger` | `Slot` | no |  | Replaces the sidebar's search entry with your own (a function gets the rail state). The floating bar's entry still comes from `search`. |
| `primaryAction` | `AppShellPrimaryAction` | no |  | The main action when no page registers its own with `useShellPrimaryAction`: on the floating bar, and in any `ShellPrimaryActionSlot`. |
| `menuData` | `FloatBarDataAttributes` | no |  | `data-*` attributes for the floating bar's menu button. |
| `navigationPending` | `ReactNode` | no |  | Shown in place of the navigation, in the sidebar and in the sheet, while the next route loads: a skeleton. The navigation landmarks are `aria-busy` meanwhile. Leave it out when the navigation is ready. |
| `topBar` | `ReactNode` | no |  | A bar above the page, beside the sidebar, at every width: a unit or context picker. |
| `statusRow` | `ReactNode` | no |  | A row between `topBar` and the page: sync state, a notice. Give it the live-region semantics it needs. |
| `sheetAs` | `"portal" \| "dialog"` | no | `"portal"` | `portal` (default) or a native `<dialog>` for the phone navigation sheet (`NavSheet` `renderAs`). |
| `collapsed` | `boolean` | no |  | Sidebar as a rail. Controlled. |
| `defaultCollapsed` | `boolean` | no | `false` |  |
| `onCollapsedChange` | `((collapsed: boolean) => void)` | no |  |  |
| `openGroups` | `readonly string[]` | no |  | Keys of the open collapsible groups. Controlled; the owner then also decides what arriving on a page opens. |
| `defaultOpenGroups` | `readonly string[]` | no |  |  |
| `onOpenGroupsChange` | `((keys: readonly string[]) => void)` | no |  |  |
| `fixedSidebar` | `boolean` | no | `false` | Hide the rail button. Default `false`. |
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
| `onClick` | `(() => void)` | no |  |  |

Other native element attributes pass through to the root element.

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
| `swipeToDismiss` | `boolean` | no | `true` | Let the grabber and header be dragged down to dismiss. Default `true`. |
| `container` | `HTMLElement \| null` | no |  | Where the sheet is mounted. Defaults to `document.body`, so the rest of the page can be made inert. |
| `renderAs` | `"portal" \| "dialog"` | no | `"portal"` | `portal` (default) renders a fixed-position layer in a portal, with an animated exit. `dialog` renders a native `<dialog>` opened with `showModal()`, so the sheet sits in the browser's top layer; the page behind is made inert by the browser, the backdrop is the native `::backdrop` and the exit is immediate. Focus trap, Escape, scroll lock, swipe to dismiss and the layer stack work the same in both. |
| `children` | `ReactNode` | yes |  |  |

Other native element attributes pass through to the root element.

### `ShellNavigation`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `groups` | `readonly ShellNavGroup[]` | yes |  |  |
| `currentPath` | `string` | no |  | The path being shown. Items whose `href` it equals or sits under are current. |
| `isActive` | `((item: ShellNavItem) => boolean)` | no |  | Takes over from `currentPath`: return true for the current item. The first match wins. |
| `openGroups` | `readonly string[]` | yes |  | Keys of the open collapsible groups. |
| `onToggleGroup` | `(key: string, open: boolean) => void` | yes |  |  |
| `pendingKey` | `string` | no |  | Key of the item a click is heading to: it looks active before the page arrives, `aria-current` stays put. |
| `onItemChoose` | `((item: ShellNavItem) => void)` | no |  | An item was chosen by a plain click or by keyboard (not an open-in-new-tab click). |

### `ShellPrimaryActionSlot`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `className` | `string` | no |  |  |

### `Sidebar`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `label` | `string` | yes |  | Accessible name of the navigation landmark inside the sidebar. |
| `collapsed` | `boolean` | no | `false` | Render as a rail: icons only. The parts keep their labels for assistive technology. |
| `onCollapsedChange` | `((collapsed: boolean) => void)` | no |  | When given, a button in the header asks for the rail to open or close. |
| `collapseLabel` | `string` | no |  | Accessible name of that button while the sidebar is open ("Collapse sidebar"). |
| `expandLabel` | `string` | no |  | Accessible name of that button while it is a rail ("Expand sidebar"). |
| `busy` | `boolean` | no | `false` | The navigation is being replaced (a route is loading): `aria-busy` on the landmark. Pass the skeleton as `children`. |
| `header` | `ReactNode` | no |  | Above the navigation: a brand, an account or workspace switcher. |
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
| `onOpenChange` | `((open: boolean) => void)` | no |  |  |
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
| `badge` | `ReactNode` | no |  |  |
| `active` | `boolean` | no | `false` | This is the current page: `aria-current="page"` and the active style. |
| `highlighted` | `boolean` | no |  | Draw the active style without claiming the page: the item a click is heading to, before the page arrives. |
| `disabled` | `boolean` | no | `false` |  |
| `onClick` | `((event: MouseEvent<HTMLElement, MouseEvent>) => void)` | no |  |  |
| `className` | `string` | no |  |  |

### `findActiveNavKey`

The key of the item that `currentPath` belongs to, or `undefined`. A path belongs to an item when it is equal to the item's `href` or below it (`/settings/billing` belongs to `/settings`); when several match, the most specific wins, so two items are never current at once. `exact` items match only themselves. Query strings and hashes are ignored.

```ts
findActiveNavKey(groups: readonly ShellNavGroup[], currentPath: string | undefined, isActive?: ((item: ShellNavItem) => boolean) | undefined): string | undefined
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
- `AppShellPrimaryAction`: `{ label: string; icon?: ReactNode; href?: string | undefined; onSelect?: (() => void) | undefined; data?: FloatBarDataAttributes | undefined; }`
- `AppShellSearch`: `{ label: string; onSelect: () => void; shortcut?: string | undefined; keyShortcuts?: string | undefined; opensDialog?: boolean | undefined; data?: FloatBarDataAttributes | undefined; }`
- `FloatBarDataAttributes`: `{ [name: 'data-${string}']: string | number | boolean | undefined; }`
- `MobileFloatBarProps`: `Omit<HTMLAttributes<HTMLDivElement>, "children"> & { label: string; children: ReactNode; }`
- `ShellNavGroup`: `{ key: string; label?: string | undefined; icon?: ReactNode; items: readonly ShellNavItem[]; collapsible?: boolean | undefined; defaultOpen?: boolean | undefined; }`
- `ShellNavItem`: `{ key: string; label: string; href?: string | undefined; icon?: ReactNode; badge?: ReactNode; disabled?: boolean | undefined; ariaLabel?: string | undefined; exact?: boolean | undefined; onSelect?: (() => void) | undefined; }`

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
