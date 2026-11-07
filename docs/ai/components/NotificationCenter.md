# NotificationCenter

> A bell with an unread count that opens a panel of notifications: a popover on wide pages, a sheet on narrow ones.

- Status: beta
- Category: Overlays
- Import: `import { NotificationCenter, NotificationPanel, NotificationSummary } from "@lufia/design-system/components/NotificationCenter"`
- Also from: `@lufia/design-system`
- Source: [src/components/NotificationCenter](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/NotificationCenter)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-overlays-notificationcenter--docs)

## Purpose

A bell button with an unread count that opens a panel of notifications. On wide pages the panel hangs from the bell as a
non-modal popover; below 60rem it is a modal bottom sheet. The data and every string come from the caller: the package has
no i18n and no data layer.

## When to use

- A feed of things that happened or need a decision, with an unread state, reachable from anywhere in an app.

## When not to use

- A single transient confirmation: use `Toast`.
- Blocking questions: use `Modal` or `ConfirmDialog`.
- A page-length activity log with no unread state: use `ActivityList`.

## Exports

| Name | Kind |
| --- | --- |
| `NotificationCenter` | component |
| `NotificationPanel` | component |
| `NotificationSummary` | component |

## API

### `NotificationCenter`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `label` | `string` | yes |  | The panel's heading and, on a landmark panel, its accessible name ("Notifications"). |
| `unreadCount` | `number` | yes |  | How many notifications are unread, across every tab. Drives the badge, "Mark all as read" and the live region. |
| `unreadLabel` | `string` | yes |  | Read before the title of an unread row, so the state is not carried by the dot alone ("unread"). |
| `unreadCountLabel` | `(count: number) => string` | yes |  | Says a count in words ("4 unread"). Used for the hidden text of the badge and the live region. |
| `tabs` | `readonly NotificationTab[]` | no |  | The tabs, in order. Without them the panel is one list. Tabs are the caller's: "All", "Approvals", "Stock". |
| `activeTab` | `string` | no |  | Key of the chosen tab. Controlled. |
| `defaultActiveTab` | `string` | no |  | Initial tab when `activeTab` is not given. Defaults to the first. |
| `onTabChange` | `(key: string) => void` | no |  | Called with the key of the tab the person chose. |
| `items` | `readonly NotificationItem[]` | yes |  | Every notification, newest first. Tabs and groups pick from this one list. |
| `groups` | `readonly NotificationGroup[]` | no |  | The headings, in order. Items are placed by `NotificationItem.group`. Without groups the list has no headings. |
| `summary` | `ReactNode` | no |  | A highlight above the list, usually a `NotificationSummary`. It shows under every tab. |
| `onMarkAllRead` | `() => void` | no |  | Runs when "Mark all as read" is pressed. The button shows when this and `markAllLabel` are set. |
| `markAllLabel` | `string` | no |  | Text of the mark-all action ("Mark all as read"). |
| `footer` | `NotificationFooter` | no |  | The link or button at the bottom ("Notification settings"), with a chevron. |
| `loading` | `boolean` | no |  | Shows skeleton rows in place of the list. |
| `loadingLabel` | `string` | no |  | Name of the loading state, read once as a polite status ("Loading notifications"). |
| `empty` | `NotificationEmpty` | no |  | What to show when the chosen tab has no items. A tab's own `empty` wins. |
| `error` | `ReactNode` | no |  | Replaces the list when loading failed. It is announced as an alert; include the way to retry. |
| `open` | `boolean` | no |  | Open state. Controlled: pair it with `onOpenChange`. |
| `defaultOpen` | `boolean` | no | `false` | Initial open state when `open` is not given. For documentation and tests; people open it themselves. |
| `onOpenChange` | `(open: boolean) => void` | no |  |  |
| `presentation` | `"popover" \| "auto" \| "sheet"` | no | `"auto"` | How the open panel is shown. `"popover"` hangs it from the bell as a non-modal dialog. `"sheet"` shows it as a modal bottom sheet over a backdrop that covers the page. `"auto"` (default) is a sheet below 60rem (the `medium` breakpoint) and a popover from there up. |
| `align` | `"end" \| "start"` | no | `"end"` | Which edge of the bell the popover lines up with. Defaults to the end. |
| `size` | `"sm" \| "md" \| "lg"` | no | `"md"` |  |
| `variant` | `"primary" \| "secondary" \| "ghost" \| "danger"` | no | `"ghost"` |  |
| `icon` | `ReactNode` | no |  | Replaces the default bell icon. |
| `maxCount` | `number` | no | `99` | Counts above this show as "99+". Default 99. |

Other native element attributes pass through to the root element.

