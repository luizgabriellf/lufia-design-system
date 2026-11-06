import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { axe } from "../../test/axe";
import { mockReducedMotion } from "../../test/motion";
import { CommandPalette, filterCommands, type CommandItem, type CommandPaletteProps } from "./CommandPalette";

const labels: CommandPaletteProps["labels"] = {
  title: "Search or run a command",
  placeholder: "Type a command…",
  empty: (query) => `No results for “${query}”`,
  resultCount: (count) => `${count} results`,
};

function items(onSelect = vi.fn()): CommandItem[] {
  return [
    { key: "new", label: "New document", group: "Actions", description: "Start from scratch", onSelect },
    { key: "export", label: "Export data", group: "Actions", keywords: "download csv", onSelect },
    { key: "settings", label: "Settings", group: "Go to", onSelect },
    { key: "café", label: "Café menu", group: "Go to", onSelect },
  ];
}

function Harness({
  commands = items(),
  initial = true,
  shortcut = true,
  ...extra
}: {
  commands?: CommandItem[];
  initial?: boolean;
  shortcut?: boolean;
} & Partial<CommandPaletteProps>) {
  const [open, setOpen] = useState(initial);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        items={commands}
        labels={labels}
        hint="Tip"
        shortcut={shortcut}
        {...extra}
      />
    </>
  );
}

const field = () => screen.getByRole("combobox", { name: labels.title });

describe("filterCommands", () => {
  const item: CommandItem = {
    key: "a",
    label: "Café menu",
    group: "Go to",
    keywords: "Download",
    onSelect: () => {},
  };
  it("matches every word, ignoring case and accents, across label, group and keywords", () => {
    expect(filterCommands(item, "cafe")).toBe(true);
    expect(filterCommands(item, "MENU go")).toBe(true);
    expect(filterCommands(item, "download")).toBe(true);
    expect(filterCommands(item, "menu zzz")).toBe(false);
  });
  it("matches everything for an empty query", () => {
    expect(filterCommands(item, "  ")).toBe(true);
  });
});

