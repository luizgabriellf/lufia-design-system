import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { axe } from "../../test/axe";
import { SegmentedToggle, type SegmentedToggleOption } from "./SegmentedToggle";

const options: SegmentedToggleOption[] = [
  { value: "list", label: "List", icon: <svg data-testid="icon" /> },
  { value: "board", label: "Board" },
  { value: "calendar", label: "Calendar", disabled: true },
  { value: "map", label: "Map" },
];

describe("SegmentedToggle", () => {
  it("is a labelled radiogroup with one radio per option and the first enabled one chosen", () => {
    render(<SegmentedToggle label="View" options={options} />);
    expect(screen.getByRole("radiogroup", { name: "View" })).toBeInTheDocument();
    const radios = screen.getAllByRole("radio");
    expect(radios.map((r) => r.getAttribute("aria-checked"))).toEqual(["true", "false", "false", "false"]);
    expect(radios.map((r) => r.tabIndex)).toEqual([0, -1, -1, -1]);
  });

  it("hides the icon from assistive technology", () => {
    render(<SegmentedToggle label="View" options={options} />);
    expect(screen.getByTestId("icon").parentElement).toHaveAttribute("aria-hidden", "true");
  });

  it("chooses on click and reports it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<SegmentedToggle label="View" options={options} onValueChange={onValueChange} />);
    await user.click(screen.getByRole("radio", { name: "Board" }));
    expect(onValueChange).toHaveBeenCalledWith("board");
    expect(screen.getByRole("radio", { name: "Board" })).toHaveAttribute("aria-checked", "true");
  });

  it("moves and chooses with the arrow keys, wrapping and skipping disabled segments", async () => {
    const user = userEvent.setup();
    render(<SegmentedToggle label="View" options={options} defaultValue="board" />);
    screen.getByRole("radio", { name: "Board" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Map" })).toHaveFocus();
    expect(screen.getByRole("radio", { name: "Map" })).toHaveAttribute("aria-checked", "true");
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "List" })).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("radio", { name: "Map" })).toHaveFocus();
  });

  it("follows a controlled value", async () => {
    const user = userEvent.setup();
    function Harness() {
      const [value, setValue] = useState("map");
      return <SegmentedToggle label="View" options={options} value={value} onValueChange={setValue} />;
    }
    render(<Harness />);
    expect(screen.getByRole("radio", { name: "Map" })).toHaveAttribute("aria-checked", "true");
    await user.click(screen.getByRole("radio", { name: "List" }));
    expect(screen.getByRole("radio", { name: "List" })).toHaveAttribute("aria-checked", "true");
  });

  it("disables every segment and ignores clicks", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<SegmentedToggle label="View" options={options} disabled onValueChange={onValueChange} />);
    screen.getAllByRole("radio").forEach((radio) => expect(radio).toBeDisabled());
    await user.click(screen.getByText("Board"));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("renders the sliding indicator, hidden from assistive technology", () => {
    const { container } = render(<SegmentedToggle label="View" options={options} />);
    const indicator = container.querySelector(".indicator");
    expect(indicator).toHaveAttribute("aria-hidden", "true");
  });

  it("submits the chosen value under name", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <form>
        <SegmentedToggle label="View" options={options} name="view" />
      </form>,
    );
    expect(container.querySelector('input[name="view"]')).toHaveValue("list");
    await user.click(screen.getByRole("radio", { name: "Map" }));
    expect(container.querySelector('input[name="view"]')).toHaveValue("map");
  });

  it("reverses Left and Right in a right-to-left layout", async () => {
    const user = userEvent.setup();
    render(
      <SegmentedToggle label="View" options={options} defaultValue="list" style={{ direction: "rtl" }} />,
    );
    screen.getByRole("radio", { name: "List" }).focus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("radio", { name: "Board" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "List" })).toHaveFocus();
  });

  it("goes back to its default when the form is reset", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <form>
        <SegmentedToggle label="View" options={options} name="view" defaultValue="board" />
        <button type="reset">Reset</button>
      </form>,
    );
    await user.click(screen.getByRole("radio", { name: "Map" }));
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByRole("radio", { name: "Board" })).toHaveAttribute("aria-checked", "true");
    expect(container.querySelector('input[name="view"]')).toHaveValue("board");
  });

  it("dispatches bubbling input and change events to the form for a click and for an arrow key", async () => {
    const user = userEvent.setup();
    const seen: string[] = [];
    render(
      <form
        ref={(form) => {
          for (const type of ["input", "change"]) {
            form?.addEventListener(type, (event) => {
              const target = event.target as HTMLInputElement;
              seen.push(`${event.type}:${target.name}=${target.value}`);
            });
          }
        }}
      >
        <SegmentedToggle label="View" options={options} name="view" defaultValue="list" />
        <button type="reset">Reset</button>
      </form>,
    );
    await user.click(screen.getByRole("radio", { name: "Board" }));
    expect(seen).toEqual(["input:view=board", "change:view=board"]);
    await user.keyboard("{ArrowRight}");
    expect(seen.slice(2)).toEqual(["input:view=map", "change:view=map"]);
    await user.click(screen.getByRole("radio", { name: "Map" }));
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(seen).toHaveLength(4);
  });

  it("dispatches from the group when it has no name, and not when the parent sets the value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const ui = (value: string, onValueChange?: (v: string) => void) => (
      <form ref={(form) => form?.addEventListener("change", onChange)}>
        <SegmentedToggle label="View" options={options} value={value} onValueChange={onValueChange} />
      </form>
    );
    const { rerender } = render(ui("list"));
    rerender(ui("board"));
    expect(onChange).not.toHaveBeenCalled();
    function Parent() {
      const [value, setValue] = useState("list");
      return ui(value, setValue);
    }
    render(<Parent />);
    await user.click(screen.getAllByRole("radio", { name: "Map" })[1]!);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("resets to the latest default after a form action changes it", async () => {
    const user = userEvent.setup();
    function View() {
      const [initial, setInitial] = useState("list");
      return (
        <form action={() => setInitial("map")}>
          <SegmentedToggle label="View" options={options} defaultValue={initial} />
          <button type="submit">Save</button>
        </form>
      );
    }
    render(<View />);
    await user.click(screen.getByRole("radio", { name: "Board" }));
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByRole("radio", { name: "Map" })).toHaveAttribute("aria-checked", "true");
  });

  describe("unset value", () => {
    const checked = () => screen.getAllByRole("radio").map((r) => r.getAttribute("aria-checked"));

    it("checks nothing and keeps the first enabled segment as the one tab stop", () => {
      render(<SegmentedToggle label="View" options={options} value={null} />);
      expect(checked()).toEqual(["false", "false", "false", "false"]);
      expect(screen.getAllByRole("radio").map((r) => r.tabIndex)).toEqual([0, -1, -1, -1]);
      expect(screen.getByRole("radiogroup")).toHaveAttribute("data-unset");
    });

    it("has no data-unset when a value is chosen", () => {
      render(<SegmentedToggle label="View" options={options} value="board" />);
      expect(screen.getByRole("radiogroup")).not.toHaveAttribute("data-unset");
    });

    it("keeps the indicator hidden until something is chosen", async () => {
      const user = userEvent.setup();
      function Harness() {
        const [value, setValue] = useState<string | null>(null);
        return <SegmentedToggle label="View" options={options} value={value} onValueChange={setValue} />;
      }
      const { container } = render(<Harness />);
      const indicator = container.querySelector<HTMLElement>(".indicator")!;
      expect(indicator.hidden).toBe(true);
      await user.click(screen.getByRole("radio", { name: "Board" }));
      expect(indicator.hidden).toBe(false);
    });

    it("lets Tab enter on the first segment and an arrow key move focus and choose", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      function Harness() {
        const [value, setValue] = useState<string | null>(null);
        return (
          <SegmentedToggle
            label="View"
            options={options}
            value={value}
            onValueChange={(next) => {
              onValueChange(next);
              setValue(next);
            }}
          />
        );
      }
      render(<Harness />);
      await user.tab();
      expect(screen.getByRole("radio", { name: "List" })).toHaveFocus();
      await user.keyboard("{ArrowRight}");
      expect(screen.getByRole("radio", { name: "Board" })).toHaveFocus();
      expect(screen.getByRole("radio", { name: "Board" })).toHaveAttribute("aria-checked", "true");
      expect(onValueChange).toHaveBeenCalledWith("board");
    });

    it("keeps the default of the first enabled option when no value is given", () => {
      render(<SegmentedToggle label="View" options={options} />);
      expect(checked()).toEqual(["true", "false", "false", "false"]);
    });

    it("submits nothing under name while unset, and the value once chosen", async () => {
      const user = userEvent.setup();
      function Harness() {
        const [value, setValue] = useState<string | null>(null);
        return (
          <form data-testid="form">
            <SegmentedToggle
              label="View"
              options={options}
              name="view"
              value={value}
              onValueChange={setValue}
            />
          </form>
        );
      }
      render(<Harness />);
      const form = screen.getByTestId("form") as HTMLFormElement;
      expect(new FormData(form).has("view")).toBe(false);
      await user.click(screen.getByRole("radio", { name: "Map" }));
      expect(new FormData(form).get("view")).toBe("map");
    });
  });

  describe("allowDeselect", () => {
    it("calls onDeselect, not onValueChange, when the chosen segment is activated again", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const onDeselect = vi.fn();
      function Harness() {
        const [value, setValue] = useState<string | null>("board");
        return (
          <SegmentedToggle
            label="View"
            options={options}
            value={value}
            allowDeselect
            onValueChange={(next) => {
              onValueChange(next);
              setValue(next);
            }}
            onDeselect={() => {
              onDeselect();
              setValue(null);
            }}
          />
        );
      }
      render(<Harness />);
      await user.click(screen.getByRole("radio", { name: "Board" }));
      expect(onDeselect).toHaveBeenCalledTimes(1);
      expect(onValueChange).not.toHaveBeenCalled();
      expect(screen.getByRole("radio", { name: "Board" })).toHaveAttribute("aria-checked", "false");
      await user.click(screen.getByRole("radio", { name: "Board" }));
      expect(onValueChange).toHaveBeenCalledWith("board");
    });

    it("clears an uncontrolled toggle", async () => {
      const user = userEvent.setup();
      render(<SegmentedToggle label="View" options={options} defaultValue="board" allowDeselect />);
      await user.click(screen.getByRole("radio", { name: "Board" }));
      expect(screen.getByRole("radio", { name: "Board" })).toHaveAttribute("aria-checked", "false");
    });

    it("keeps reporting the chosen value without allowDeselect", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<SegmentedToggle label="View" options={options} value="board" onValueChange={onValueChange} />);
      await user.click(screen.getByRole("radio", { name: "Board" }));
      expect(onValueChange).toHaveBeenCalledWith("board");
    });
  });

  describe("tone and size", () => {
    const toned: SegmentedToggleOption[] = [
      { value: "pass", label: "Pass", tone: "success" },
      { value: "fail", label: "Fail", tone: "danger" },
      { value: "na", label: "N/A", tone: "neutral" },
    ];

    it("marks each option with its tone and the indicator with the chosen one", () => {
      const { container } = render(<SegmentedToggle label="Result" options={toned} value="fail" />);
      expect(screen.getAllByRole("radio").map((r) => r.getAttribute("data-tone"))).toEqual([
        "success",
        "danger",
        "neutral",
      ]);
      expect(container.querySelector(".indicator")).toHaveAttribute("data-tone", "danger");
    });

    it("sets data-size on the group, md by default", () => {
      const { rerender } = render(<SegmentedToggle label="Result" options={toned} />);
      expect(screen.getByRole("radiogroup")).toHaveAttribute("data-size", "md");
      rerender(<SegmentedToggle label="Result" options={toned} size="sm" />);
      expect(screen.getByRole("radiogroup")).toHaveAttribute("data-size", "sm");
    });
  });

  describe("form reset to nothing chosen", () => {
    it("resets a controlled null value to null, not to the first option", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      function Harness() {
        const [value, setValue] = useState<string | null>(null);
        return (
          <form data-testid="form">
            <SegmentedToggle
              label="View"
              options={options}
              name="view"
              value={value}
              onValueChange={(next) => {
                onValueChange(next);
                setValue(next);
              }}
              onDeselect={() => setValue(null)}
            />
            <button type="reset">Reset</button>
          </form>
        );
      }
      render(<Harness />);
      await user.click(screen.getByRole("radio", { name: "Map" }));
      expect(new FormData(screen.getByTestId("form") as HTMLFormElement).get("view")).toBe("map");
      await user.click(screen.getByRole("button", { name: "Reset" }));
      expect(onValueChange).toHaveBeenCalledTimes(1);
      screen.getAllByRole("radio").forEach((radio) => expect(radio).toHaveAttribute("aria-checked", "false"));
      expect(new FormData(screen.getByTestId("form") as HTMLFormElement).has("view")).toBe(false);
    });

    it("does not report a deselect when a reset finds nothing chosen", async () => {
      const user = userEvent.setup();
      const onDeselect = vi.fn();
      render(
        <form>
          <SegmentedToggle label="View" options={options} name="view" value={null} onDeselect={onDeselect} />
          <button type="reset">Reset</button>
        </form>,
      );
      await user.click(screen.getByRole("button", { name: "Reset" }));
      expect(onDeselect).not.toHaveBeenCalled();
    });

    it("resets an uncontrolled defaultValue of null to nothing chosen", async () => {
      const user = userEvent.setup();
      render(
        <form data-testid="form">
          <SegmentedToggle label="View" options={options} name="view" defaultValue={null} />
          <button type="reset">Reset</button>
        </form>,
      );
      expect(screen.getByRole("radiogroup")).toHaveAttribute("data-unset");
      await user.click(screen.getByRole("radio", { name: "Board" }));
      await user.click(screen.getByRole("button", { name: "Reset" }));
      screen.getAllByRole("radio").forEach((radio) => expect(radio).toHaveAttribute("aria-checked", "false"));
      expect(new FormData(screen.getByTestId("form") as HTMLFormElement).has("view")).toBe(false);
    });
  });

  it("has no axe violations while unset", async () => {
    const { container } = render(<SegmentedToggle label="View" options={options} value={null} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations with a tone, a small size and a chosen value", async () => {
    const { container } = render(
      <SegmentedToggle
        label="Result"
        size="sm"
        allowDeselect
        value="fail"
        options={[
          { value: "pass", label: "Pass", tone: "success" },
          { value: "fail", label: "Fail", tone: "danger" },
        ]}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations", async () => {
    const { container } = render(<SegmentedToggle label="View" options={options} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
