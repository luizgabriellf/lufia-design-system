import { REPO_BLOB } from "./blocks/links";

export const CATEGORIES = [
  "Actions",
  "Forms",
  "Overlays",
  "Navigation",
  "Data display",
  "Feedback",
  "Motion",
  "Utilities",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Entry = {
  name: string;
  /** Sidebar group under Components; hooks live under their own root. */
  category: Category | "Hooks";
  /** One-line description shown in the page header and the landing grid. */
  summary: string;
  /** Directory under src/, for the "Source" link. */
  dir: "components" | "motion";
  /** WAI-ARIA Authoring Practices pattern the keyboard behaviour follows, when there is one. */
  apg?: { label: string; path: string };
};

const APG = "https://www.w3.org/WAI/ARIA/apg/patterns";
const apg = (label: string, path: string) => ({ label, path: `${APG}/${path}/` });

const c = (
  name: string,
  category: Entry["category"],
  summary: string,
  pattern?: Entry["apg"],
  dir: Entry["dir"] = "components",
): Entry => (pattern ? { name, category, summary, dir, apg: pattern } : { name, category, summary, dir });

export const ENTRIES: Entry[] = [
  c(
    "Button",
    "Actions",
    "The control for an action: a native button, or a link that looks like one.",
    apg("Button", "button"),
  ),
  c(
    "IconButton",
    "Actions",
    "A button with only an icon, which therefore requires an accessible name.",
    apg("Button", "button"),
  ),
  c("Link", "Actions", "Navigation inside text, routed through the adapter set on LufiaProvider."),
  c(
    "MoreActions",
    "Actions",
    "An overflow menu that collects the secondary actions of a row or a page.",
    apg("Menu button", "menu-button"),
  ),
  c(
    "PageActions",
    "Actions",
    "The action bar of a page: one primary action, the rest collapsed on narrow screens.",
  ),
  c("ActionIcons", "Actions", "Deprecated aliases of six action icons; use the named icons of Icon instead."),

  c(
    "FormField",
    "Forms",
    "Label, hint and error wired to any control, so the control stays accessible by default.",
  ),
  c("TextInput", "Forms", "A single-line text field with optional prefix and suffix."),
  c("Textarea", "Forms", "A multi-line text field that can show a character count."),
  c(
    "Select",
    "Forms",
    "A native select (dropdown) styled with tokens, for choosing one option from a short list.",
  ),
  c(
    "DateField",
    "Forms",
    "A native date, time, date-and-time or month control in the shared field box, with icon and optional clear button.",
  ),
  c(
    "DateRangeField",
    "Forms",
    "Two date fields that form one range, in a fieldset, where the start is never after the end.",
  ),
  c(
    "Combobox",
    "Forms",
    "A searchable single-select dropdown input with async options, following the APG combobox pattern.",
    apg("Combobox", "combobox"),
  ),
  c(
    "Checkbox",
    "Forms",
    "A checkbox with a mixed state, for independent on/off choices.",
    apg("Checkbox", "checkbox"),
  ),
  c("RadioGroup", "Forms", "A set of radios where exactly one choice applies.", apg("Radio group", "radio")),
  c("Switch", "Forms", "An on/off control whose change takes effect immediately.", apg("Switch", "switch")),
  c(
    "SegmentedToggle",
    "Forms",
    "A compact single-choice control for switching between a few views or modes.",
    apg("Radio group", "radio"),
  ),
  c("SearchInput", "Forms", "A search field with a clear button, optional debounce and a shortcut hint."),
  c(
    "ListField",
    "Forms",
    "A field holding a list of short text entries, each editable in place, with an add row and a remove button.",
  ),
  c("FileField", "Forms", "A file picker with drag and drop, validation and a list of chosen files."),
  c(
    "PendingSubmit",
    "Forms",
    "A submit button that reads the pending state of its form and prevents double submits.",
  ),

  c(
    "Modal",
    "Overlays",
    "A dialog that interrupts the page and traps focus until it is dismissed.",
    apg("Dialog (modal)", "dialog-modal"),
  ),
  c(
    "Popover",
    "Overlays",
    "A non-modal panel anchored to a trigger, for content that needs more room than a menu and less ceremony than a dialog.",
  ),
  c(
    "Tour",
    "Overlays",
    "A non-modal guided tour: a card that walks through steps with a spotlight on each target, while the page stays usable.",
  ),
  c(
    "ConfirmDialog",
    "Overlays",
    "A modal question that has to be answered, with a destructive variant.",
    apg("Alert dialog", "alertdialog"),
  ),
  c(
    "NotificationCenter",
    "Overlays",
    "A bell with an unread count that opens a panel of notifications: a popover on wide pages, a sheet on narrow ones.",
    apg("Tabs", "tabs"),
  ),
  c(
    "CommandPalette",
    "Overlays",
    "A keyboard-first launcher that filters commands and pages.",
    apg("Combobox", "combobox"),
  ),

  c("AppShell", "Navigation", "The application frame: sidebar, content area and the phone navigation sheet."),
  c("PageHeader", "Navigation", "The title row of a page with eyebrow, description and actions."),
  c(
    "PeerNav",
    "Navigation",
    "Links or tabs for moving between sibling views of the same page.",
    apg("Tabs", "tabs"),
  ),
  c("NavRow", "Navigation", "A row that links to a destination, for lists of places and settings."),
  c("Pagination", "Navigation", "Previous, next and numbered pages for long lists."),
  c(
    "SectionHeader",
    "Navigation",
    "The title row of one section of a page: heading, description and actions.",
  ),
  c("Stepper", "Navigation", "Shows progress through a short, ordered flow."),

  c("Card", "Data display", "A bordered surface that groups related content, optionally interactive."),
  c("Badge", "Data display", "A short status or count label in a semantic tone."),
  c("DetailList", "Data display", "Label and value pairs for the details of one record."),
  c("DetailSectionCard", "Data display", "A titled card that holds one section of a detail page."),
  c(
    "DetailAttentionCard",
    "Data display",
    "A high-signal card for deadlines and risk, with a tone mark and an optional action.",
  ),
  c(
    "StatTile",
    "Data display",
    "A key figure with its label, change and hint, optionally a link to its detail.",
  ),
  c("Sparkline", "Data display", "A word-sized trend chart with no axes, drawn in SVG."),
  c("BarList", "Data display", "Horizontal bars with the name and the value as text, on one shared scale."),
  c(
    "ColumnChart",
    "Data display",
    "Columns on one baseline, single or stacked, with the numbers in a hidden data table.",
  ),
  c(
    "StackedBar",
    "Data display",
    "One bar split into proportional segments, with a legend and a text alternative.",
  ),
  c("BulletBar", "Data display", "A value as a bar against a target tick, comparable across rows."),
  c("ProgressBar", "Data display", "A determinate progress bar with a native progressbar role."),
  c(
    "AttentionList",
    "Data display",
    "A short list of items that need a decision, with a tone bar and an action.",
  ),
  c(
    "QueueSummary",
    "Data display",
    "Work queues by urgency: open ones as rows, empty ones folded into one line, an all-clear when none are open.",
  ),
  c("ActivityList", "Data display", "A feed of what happened with its time, optionally on a timeline rail."),
  c("StatusTimeline", "Data display", "A vertical timeline of states with their dates."),
  c("TableToolbar", "Data display", "The search, filter and action row above a table."),
  c(
    "SortableTh",
    "Data display",
    "A table header cell that sorts a column and announces the order.",
    apg("Sortable table", "table"),
  ),

  c(
    "Banner",
    "Feedback",
    "An inline message for a page or section: info, success, warning, danger or neutral, with an optional action and dismiss.",
    apg("Alert", "alert"),
  ),
  c(
    "Toast",
    "Feedback",
    "A transient message that confirms an action without taking focus.",
    apg("Alert", "alert"),
  ),
  c("SuccessCheck", "Feedback", "An animated check mark for a completed action."),
  c(
    "StatusIcon",
    "Feedback",
    "One family of status markers, each tone with its own shape so it reads without colour.",
  ),
  c("EmptyState", "Feedback", "What to show when a list or panel has nothing yet, with the one next step."),
  c(
    "SkeletonTable",
    "Feedback",
    "Placeholder rows for a loading table: equal columns, bars inside their cells, stacked on narrow widths.",
  ),
  c(
    "SkeletonCard",
    "Feedback",
    "A loading card: title bar, text lines and an optional block in the card's padding.",
  ),
  c(
    "SkeletonPageHeader",
    "Feedback",
    "The top of a loading page, on PageHeader's own layout and breakpoints.",
  ),

  c(
    "AnimatedNumber",
    "Motion",
    "Counts a number to its new value and respects reduced motion.",
    undefined,
    "motion",
  ),
  c(
    "ChangeHighlight",
    "Motion",
    "Briefly highlights content that changed, so the change is noticed.",
    undefined,
    "motion",
  ),
  c("Collapse", "Motion", "Animates the height of content that opens and closes.", undefined, "motion"),
  c("Reveal", "Motion", "Fades and lifts content in as it enters, once.", undefined, "motion"),
  c(
    "RouteTransition",
    "Motion",
    "Fades the content region in when the page changes, with no router dependency.",
    undefined,
    "motion",
  ),
  c(
    "Stagger",
    "Motion",
    "Children that enter one after another, capped in length and still under reduced motion.",
    undefined,
    "motion",
  ),
  c(
    "Skeleton",
    "Motion",
    "A placeholder with the shape of the content that is loading.",
    undefined,
    "motion",
  ),

  c(
    "LufiaProvider",
    "Utilities",
    "Sets the link adapter and the aria-only labels once, at the root of an app.",
  ),
  c(
    "Icon",
    "Utilities",
    "The icon set: named stroke icons on one 24-unit grid, the Icon primitive and createIcon for an app's own glyphs.",
  ),
  c("VisuallyHidden", "Utilities", "Hides text visually and keeps it for assistive technology."),

  c("useBodyScrollLock", "Hooks", "Locks page scrolling while an overlay is open, without layout shift."),
  c("useDismiss", "Hooks", "Calls back on Escape or an outside press, for popovers and menus."),
  c("useFocusTrap", "Hooks", "Keeps Tab inside a container and restores focus when it closes."),
  c("useMediaQuery", "Hooks", "Subscribes a component to a CSS media query, safe for server rendering."),
  c("useModalState", "Hooks", "Open, close and the element to return focus to, for a controlled modal."),
  c("usePagination", "Hooks", "Computes the page range with ellipses for a paginator."),
  c("useSlidingIndicator", "Hooks", "Measures the active item so an indicator can slide to it."),
  c("useStepDirection", "Hooks", "Tells a stepper whether it is moving forward or back."),
  c(
    "usePrefersReducedMotion",
    "Hooks",
    "Reads the reduced-motion preference, for code that animates in JavaScript.",
    undefined,
    "motion",
  ),
];

const BY_NAME = new Map(ENTRIES.map((entry) => [entry.name, entry]));

export function entryFor(name: string): Entry {
  const found = BY_NAME.get(name);
  if (!found) throw new Error(`No taxonomy entry for "${name}"; add it to src/docs/taxonomy.ts.`);
  return found;
}

/** Storybook title of a component's stories and docs: Components/<Category>/<Name>, or Hooks/<Name>. */
export function titleFor(entry: Entry): string {
  return entry.category === "Hooks" ? `Hooks/${entry.name}` : `Components/${entry.category}/${entry.name}`;
}

const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/** Storybook docs id for a component, as used by `?path=/docs/<id>--docs`. */
export function docsIdFor(name: string): string {
  return slug(titleFor(entryFor(name)));
}

export function sourceUrlFor(entry: Entry): string {
  return `${REPO_BLOB}/src/${entry.dir}/${entry.name}`;
}