describe("CommandPalette", () => {
  beforeEach(() => mockReducedMotion(true));
  afterEach(() => vi.unstubAllGlobals());

  it("renders a modal dialog with a combobox that has focus", () => {
    render(<Harness />);
    expect(screen.getByRole("dialog", { name: labels.title })).toHaveAttribute("aria-modal", "true");
    expect(field()).toHaveFocus();
    expect(field()).toHaveAttribute("aria-autocomplete", "list");
  });

  it("points the combobox at a listbox of grouped options", () => {
    render(<Harness />);
    const listbox = screen.getByRole("listbox");
    expect(field()).toHaveAttribute("aria-controls", listbox.id);
    expect(field()).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("group", { name: "Actions" })).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(4);
  });

  it("highlights the first option and moves with the arrow keys, wrapping, while focus stays on the field", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const options = screen.getAllByRole("option");
    expect(options[0]).toHaveAttribute("aria-selected", "true");
    expect(field()).toHaveAttribute("aria-activedescendant", options[0]!.id);
    await user.keyboard("{ArrowDown}");
    expect(options[1]).toHaveAttribute("aria-selected", "true");
    expect(field()).toHaveAttribute("aria-activedescendant", options[1]!.id);
    await user.keyboard("{ArrowUp}{ArrowUp}");
    expect(options[3]).toHaveAttribute("aria-selected", "true");
    expect(field()).toHaveFocus();
  });

  it("filters as you type, resets the highlight and announces the count", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.keyboard("{ArrowDown}");
    await user.type(field(), "cafe");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByRole("option", { name: "Café menu" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("status")).toHaveTextContent("1 results");
  });

  it("finds commands by their hidden keywords", async () => {
    render(<Harness />);
    await userEvent.setup().type(field(), "csv");
    expect(screen.getByRole("option", { name: "Export data" })).toBeInTheDocument();
  });

  it("shows the empty message with the query, and no listbox", async () => {
    render(<Harness />);
    await userEvent.setup().type(field(), "zzz");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(screen.getByText("No results for “zzz”")).toBeInTheDocument();
    expect(field()).toHaveAttribute("aria-expanded", "false");
    expect(field()).not.toHaveAttribute("aria-activedescendant");
  });

  it("runs the highlighted option on Enter and closes", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Harness commands={items(onSelect)} />);
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onSelect).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("runs an option on click", async () => {
    const onSelect = vi.fn();
    render(<Harness commands={items(onSelect)} />);
    await userEvent.setup().click(screen.getByRole("option", { name: "Settings" }));
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it("stays open after a keepOpen command", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Harness commands={[{ key: "a", label: "Ask", keepOpen: true, onSelect }]} />);
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes on Escape and returns focus to the opener", async () => {
    const user = userEvent.setup();
    render(<Harness initial={false} />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(field()).toHaveFocus();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(screen.getByRole("button", { name: "Open" })).toHaveFocus();
  });

  it("opens with Ctrl+K and Cmd+K", async () => {
    const user = userEvent.setup();
    render(<Harness initial={false} />);
    await user.keyboard("{Control>}k{/Control}");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await user.keyboard("{Meta>}k{/Meta}");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("does not close when the shortcut is pressed while open", async () => {
    render(<Harness />);
    await userEvent.setup().keyboard("{Control>}k{/Control}");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  describe("the shortcut leaves the key alone", () => {
    const press = (init: KeyboardEventInit) =>
      fireEvent.keyDown(document.body, { key: "k", ctrlKey: true, ...init });

    it("when something already handled it", () => {
      const handler = (event: KeyboardEvent) => event.preventDefault();
      window.addEventListener("keydown", handler, true);
      render(<Harness initial={false} />);
      press({ cancelable: true });
      window.removeEventListener("keydown", handler, true);
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("during IME composition", () => {
      render(<Harness initial={false} />);
      press({ isComposing: true });
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("on key repeat", () => {
      render(<Harness initial={false} />);
      press({ repeat: true });
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("while another modal is open", () => {
      render(
        <>
          <div role="dialog" aria-modal="true" aria-label="Other" />
          <Harness initial={false} />
        </>,
      );
      press({});
      expect(screen.queryByRole("dialog", { name: labels.title })).toBeNull();
    });

    it("opens on a plain press", () => {
      render(<Harness initial={false} />);
      press({});
      expect(screen.getByRole("dialog", { name: labels.title })).toBeInTheDocument();
    });
  });

  it("names a multi-word group by its heading", () => {
    render(<Harness />);
    expect(screen.getByRole("group", { name: "Go to" })).toBeInTheDocument();
  });

  it("derives option ids from the command key, so the active id follows the option", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const before = field().getAttribute("aria-activedescendant");
    await user.type(field(), "settings");
    const after = field().getAttribute("aria-activedescendant");
    expect(before).toContain("option-new");
    expect(after).toContain("option-settings");
    expect(document.getElementById(after!)).toHaveAttribute("role", "option");
  });

  it("ignores the shortcut when turned off", async () => {
    render(<Harness initial={false} shortcut={false} />);
    await userEvent.setup().keyboard("{Control>}k{/Control}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("starts empty on every opening", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(field(), "set");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(field()).toHaveValue("");
    expect(screen.getAllByRole("option")).toHaveLength(4);
  });

  it("reports the query and honours a custom filter", async () => {
    const onQueryChange = vi.fn();
    render(
      <CommandPalette
        open
        onOpenChange={() => {}}
        items={items()}
        labels={labels}
        filter={() => true}
        onQueryChange={onQueryChange}
      />,
    );
    await userEvent.setup().type(field(), "zz");
    expect(onQueryChange).toHaveBeenLastCalledWith("zz");
    expect(screen.getAllByRole("option")).toHaveLength(4);
  });

  it("has no axe violations with results and with none", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(await axe(document.body)).toHaveNoViolations();
    await user.type(field(), "zzz");
    expect(await axe(document.body)).toHaveNoViolations();
  });
});

describe("CommandPalette extension points", () => {
  beforeEach(() => mockReducedMotion(true));
  afterEach(() => vi.unstubAllGlobals());

  const headings = () => Array.from(document.querySelectorAll('[role="presentation"]'), (n) => n.textContent);

  describe("groupOrder", () => {
    it("lists the named groups first, in that order, then the rest in order of first use", () => {
      render(<Harness groupOrder={["Go to"]} />);
      expect(headings()).toEqual(["Go to", "Actions"]);
    });

    it("keeps the order of first use by default and ignores named groups with no results", async () => {
      const { rerender } = render(<Harness />);
      expect(headings()).toEqual(["Actions", "Go to"]);
      rerender(<Harness groupOrder={["Nowhere", "Go to", "Actions"]} />);
      expect(headings()).toEqual(["Go to", "Actions"]);
    });

    it("moves the highlight through the groups in the shown order", async () => {
      const user = userEvent.setup();
      render(<Harness groupOrder={["Go to"]} />);
      expect(field()).toHaveAttribute("aria-activedescendant", expect.stringContaining("settings"));
      await user.keyboard("{ArrowDown}{ArrowDown}");
      expect(field()).toHaveAttribute("aria-activedescendant", expect.stringContaining("new"));
    });
  });

  describe("bodyOverride", () => {
    it("replaces the results, the empty message and the hint, and ends the listbox", () => {
      render(<Harness bodyOverride={<p>An answer</p>} />);
      expect(screen.getByText("An answer")).toBeInTheDocument();
      expect(screen.queryByRole("listbox")).toBeNull();
      expect(screen.queryByText("Tip")).toBeNull();
      expect(field()).toHaveAttribute("aria-expanded", "false");
      expect(field()).not.toHaveAttribute("aria-activedescendant");
      expect(field()).toHaveFocus();
    });

    it("takes a function that gets the query", async () => {
      const user = userEvent.setup();
      render(<Harness bodyOverride={({ query }) => <p>Answer to {query}</p>} />);
      await user.type(field(), "why");
      expect(screen.getByText("Answer to why")).toBeInTheDocument();
    });

    it("leaves arrows and Enter alone, and does not announce a count", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(<Harness commands={items(onSelect)} bodyOverride={<p>An answer</p>} />);
      await user.type(field(), "new");
      await user.keyboard("{ArrowDown}{Enter}");
      expect(onSelect).not.toHaveBeenCalled();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByRole("status")).toBeEmptyDOMElement();
    });

    it("brings the results back when it goes away", () => {
      const { rerender } = render(<Harness bodyOverride={<p>An answer</p>} />);
      rerender(<Harness bodyOverride={undefined} />);
      expect(screen.getByRole("listbox")).toBeInTheDocument();
      expect(screen.queryByText("An answer")).toBeNull();
    });

    it("has no axe violations", async () => {
      render(<Harness bodyOverride={<p>An answer</p>} />);
      expect(await axe(document.body)).toHaveNoViolations();
    });
  });

  describe("onEscape", () => {
    it("closes the palette when the hook returns nothing or something other than true", async () => {
      const user = userEvent.setup();
      const onEscape = vi.fn();
      render(<Harness onEscape={onEscape} />);
      await user.keyboard("{Escape}");
      expect(onEscape).toHaveBeenCalledTimes(1);
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    });

    it("keeps it open when the hook handled the key, so a second Escape closes it", async () => {
      const user = userEvent.setup();
      function Sub() {
        const [answer, setAnswer] = useState(true);
        return (
          <Harness
            bodyOverride={answer ? <p>An answer</p> : undefined}
            onEscape={() => {
              if (!answer) return false;
              setAnswer(false);
              return true;
            }}
          />
        );
      }
      render(<Sub />);
      await user.keyboard("{Escape}");
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.queryByText("An answer")).toBeNull();
      expect(screen.getByRole("listbox")).toBeInTheDocument();
      await user.keyboard("{Escape}");
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    });
  });

  describe("server search", () => {
    it("holds the empty message back while loading and marks the body busy", () => {
      const { rerender } = render(<Harness commands={[]} loading />);
      expect(screen.queryByText(/No results/)).toBeNull();
      expect(document.querySelector('[aria-busy="true"]')).not.toBeNull();
      rerender(<Harness commands={[]} loading={false} />);
      expect(screen.getByText("No results for “”")).toBeInTheDocument();
      expect(document.querySelector('[aria-busy="true"]')).toBeNull();
    });

    it("lists what the server returned without filtering it again", async () => {
      const user = userEvent.setup();
      const onQueryChange = vi.fn();
      function Server() {
        const [rows, setRows] = useState<CommandItem[]>([]);
        return (
          <Harness
            commands={rows}
            filter={() => true}
            onQueryChange={(query) => {
              onQueryChange(query);
              setRows([{ key: "r1", label: `Record for ${query}`, onSelect: () => {} }]);
            }}
          />
        );
      }
      render(<Server />);
      await user.type(field(), "ab");
      expect(onQueryChange).toHaveBeenLastCalledWith("ab");
      expect(screen.getByRole("option", { name: "Record for ab" })).toBeInTheDocument();
    });
  });
});
