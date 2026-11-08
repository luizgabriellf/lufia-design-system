import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { DocumentIcon, HomeIcon, PlusIcon, SettingsIcon, UploadIcon, UsersIcon } from "../../docs/demo";
import { Button } from "../Button";
import {
  CommandPalette,
  type CommandItem,
  type CommandPaletteLabels,
  type CommandPaletteProps,
} from "./CommandPalette";

const labels: CommandPaletteLabels = {
  title: "Search or run a command",
  placeholder: "Type a command or search…",
  empty: (query) => `No results for “${query}”`,
  resultCount: (count) => `${count} ${count === 1 ? "result" : "results"}`,
};

const noop = () => {};

const items: CommandItem[] = [
  {
    key: "new-doc",
    label: "New document",
    description: "Start from a blank page",
    group: "Actions",
    icon: <PlusIcon size={16} />,
    onSelect: noop,
  },
  {
    key: "upload",
    label: "Upload files",
    description: "Add files from your computer",
    group: "Actions",
    icon: <UploadIcon size={16} />,
    keywords: "import",
    onSelect: noop,
  },
  {
    key: "home",
    label: "Overview",
    description: "Go to the dashboard",
    group: "Go to",
    icon: <HomeIcon size={16} />,
    onSelect: noop,
  },
  {
    key: "people",
    label: "People",
    description: "Everyone on the team",
    group: "Go to",
    icon: <UsersIcon size={16} />,
    onSelect: noop,
  },
  { key: "docs", label: "Documents", group: "Go to", icon: <DocumentIcon size={16} />, onSelect: noop },
  {
    key: "settings",
    label: "Settings",
    description: "Preferences for the workspace",
    group: "Go to",
    icon: <SettingsIcon size={16} />,
    keywords: "preferences",
    onSelect: noop,
  },
];

function Demo({
  initialOpen = false,
  commands = items,
  ...extra
}: {
  initialOpen?: boolean;
  commands?: CommandItem[];
} & Partial<CommandPaletteProps>) {
  const [open, setOpen] = useState(initialOpen);
  return (
    <div style={{ padding: "1rem", display: "grid", gap: "0.75rem", justifyItems: "start" }}>
      <Button onClick={() => setOpen(true)}>Open the palette</Button>
      <p style={{ margin: 0, color: "var(--lufia-color-text-muted)" }}>
        Or press <kbd>Ctrl</kbd> + <kbd>K</kbd> (<kbd>Cmd</kbd> + <kbd>K</kbd> on a Mac).
      </p>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        items={commands}
        labels={labels}
        hint="Search by name, or choose an action."
        {...extra}
      />
    </div>
  );
}

const meta = {
  title: "Components/Overlays/CommandPalette",
  component: Demo,
  parameters: { layout: "fullscreen", docs: { story: { inline: false, iframeHeight: 520 } } },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const OpenOnLoad: Story = { args: { initialOpen: true } };
export const SingleGroup: Story = {
  args: { initialOpen: true, commands: items.slice(2).map((i) => ({ ...i, group: undefined })) },
};
export const LongText: Story = {
  args: {
    initialOpen: true,
    commands: [
      {
        key: "long",
        label: "A command with a name that is much too long to fit on a single line of the palette",
        description:
          "And a description that keeps going to prove that unbroken_identifiers_wrap_instead_of_overflowing.",
        group: "Actions",
        onSelect: noop,
      },
    ],
  },
};
export const Phone390: Story = {
  args: { initialOpen: true },
  globals: { viewport: { value: "w390", isRotated: false } },
};
export const Phone320: Story = {
  args: { initialOpen: true },
  globals: { viewport: { value: "w320", isRotated: false } },
};

/** `groupOrder` lists the sections in a fixed order whatever the order of the items. */
/** `escapeClearsQuery`: with text in the field, the first Escape clears it and the second closes the palette. */
export const EscapeClearsQuery: Story = { args: { initialOpen: true, escapeClearsQuery: true } };
export const FixedSectionOrder: Story = { args: { initialOpen: true, groupOrder: ["Go to", "Actions"] } };

function AnswerMode() {
  const [open, setOpen] = useState(true);
  const [answering, setAnswering] = useState(false);
  const commands: CommandItem[] = [
    {
      key: "ask",
      label: "Ask about this page",
      group: "Assistant",
      keepOpen: true,
      onSelect: () => setAnswering(true),
    },
    ...items,
  ];
  return (
    <CommandPalette
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setAnswering(false);
      }}
      items={commands}
      labels={labels}
      groupOrder={["Assistant"]}
      bodyOverride={
        answering
          ? ({ query }) => (
              <p style={{ padding: "1rem", margin: 0 }}>
                An answer to “{query || "your question"}”. Escape returns to the results; a second Escape
                closes the palette.
              </p>
            )
          : undefined
      }
      onEscape={() => {
        if (!answering) return false;
        setAnswering(false);
        return true;
      }}
    />
  );
}

/** Choose "Ask about this page": the answer replaces the results, the first Escape leaves it, the second closes. */
export const AnswerReplacesResults: Story = { render: () => <AnswerMode /> };