### `NotificationPanel`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `label` | `string` | yes |  | The panel's heading and, on a landmark panel, its accessible name ("Notifications"). |
| `unreadCount` | `number` | yes |  | How many notifications are unread, across every tab. Drives the badge, "Mark all as read" and the live region. |
| `unreadLabel` | `string` | yes |  | Read before the title of an unread row, so the state is not carried by the dot alone ("unread"). |
| `unreadCountLabel` | `(count: number) => string` | yes |  | Says a count in words ("4 unread"). Used for the hidden text of the badge and the live region. |
| `tabs` | `readonly NotificationTab[]` | no |  | The tabs, in order. Without them the panel is one list. Tabs are the caller's: "All", "Approvals", "Stock". |
| `activeTab` | `string` | no |  | Key of the chosen tab. Controlled. |
| `defaultActiveTab` | `string` | no |  | Initial tab when `activeTab` is not given. Defaults to the first. |
| `onTabChange` | `(key: string) => void` | no |  | Called with the key of the tab the person chose. |
| `items` | `readonly NotificationItem[]` | yes |  | Every notification, newest first. Tabs and groups pick from this one list. |
| `groups` | `readonly NotificationGroup[]` | no |  | The headings, in order. Items are placed by `NotificationItem.group`. Without groups the list has no headings. |
| `summary` | `ReactNode` | no |  | A highlight above the list, usually a `NotificationSummary`. It shows under every tab. |
| `onMarkAllRead` | `() => void` | no |  | Runs when "Mark all as read" is pressed. The button shows when this and `markAllLabel` are set. |
| `markAllLabel` | `string` | no |  | Text of the mark-all action ("Mark all as read"). |
| `footer` | `NotificationFooter` | no |  | The link or button at the bottom ("Notification settings"), with a chevron. |
| `loading` | `boolean` | no | `false` | Shows skeleton rows in place of the list. |
| `loadingLabel` | `string` | no |  | Name of the loading state, read once as a polite status ("Loading notifications"). |
| `empty` | `NotificationEmpty` | no |  | What to show when the chosen tab has no items. A tab's own `empty` wins. |
| `error` | `ReactNode` | no |  | Replaces the list when loading failed. It is announced as an alert; include the way to retry. |
| `onClose` | `() => void` | no |  | Adds a close button to the header, for a panel shown as a sheet. |
| `onAction` | `(run: () => void) => void` | no |  | Receives what a row, the footer or the summary's action is about to do, so a host can close itself first and run it once focus is back where it belongs. Omit it and the action runs at once. |
| `titleId` | `string` | no |  | Id of the heading, for a host that names its dialog with it. Generated when omitted. |
| `landmark` | `boolean` | no | `true` | Whether the root is a labelled region (`<section>`). Default `true`. A host that already names the panel, such as the dialog of `NotificationCenter`, sets `false` to get a plain element. |
| `announce` | `boolean` | no | `true` | Renders the polite live region that announces changes of `unreadCount`. Default `true`; a host that has its own turns it off. |
| `ref` | `Ref<HTMLElement>` | no |  |  |

Other native element attributes pass through to the root element.

### `NotificationSummary`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `title` | `string` | yes |  | The headline ("2 proposals due today"). |
| `description` | `string` | no |  | One line under the headline. |
| `progress` | `{ done: number; total: number; label: string; valueText?: string \| undefined; }` | no |  | A segmented bar: `done` of `total` segments are filled. It is a native `progressbar`, so `label` names it. |
| `action` | `{ label: string; href?: string \| undefined; onSelect?: (() => void) \| undefined; }` | no |  | The one primary action: a link with `href`, a button otherwise. |
| `footnote` | `string` | no |  | Small print under the action ("2 due today · 6 later this week"). |

Other native element attributes pass through to the root element.

## Types

- `NotificationEmpty`: `{ title: string; description?: string | undefined; icon?: ReactNode; action?: ReactNode; }`
- `NotificationFooter`: `{ label: string; href?: string | undefined; onSelect?: (() => void) | undefined; }`
- `NotificationGroup`: `{ key: string; label: string; }`
- `NotificationItem`: `{ id: string; group?: string | undefined; tab?: string | undefined; title: string; meta?: ReactNode; time?: ReactNode; icon?: ReactNode; avatar?: ReactNode; unread?: boolean | undefined; href?: string | undefined; onSelect?: (() => void) | undefined; }`
- `NotificationTab`: `{ key: string; label: string; count?: number | undefined; all?: boolean | undefined; empty?: NotificationEmpty | undefined; }`

## Example

```tsx
import { NotificationCenter, NotificationSummary } from "@lufia/design-system/components/NotificationCenter";

<NotificationCenter
  label="Notifications"
  unreadCount={5}
  unreadLabel="unread"
  unreadCountLabel={(count) => `${count} unread`}
  tabs={[
    { key: "all", label: "All", count: 8, all: true },
    { key: "approvals", label: "Approvals", count: 5 },
  ]}
  groups={[
    { key: "today", label: "Today" },
    { key: "earlier", label: "Earlier" },
  ]}
  items={[
    {
      id: "1",
      group: "today",
      tab: "approvals",
      title: "Supplier proposal needs your review",
      meta: "Procurement assistant",
      time: "07:52",
      unread: true,
      href: "/proposals/1",
    },
  ]}
  summary={
    <NotificationSummary title="2 proposals due today" action={{ label: "Review", href: "/review" }} />
  }
  markAllLabel="Mark all as read"
  onMarkAllRead={markAllRead}
  footer={{ label: "Notification settings", href: "/settings" }}
  empty={{ title: "You are all caught up" }}
/>;
```

