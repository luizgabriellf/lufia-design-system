import { readFileSync } from "node:fs";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { axe } from "../../test/axe";
import { FormField } from "../FormField";
import { SearchInput } from "./SearchInput";

describe("SearchInput", () => {
  it("is a search box named by aria-label, or by its placeholder", () => {
    const { rerender } = render(<SearchInput aria-label="Find a customer" />);
    expect(screen.getByRole("searchbox", { name: "Find a customer" })).toBeInTheDocument();
    rerender(<SearchInput placeholder="Search customers" />);
    expect(screen.getByRole("searchbox", { name: "Search customers" })).toBeInTheDocument();
  });

  it("joins a FormField", () => {
    render(
      <FormField label="Customer" hint="Hint" error="Error">
        <SearchInput />
      </FormField>,
    );
    const box = screen.getByRole("searchbox", { name: "Customer" });
    expect(box).toHaveAccessibleDescription("Hint Error");
    expect(box).toBeInvalid();
  });

  it("reports every keystroke through onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<SearchInput aria-label="Search" onValueChange={onValueChange} />);
    await user.type(screen.getByRole("searchbox"), "ab");
    expect(onValueChange.mock.calls.map(([v]) => v)).toEqual(["a", "ab"]);
  });

  describe("debounced onSearch", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("fires once, after the quiet time, with the latest text", () => {
      const onSearch = vi.fn();
      render(<SearchInput aria-label="Search" onSearch={onSearch} debounceMs={200} />);
      const box = screen.getByRole("searchbox");
      fireEvent.change(box, { target: { value: "a" } });
      act(() => void vi.advanceTimersByTime(150));
      fireEvent.change(box, { target: { value: "ab" } });
      act(() => void vi.advanceTimersByTime(150));
      expect(onSearch).not.toHaveBeenCalled();
      act(() => void vi.advanceTimersByTime(60));
      expect(onSearch).toHaveBeenCalledTimes(1);
      expect(onSearch).toHaveBeenCalledWith("ab");
    });

    it("fires at once on Enter and not again for the same text", () => {
      const onSearch = vi.fn();
      render(<SearchInput aria-label="Search" onSearch={onSearch} />);
      const box = screen.getByRole("searchbox");
      fireEvent.change(box, { target: { value: "pump" } });
      fireEvent.keyDown(box, { key: "Enter" });
      expect(onSearch).toHaveBeenCalledWith("pump");
      act(() => void vi.advanceTimersByTime(1000));
      expect(onSearch).toHaveBeenCalledTimes(1);
    });

    it("does not fire for the initial value or after unmount", () => {
      const onSearch = vi.fn();
      const { unmount } = render(
        <SearchInput aria-label="Search" defaultValue="start" onSearch={onSearch} />,
      );
      fireEvent.change(screen.getByRole("searchbox"), { target: { value: "x" } });
      unmount();
      act(() => void vi.advanceTimersByTime(1000));
      expect(onSearch).not.toHaveBeenCalled();
    });
  });

  it("shows a clear button only with text, clears at once, searches for empty and refocuses", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchInput aria-label="Search" clearLabel="Clear" defaultValue="pump" onSearch={onSearch} />);
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.getByRole("searchbox")).toHaveValue("");
    expect(screen.getByRole("searchbox")).toHaveFocus();
    expect(onSearch).toHaveBeenCalledWith("");
    expect(screen.queryByRole("button", { name: "Clear" })).not.toBeInTheDocument();
  });

  it("clears on Escape when there is text, and lets Escape through when there is none", () => {
    const { container } = render(<SearchInput aria-label="Search" defaultValue="pump" />);
    const box = screen.getByRole("searchbox");
    const first = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
    act(() => void box.dispatchEvent(first));
    expect(first.defaultPrevented).toBe(true);
    expect(box).toHaveValue("");
    const second = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
    act(() => void box.dispatchEvent(second));
    expect(second.defaultPrevented).toBe(false);
    expect(container).toBeInTheDocument();
  });

  it("works controlled", async () => {
    const user = userEvent.setup();
    function Harness() {
      const [value, setValue] = useState("one");
      return <SearchInput aria-label="Search" value={value} onValueChange={setValue} />;
    }
    render(<Harness />);
    await user.type(screen.getByRole("searchbox"), "2");
    expect(screen.getByRole("searchbox")).toHaveValue("one2");
  });

  describe("controlled", () => {
    function Controlled({ extra }: { extra?: Record<string, unknown> }) {
      const [value, setValue] = useState("");
      return (
        <form>
          <SearchInput aria-label="Search" value={value} onValueChange={setValue} {...extra} />
          <output data-testid="state">{value}</output>
        </form>
      );
    }

    it("keeps what is typed when the parent keeps it in state", async () => {
      const user = userEvent.setup();
      render(<Controlled />);
      await user.type(screen.getByRole("searchbox"), "pump");
      expect(screen.getByRole("searchbox")).toHaveValue("pump");
      expect(screen.getByTestId("state")).toHaveTextContent("pump");
    });

    it("also reports the native change event through onChange, so value + onChange sticks", async () => {
      const user = userEvent.setup();
      function WithOnChange() {
        const [value, setValue] = useState("");
        return (
          <SearchInput aria-label="Search" value={value} onChange={(event) => setValue(event.target.value)} />
        );
      }
      render(<WithOnChange />);
      await user.type(screen.getByRole("searchbox"), "pump");
      expect(screen.getByRole("searchbox")).toHaveValue("pump");
    });

    it("calls onChange and onValueChange together", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onValueChange = vi.fn();
      render(<SearchInput aria-label="Search" onValueChange={onValueChange} onChange={onChange} />);
      await user.type(screen.getByRole("searchbox"), "a");
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onValueChange).toHaveBeenCalledWith("a");
    });

    it("clears through the clear button and reports it", async () => {
      const user = userEvent.setup();
      render(<Controlled extra={{ clearLabel: "Clear" }} />);
      await user.type(screen.getByRole("searchbox"), "pump");
      await user.click(screen.getByRole("button", { name: "Clear" }));
      expect(screen.getByRole("searchbox")).toHaveValue("");
      expect(screen.getByTestId("state")).toHaveTextContent("");
    });

    it("follows the parent when it sets the value", () => {
      const { rerender } = render(<SearchInput aria-label="Search" value="a" onValueChange={() => {}} />);
      rerender(<SearchInput aria-label="Search" value="b" onValueChange={() => {}} />);
      expect(screen.getByRole("searchbox")).toHaveValue("b");
    });

    it("keeps a controlled value on a form reset, and tells the parent the default", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <form>
          <SearchInput aria-label="Search" value="kept" onValueChange={onValueChange} />
          <button type="reset">Reset</button>
        </form>,
      );
      await user.click(screen.getByRole("button", { name: "Reset" }));
      expect(screen.getByRole("searchbox")).toHaveValue("kept");
      expect(onValueChange).toHaveBeenCalledWith("");
    });
  });

  it("shows the shortcut hint only while empty and idle", async () => {
    const user = userEvent.setup();
    render(<SearchInput aria-label="Search" shortcut="/" />);
    expect(screen.getByText("/")).toBeInTheDocument();
    await user.type(screen.getByRole("searchbox"), "a");
    expect(screen.queryByText("/")).not.toBeInTheDocument();
  });

  it("announces a running search", () => {
    render(<SearchInput aria-label="Search" loading loadingLabel="Searching customers" shortcut="/" />);
    expect(screen.getByRole("status")).toHaveTextContent("Searching customers");
    expect(screen.getByRole("searchbox")).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByText("/")).not.toBeInTheDocument();
  });

  it("hides the clear button when read-only or disabled", () => {
    const { rerender } = render(<SearchInput aria-label="Search" defaultValue="x" readOnly />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    rerender(<SearchInput aria-label="Search" defaultValue="x" disabled />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("does not search twice for the same text", () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();
    render(<SearchInput aria-label="Search" onSearch={onSearch} debounceMs={100} />);
    const box = screen.getByRole("searchbox");
    fireEvent.change(box, { target: { value: "pump" } });
    act(() => void vi.advanceTimersByTime(150));
    fireEvent.change(box, { target: { value: "pumpx" } });
    fireEvent.change(box, { target: { value: "pump" } });
    act(() => void vi.advanceTimersByTime(150));
    fireEvent.keyDown(box, { key: "Enter" });
    expect(onSearch).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("does not take an id for a name: the placeholder names the box instead", () => {
    render(<SearchInput id="q" placeholder="Search customers" />);
    expect(screen.getByRole("searchbox")).toHaveAccessibleName("Search customers");
  });

  it("goes back to its default when the form is reset", async () => {
    const user = userEvent.setup();
    render(
      <form>
        <SearchInput aria-label="Search" defaultValue="start" />
        <button type="reset">Reset</button>
      </form>,
    );
    await user.type(screen.getByRole("searchbox"), "ed");
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByRole("searchbox")).toHaveValue("start");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <FormField label="Customer" hint="Hint">
        <SearchInput defaultValue="pump" shortcut="/" />
      </FormField>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  describe("as a direct child of a grid or flex form", () => {
    it("has no axe violations in a grid host", async () => {
      const { container } = render(
        <form style={{ display: "grid", gridTemplateColumns: "1fr" }}>
          <SearchInput aria-label="Search customers" />
          <button type="submit">Search</button>
        </form>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });

    it("declares a width floor and leaves the shared full-width box alone, so a grid track is filled", () => {
      const own = readFileSync("src/components/SearchInput/SearchInput.module.css", "utf8");
      const shared = readFileSync("src/components/FormField/fieldControl.module.css", "utf8");
      const box = /\.box\s*\{([^}]*)\}/.exec(own)?.[1] ?? "";
      expect(box).toMatch(/min-inline-size:\s*8rem;/);
      // The box must not set its own width: the shared box already fills its track with `inline-size: 100%`.
      expect(box).not.toMatch(/(^|[\s;])(inline-size|width):/);
      expect(/\.box\s*\{([^}]*)\}/.exec(shared)?.[1]).toMatch(/inline-size:\s*100%;/);
    });
  });
});