function ServerSearch() {
  const [rows, setRows] = useState<CommandItem[]>([]);
  const [loading, setLoading] = useState(false);
  return (
    <CommandPalette
      open
      onOpenChange={() => {}}
      items={rows}
      labels={labels}
      filter={() => true}
      loading={loading}
      onQueryChange={(query) => {
        setLoading(true);
        setTimeout(() => {
          setRows(
            query
              ? [{ key: query, label: `Record matching “${query}”`, group: "Records", onSelect: noop }]
              : [],
          );
          setLoading(false);
        }, 600);
      }}
    />
  );
}

/** `onQueryChange` with `filter={() => true}` and `loading`: results come from a server; "No results" waits for the answer. */
export const ServerSideSearch: Story = { render: () => <ServerSearch /> };

const serverLabels: CommandPaletteLabels = { ...labels, loading: "Searching…" };

const serverDefaults: CommandItem[] = [
  {
    key: "new-project",
    label: "New project",
    group: "Actions",
    icon: <PlusIcon size={16} />,
    tone: "accent",
    onSelect: noop,
  },
  {
    key: "open-settings",
    label: "Open settings",
    group: "Actions",
    icon: <SettingsIcon size={16} />,
    onSelect: noop,
  },
];

function ServerSearchStatus() {
  const [rows, setRows] = useState<CommandItem[]>(serverDefaults);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <CommandPalette
      open
      onOpenChange={() => {}}
      items={rows}
      labels={serverLabels}
      filter={() => true}
      loading={loading}
      hintPlacement="top"
      hint={({ query }) => (query.trim().length === 1 ? "Type at least 2 characters to search." : null)}
      notice={failed ? <p role="alert">Search is unavailable. Showing the default commands.</p> : null}
      onQueryChange={(query) => {
        // Only the latest query may answer: cancel the one still in flight.
        clearTimeout(timer.current);
        setFailed(false);
        if (query.trim().length < 2) {
          setLoading(false);
          setRows(serverDefaults);
          return;
        }
        setLoading(true);
        timer.current = setTimeout(() => {
          if (query.trim() === "fail") {
            setFailed(true);
            setRows(serverDefaults);
          } else {
            setRows([
              { key: "projects", label: `Projects matching “${query}”`, group: "Results", onSelect: noop },
              { key: "invoices", label: `Invoices matching “${query}”`, group: "Results", onSelect: noop },
            ]);
          }
          setLoading(false);
        }, 1500);
      }}
    />
  );
}

/**
 * A server search with every status: type one character for the hint, two or more for the "Searching…" row below the
 * commands, and `fail` for an error notice above the commands, which stay selectable with the arrow keys.
 */
export const ServerSearchWithStatus: Story = { render: () => <ServerSearchStatus /> };

/** `tone` tints the icon: `accent` for create or assistant actions, `danger` for destructive ones. */
export const IconTones: Story = {
  args: {
    initialOpen: true,
    commands: [
      {
        key: "new",
        label: "New project",
        group: "Actions",
        icon: <PlusIcon size={16} />,
        tone: "accent",
        onSelect: noop,
      },
      {
        key: "open",
        label: "Open settings",
        group: "Actions",
        icon: <SettingsIcon size={16} />,
        onSelect: noop,
      },
      {
        key: "delete",
        label: "Delete workspace",
        group: "Actions",
        icon: <DocumentIcon size={16} />,
        tone: "danger",
        onSelect: noop,
      },
    ],
  },
};

function AskAndSubmit() {
  const [answering, setAnswering] = useState(false);
  const [asked, setAsked] = useState<string[]>([]);
  const commands: CommandItem[] = [
    {
      key: "ask",
      label: "Ask a question",
      description: "Type it, then press Enter",
      group: "Assistant",
      keepOpen: true,
      onSelect: () => setAnswering(true),
    },
    ...items,
  ];
  return (
    <CommandPalette
      open
      onOpenChange={() => {}}
      items={commands}
      labels={labels}
      groupOrder={["Assistant"]}
      bodyOverride={
        answering ? (
          <div style={{ display: "grid", gap: "0.5rem", padding: "1rem" }}>
            <p style={{ margin: 0 }}>Type a question and press Enter to ask it.</p>
            {asked.length > 0 ? (
              <ul data-asked="" style={{ margin: 0, paddingInlineStart: "1.25rem" }}>
                {asked.map((question, index) => (
                  <li key={index}>Asked: {question}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : undefined
      }
      onSubmit={(query) => setAsked((all) => [...all, query || "(empty)"])}
      onEscape={() => {
        if (!answering) return false;
        setAnswering(false);
        return true;
      }}
    />
  );
}

/**
 * `onSubmit` and a `keepOpen` command picked with the pointer: click "Ask a question" and focus is back in the field, so
 * typing carries on; Enter then calls `onSubmit(query)` while the answer area is shown.
 */
export const SubmitWhileAnswering: Story = { render: () => <AskAndSubmit /> };

/**
 * `className` and `data-*` on the palette's outermost layer: the palette is portalled to `document.body`, so a scope the app
 * sets on its own wrapper (here a dark mode) is repeated on the palette.
 */
export const ScopedLayer: Story = {
  render: () => (
    <CommandPalette
      open
      onOpenChange={() => {}}
      items={items}
      labels={labels}
      className="app-palette"
      data-lufia-mode="dark"
      data-tour="palette"
    />
  ),
};