## Accessibility

Follows the WAI-ARIA Authoring Practices pattern: [Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).

Keyboard:

| Key | Action |
| --- | --- |
| Enter / Space | Bell \| Opens or closes the panel; focus moves into the panel |
| Tab / Shift+Tab | Popover \| Moves through the panel's controls in order; the popover stays open |
| Tab / Shift+Tab | Sheet \| Moves through the sheet's controls, wrapping: focus stays in the sheet |
| Left / Right arrow | Tabs \| Previous / next tab, wrapping; the tab is chosen as it takes focus |
| Home / End | Tabs \| First / last tab |
| Enter / Space | Row, buttons \| Activates the row (and closes the panel), "Mark all as read" or the footer |
| Escape | Popover, sheet \| Closes the panel and returns focus to the bell |

- The bell is a button named by `label` and the count, "Notifications, 4 unread", with `aria-haspopup="dialog"`,
- The popover is a non-modal `role="dialog"` labelled by its heading. Focus moves to it on open; Escape returns focus to the
- Tabs follow the WAI-ARIA tabs pattern with automatic activation and one shared `tabpanel` that lists the chosen tab's items. The arrow keys mirror in right-to-left text. A row of tabs that does not fit scrolls sideways, and the edge that hides more fades.
- Each group is a heading and a list. Unread rows say so in text (`unreadLabel`, read before the title), not by the dot or the
- A polite live region announces changes of `unreadCount` ("Notifications, 5 unread"). It says nothing on first paint.
- "Mark all as read" stays focusable and is `aria-disabled` when nothing is unread, so focus is not lost when the last one is
- Loading is one polite status with skeleton rows; a failure is an alert.
- In forced-colors mode the unread dot and the row's start edge use `Highlight`, the selected tab keeps its underline and the

## Motion

Motion uses the package's tokens and primitives and only moves `transform` and `opacity`. Every piece collapses under
`prefers-reduced-motion`: the panel simply appears and disappears, and nothing is hidden.

| Moment                         | What happens                                                                                                   |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| The panel opens                | It grows out of the bell's corner (scale 0.96 to 1 with a fade). A sheet slides up, as the `MoreActions` sheet |
| The panel closes               | A shorter fade and a slight shrink (`--lufia-motion-duration-exit`), then it unmounts; it is inert meanwhile   |
| The first view of the panel    | Rows rise in a short step apart, the same sequence as the `Stagger` primitive, capped at six steps             |
| A tab changes                  | The indicator slides to the tab (`useSlidingIndicator`) and the list crossfades; rows do not re-enter          |
| The unread count changes       | The bell's badge counts with `AnimatedNumber` and pops; tab and header counts flash with `ChangeHighlight`     |
| A notification arrives         | The new row enters at the top and flashes once; nothing moves for rows that were already there                 |
| "Mark all as read"             | Each unread dot scales and fades out and the row tint fades, from top to bottom, 40 ms apart                   |
| The highlight card first shows | Its progress segments fill one after another                                                                   |

Nothing animates on first paint of a closed bell, and a re-render never replays an entrance. Try it in **Interactive**: open
the panel, switch tabs, mark everything read and simulate an arrival.

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thin`, `--lufia-color-accent-default`, `--lufia-color-bg-canvas`, `--lufia-color-bg-surface-solid`, `--lufia-color-border-strong`, `--lufia-color-border-subtle`, `--lufia-color-text-on-accent`, `--lufia-font-family-body`, `--lufia-font-size-2xs`, `--lufia-font-weight-bold`, `--lufia-motion-distance-nudge`, `--lufia-motion-duration-enter`, `--lufia-motion-duration-exit`, `--lufia-motion-easing-in`, `--lufia-motion-easing-out`, `--lufia-overlay-z`, `--lufia-radius-full`, `--lufia-radius-panel`, `--lufia-shadow-lg`, `--lufia-sheet-backdrop`, `--lufia-sheet-max-block-size`, `--lufia-sheet-max-inline-size`, `--lufia-z-dropdown`, `--lufia-z-modal`.

## Content guidelines

Titles say what happened in one line. The meta line names the source; the time is formatted for the locale by the caller.
Keep tab labels to one word and the number of tabs to four or five. The `unreadLabel` is one word ("unread").

## Stories

- `components-overlays-notificationcenter--default`
- `components-overlays-notificationcenter--open`
- `components-overlays-notificationcenter--with-summary`
- `components-overlays-notificationcenter--loading`
- `components-overlays-notificationcenter--empty`
- `components-overlays-notificationcenter--failed`
- `components-overlays-notificationcenter--many-items`
- `components-overlays-notificationcenter--sheet-phone-390`
- `components-overlays-notificationcenter--sheet-phone-320`
- `components-overlays-notificationcenter--sheet-over-dock`
- `components-overlays-notificationcenter--dark`
- `components-overlays-notificationcenter--interactive`
- `components-overlays-notificationcenter--panel-only`
