/**
 * Explicit props for the consumer smoke page (`scripts/consumer-smoke.mjs`), for the exports whose required props cannot
 * be derived from the manifest: a list, an object or a function that returns a value. Keyed by export name; each value maps
 * a prop name to a JavaScript expression. Props that are not listed here are derived from their manifest type
 * (string, number, boolean, ReactNode, a string-literal union, a void callback). A stale key fails the generator.
 */
export const FIXTURES = {
  ActivityList: { items: `[{ id: "a", title: "Created", time: "Today" }]` },
  AppShell: {
    groups: `[{ key: "main", items: [{ key: "home", label: "Home", href: "/" }] }]`,
    labels: `{
      skipToContent: "Skip to content",
      navigation: "Main",
      menu: "Menu",
      floatBar: "Actions",
      collapseSidebar: "Collapse",
      expandSidebar: "Expand",
    }`,
  },
  BarList: { rows: `[{ key: "a", name: "A", value: "10", amount: 10 }]` },
  ColumnChart: {
    series: `[{ key: "s", label: "Series" }]`,
    columns: `[{ key: "c", label: "Column", values: [3] }]`,
  },
  Combobox: { options: `[{ value: "a", label: "A" }]` },
  CommandPalette: {
    items: `[{ key: "a", label: "Action" }]`,
    labels: `{
      title: "Commands",
      placeholder: "Search",
      empty: () => "Nothing found",
      resultCount: (count) => String(count),
    }`,
  },
  Checklist: { items: `[{ key: "a", text: "Item" }]` },
  CitationList: { items: `[{ key: "a", reference: "Reference" }]` },
  DetailList: { rows: `[{ label: "Label", value: "Value" }]` },
  FileField: { formatRejection: `() => "Rejected"` },
  MoreActions: { items: `[{ key: "a", label: "Action" }]` },
  NotificationCenter: {
    unreadCountLabel: `(count) => String(count)`,
    items: `[{ id: "a", title: "Notification" }]`,
  },
  Popover: { trigger: `(props) => <button type="button" {...props}>Open</button>` },
  Tour: {
    steps: `[{ title: "Step", body: "Body" }]`,
    labels: `{
      next: "Next",
      back: "Back",
      skip: "Skip",
      close: "Close",
      finish: "Done",
      stepOf: (current, total) => current + " of " + total,
    }`,
  },
  Pagination: {
    labels: `{
      nav: "Pages",
      previous: "Previous",
      next: "Next",
      page: (page) => String(page),
      summary: (page, totalPages) => page + " of " + totalPages,
    }`,
  },
  PeerNav: { items: `[{ key: "a", label: "A", href: "/" }]` },
  QueueSummary: {
    items: `[{ id: "a", label: "Open", count: 1 }]`,
    clearLabel: `(count) => String(count)`,
  },
  ListField: {
    labels: `{ add: "Add", remove: (index, text) => "Remove " + index + ": " + text, entry: (index) => "Entry " + index }`,
  },
  RadioGroup: { options: `[{ value: "a", label: "A" }]` },
  SegmentedToggle: { options: `[{ value: "a", label: "A" }]` },
  Sparkline: { values: `[1, 3, 2]` },
  StackedBar: { segments: `[{ key: "a", label: "A", value: 1 }]` },
  StatusTimeline: {
    tracks: `[{ id: "t", title: "Track", nodes: [{ id: "n", label: "Step", state: "done", stateLabel: "Done" }] }]`,
  },
  Stepper: { steps: `[{ key: "a", label: "A" }, { key: "b", label: "B" }]` },
};
