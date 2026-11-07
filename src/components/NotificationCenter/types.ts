import type { ReactNode } from "react";

export type NotificationItem = {
  /** Stable key. */
  id: string;
  /** Key of the entry in `groups` this item belongs to. Items without a known group come first, under no heading. */
  group?: string;
  /** Key of the entry in `tabs` this item belongs to. A tab with `all` ignores it and shows every item. */
  tab?: string;
  title: string;
  /** What the notification is about or where it came from ("Supplier intelligence"). Shown before `time` on the meta line. */
  meta?: ReactNode;
  /** When it happened ("07:52", "Yesterday"). Shown after `meta`, so the caller formats it for the locale. */
  time?: ReactNode;
  /** Decorative leading icon; hidden from assistive technology. Ignored when `avatar` is set. */
  icon?: ReactNode;
  /** Leading picture, such as an `Avatar` or an `img` with an empty `alt`; hidden from assistive technology. */
  avatar?: ReactNode;
  /** Not read yet. Tints the row, shows a dot and adds the `unreadLabel` text for screen readers. */
  unread?: boolean;
  /** Makes the row a link (through `LufiaLink`) instead of a button. */
  href?: string;
  /** Runs when the row is activated. With `href` it runs before the browser navigates. */
  onSelect?: () => void;
};

export type NotificationTab = {
  /** Stable key, also the value reported to `onTabChange`. */
  key: string;
  label: string;
  /** Number shown beside the label. */
  count?: number;
  /** Shows every item whatever its `tab`, for an "All" tab. */
  all?: boolean;
  /** Replaces the panel's `empty` content when this tab has no items. */
  empty?: NotificationEmpty;
};

export type NotificationGroup = {
  /** Matches `NotificationItem.group`. */
  key: string;
  /** Heading of the group ("Today", "Earlier"). */
  label: string;
};

export type NotificationEmpty = {
  title: string;
  description?: string;
  /** Decorative illustration or icon. */
  icon?: ReactNode;
  /** Next step, usually a button or link. */
  action?: ReactNode;
};

export type NotificationFooter = {
  label: string;
  /** Makes the footer a link. */
  href?: string;
  onSelect?: () => void;
};
