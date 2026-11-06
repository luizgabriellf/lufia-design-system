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
});
