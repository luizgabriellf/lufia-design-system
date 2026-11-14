import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { axe } from "../../test/axe";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("is a native checkbox named by its label, and the label toggles it", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox label="Send me the report" name="report" onChange={onChange} />);
    const box = screen.getByRole("checkbox", { name: "Send me the report" });
    expect(box).toHaveAttribute("name", "report");
    await user.click(screen.getByText("Send me the report"));
    expect(box).toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(1);
    box.focus();
    await user.keyboard(" ");
    expect(box).not.toBeChecked();
  });

  it("marks the dense size for the stylesheet and leaves the default unmarked", () => {
    const { container, rerender } = render(<Checkbox label="Mine" />);
    expect(container.firstElementChild).not.toHaveAttribute("data-size");
    rerender(<Checkbox label="Mine" size="sm" />);
    expect(container.firstElementChild).toHaveAttribute("data-size", "sm");
  });

  it("supports the mixed state and clears it on the next render", () => {
    const { rerender } = render(<Checkbox label="All" indeterminate onChange={() => {}} />);
    const box = screen.getByRole("checkbox") as HTMLInputElement;
    expect(box.indeterminate).toBe(true);
    expect(box).toBePartiallyChecked();
    rerender(<Checkbox label="All" onChange={() => {}} />);
    expect(box.indeterminate).toBe(false);
  });

  it("forwards its ref to the input", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Checkbox label="A" ref={ref} />);
    expect(ref.current).toBe(screen.getByRole("checkbox"));
  });

  it("describes the checkbox with its hint and error and marks it invalid", () => {
    render(<Checkbox label="I agree" hint="You can withdraw later." error="Accept to continue." required />);
    const box = screen.getByRole("checkbox");
    expect(box).toHaveAccessibleDescription("You can withdraw later. Accept to continue.");
    expect(box).toBeInvalid();
    expect(box).toBeRequired();
    expect(screen.getByRole("alert")).toHaveTextContent("Accept to continue.");
  });

  it("does not toggle when disabled", async () => {
    const user = userEvent.setup();
    render(<Checkbox label="Locked" disabled />);
    await user.click(screen.getByText("Locked"));
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("has no axe violations", async () => {
    const { container } = render(<Checkbox label="I agree" hint="Hint" error="Error" required />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
