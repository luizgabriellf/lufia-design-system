/*
 * Icon geometry adapted from Lucide (https://lucide.dev), ISC License.
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT).
 * All other copyright (c) for Lucide are held by Lucide Contributors 2022.
 * Only the icons below are vendored; the full notice is in THIRD_PARTY_NOTICES.md.
 *
 * Every icon is drawn on the 24-unit grid of `Icon`, stroke only. Each export is a top-level pure call, so a bundler
 * drops the icons an app does not import.
 */
import { createIcon } from "./Icon";

/** Close, dismiss, clear, remove. */
export const CloseIcon = /* @__PURE__ */ createIcon(
  "close",
  <>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </>,
);

/** Selected, done, confirm. */
export const CheckIcon = /* @__PURE__ */ createIcon(
  "check",
  <>
    <path d="M20 6 9 17l-5-5" />
  </>,
);

/** Mark all as read. */
export const CheckCheckIcon = /* @__PURE__ */ createIcon(
  "check-check",
  <>
    <path d="M18 6 7 17l-5-5" />
    <path d="m22 10-7.5 7.5L13 16" />
  </>,
);

/** Add, create, expand. */
export const PlusIcon = /* @__PURE__ */ createIcon(
  "plus",
  <>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </>,
);

/** Remove, collapse, no change. */
export const MinusIcon = /* @__PURE__ */ createIcon(
  "minus",
  <>
    <path d="M5 12h14" />
  </>,
);

/** Search. */
export const SearchIcon = /* @__PURE__ */ createIcon(
  "search",
  <>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </>,
);

/** Filter. */
export const FilterIcon = /* @__PURE__ */ createIcon(
  "filter",
  <>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </>,
);

/** Sort (unsorted column). */
export const SortIcon = /* @__PURE__ */ createIcon(
  "sort",
  <>
    <path d="m21 16-4 4-4-4" />
    <path d="M17 20V4" />
    <path d="m3 8 4-4 4 4" />
    <path d="M7 4v16" />
  </>,
);

/** Open a list, expand. */
export const ChevronDownIcon = /* @__PURE__ */ createIcon(
  "chevron-down",
  <>
    <path d="m6 9 6 6 6-6" />
  </>,
);

/** Collapse, increase. */
export const ChevronUpIcon = /* @__PURE__ */ createIcon(
  "chevron-up",
  <>
    <path d="m18 15-6-6-6 6" />
  </>,
);

/** Previous, back. */
export const ChevronLeftIcon = /* @__PURE__ */ createIcon(
  "chevron-left",
  <>
    <path d="m15 18-6-6 6-6" />
  </>,
);

/** Next, drill in. */
export const ChevronRightIcon = /* @__PURE__ */ createIcon(
  "chevron-right",
  <>
    <path d="m9 18 6-6-6-6" />
  </>,
);

/** Go back. */
export const ArrowLeftIcon = /* @__PURE__ */ createIcon(
  "arrow-left",
  <>
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </>,
);

/** Go forward, continue. */
export const ArrowRightIcon = /* @__PURE__ */ createIcon(
  "arrow-right",
  <>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </>,
);

/** Ascending, move up. */
export const ArrowUpIcon = /* @__PURE__ */ createIcon(
  "arrow-up",
  <>
    <path d="m5 12 7-7 7 7" />
    <path d="M12 19V5" />
  </>,
);

/** Descending, move down. */
export const ArrowDownIcon = /* @__PURE__ */ createIcon(
  "arrow-down",
  <>
    <path d="M12 5v14" />
    <path d="m19 12-7 7-7-7" />
  </>,
);

/** The Enter key, submit. */
export const EnterIcon = /* @__PURE__ */ createIcon(
  "enter",
  <>
    <polyline points="9 10 4 15 9 20" />
    <path d="M20 4v7a4 4 0 0 1-4 4H4" />
  </>,
);

/** Opens elsewhere (new tab, other site). */
export const ExternalLinkIcon = /* @__PURE__ */ createIcon(
  "external-link",
  <>
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </>,
);

/** More actions (horizontal). */
export const MoreIcon = /* @__PURE__ */ createIcon(
  "more",
  <>
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </>,
);

/** More actions (vertical). */
export const MoreVerticalIcon = /* @__PURE__ */ createIcon(
  "more-vertical",
  <>
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </>,
);

/** Open the navigation menu. */
export const MenuIcon = /* @__PURE__ */ createIcon(
  "menu",
  <>
    <line />
    <line />
    <line />
  </>,
);

/** Collapse or expand a sidebar. */
export const SidebarIcon = /* @__PURE__ */ createIcon(
  "sidebar",
  <>
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M9 3v18" />
  </>,
);

/** Edit. */
export const EditIcon = /* @__PURE__ */ createIcon(
  "edit",
  <>
    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
    <path d="m15 5 4 4" />
  </>,
);

/** Copy, duplicate. */
export const CopyIcon = /* @__PURE__ */ createIcon(
  "copy",
  <>
    <rect width="14" height="14" x="8" y="8" rx="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </>,
);

/** Delete. */
export const TrashIcon = /* @__PURE__ */ createIcon(
  "trash",
  <>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line />
    <line />
  </>,
);

/** Upload, import. */
export const UploadIcon = /* @__PURE__ */ createIcon(
  "upload",
  <>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line />
  </>,
);

