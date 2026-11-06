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

  it("has no axe violations", async () => {
    const { container } = render(<SegmentedToggle label="View" options={options} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