/** Download, export. */
export const DownloadIcon = /* @__PURE__ */ createIcon(
  "download",
  <>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line />
  </>,
);

/** Reopen, undo, reset. */
export const RotateCcwIcon = /* @__PURE__ */ createIcon(
  "rotate-ccw",
  <>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </>,
);

/** Settings. */
export const SettingsIcon = /* @__PURE__ */ createIcon(
  "settings",
  <>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </>,
);

/** Sign out. */
export const SignOutIcon = /* @__PURE__ */ createIcon(
  "sign-out",
  <>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line />
  </>,
);

/** Light mode. */
export const SunIcon = /* @__PURE__ */ createIcon(
  "sun",
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </>,
);

/** Dark mode. */
export const MoonIcon = /* @__PURE__ */ createIcon(
  "moon",
  <>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </>,
);

/** AI-generated or assisted content. */
export const SparkleIcon = /* @__PURE__ */ createIcon(
  "sparkle",
  <>
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    <path d="M20 3v4" />
    <path d="M22 5h-4" />
    <path d="M4 17v2" />
    <path d="M5 18H3" />
  </>,
);

/** Show, visible. */
export const EyeIcon = /* @__PURE__ */ createIcon(
  "eye",
  <>
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
    <circle cx="12" cy="12" r="3" />
  </>,
);

/** Hide, hidden. */
export const EyeOffIcon = /* @__PURE__ */ createIcon(
  "eye-off",
  <>
    <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
    <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
    <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
    <path d="m2 2 20 20" />
  </>,
);

/** Information. */
export const InfoIcon = /* @__PURE__ */ createIcon(
  "info",
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </>,
);

/** Success. */
export const SuccessIcon = /* @__PURE__ */ createIcon(
  "success",
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </>,
);

/** Warning. */
export const WarningIcon = /* @__PURE__ */ createIcon(
  "warning",
  <>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </>,
);

/** Error, danger, overdue. */
export const ErrorIcon = /* @__PURE__ */ createIcon(
  "error",
  <>
    <path d="M12 16h.01" />
    <path d="M12 8v4" />
    <path d="M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z" />
  </>,
);

/** Help. */
export const HelpIcon = /* @__PURE__ */ createIcon(
  "help",
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </>,
);

/** Time, pending. */
export const ClockIcon = /* @__PURE__ */ createIcon(
  "clock",
  <>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </>,
);

/** Date, schedule. */
export const CalendarIcon = /* @__PURE__ */ createIcon(
  "calendar",
  <>
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </>,
);

/** Notifications. */
export const BellIcon = /* @__PURE__ */ createIcon(
  "bell",
  <>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </>,
);

/** Inbox, queue. */
export const InboxIcon = /* @__PURE__ */ createIcon(
  "inbox",
  <>
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </>,
);

/** File, document. */
export const FileIcon = /* @__PURE__ */ createIcon(
  "file",
  <>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
  </>,
);

/** Report, text document. */
export const FileTextIcon = /* @__PURE__ */ createIcon(
  "file-text",
  <>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </>,
);

/** A person, the account. */
export const UserIcon = /* @__PURE__ */ createIcon(
  "user",
  <>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </>,
);

/** People, a team. */
export const UsersIcon = /* @__PURE__ */ createIcon(
  "users",
  <>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </>,
);

/** Home. */
export const HomeIcon = /* @__PURE__ */ createIcon(
  "home",
  <>
    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
    <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </>,
);

/** Overview, dashboard, grid view. */
export const GridIcon = /* @__PURE__ */ createIcon(
  "grid",
  <>
    <rect width="7" height="7" x="3" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="14" rx="1" />
    <rect width="7" height="7" x="3" y="14" rx="1" />
  </>,
);

/** Reports, analytics. */
export const ChartIcon = /* @__PURE__ */ createIcon(
  "chart",
  <>
    <path d="M3 3v16a2 2 0 0 0 2 2h16" />
    <path d="M18 17V9" />
    <path d="M13 17V5" />
    <path d="M8 17v-3" />
  </>,
);

/**
 * Every icon of the set, by export name: for galleries and docs. Importing it pulls in the whole set. Frozen, so tooling
 * that decorates exports (a docs generator adding `displayName`) cannot add entries to it.
 */
export const ICONS = /* @__PURE__ */ Object.freeze({
  CloseIcon,
  CheckIcon,
  CheckCheckIcon,
  PlusIcon,
  MinusIcon,
  SearchIcon,
  FilterIcon,
  SortIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EnterIcon,
  ExternalLinkIcon,
  MoreIcon,
  MoreVerticalIcon,
  MenuIcon,
  SidebarIcon,
  EditIcon,
  CopyIcon,
  TrashIcon,
  UploadIcon,
  DownloadIcon,
  RotateCcwIcon,
  SettingsIcon,
  SignOutIcon,
  SunIcon,
  MoonIcon,
  SparkleIcon,
  EyeIcon,
  EyeOffIcon,
  InfoIcon,
  SuccessIcon,
  WarningIcon,
  ErrorIcon,
  HelpIcon,
  ClockIcon,
  CalendarIcon,
  BellIcon,
  InboxIcon,
  FileIcon,
  FileTextIcon,
  UserIcon,
  UsersIcon,
  HomeIcon,
  GridIcon,
  ChartIcon,
} as const);
