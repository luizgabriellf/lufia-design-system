import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { axe } from "../../test/axe";
import { DateRangeField } from "./DateRangeField";

const base = { legend: "Stay", startLabel: "From", endLabel: "To" };

describe("DateRangeField", () => {
  it("names the group with its legend and each end with its label", () => {
    render(<DateRangeField {...base} />);
    const group = screen.getByRole("group", { name: "Stay" });
    expect(group.tagName).toBe("FIELDSET");
    expect(screen.getByLabelText("From")).toHaveAttribute("type", "date");
    expect(screen.getByLabelText("To")).toHaveAttribute("type", "date");
    expect(group).toContainElement(screen.getByLabelText("To"));
  });

  it.each(["time", "datetime-local", "month"] as const)("uses the %s control for both ends", (type) => {
    render(<DateRangeField {...base} type={type} />);
    expect(screen.getByLabelText("From")).toHaveAttribute("type", type);
    expect(screen.getByLabelText("To")).toHaveAttribute("type", type);
  });

  it("holds the start at or below the end and the end at or above the start", () => {
    render(<DateRangeField {...base} defaultValue={{ start: "2030-01-10", end: "2030-01-20" }} />);
    expect(screen.getByLabelText("From")).toHaveAttribute("max", "2030-01-20");
    expect(screen.getByLabelText("To")).toHaveAttribute("min", "2030-01-10");
    fireEvent.change(screen.getByLabelText("To"), { target: { value: "2030-02-01" } });
    expect(screen.getByLabelText("From")).toHaveAttribute("max", "2030-02-01");
    fireEvent.change(screen.getByLabelText("From"), { target: { value: "2030-01-15" } });
    expect(screen.getByLabelText("To")).toHaveAttribute("min", "2030-01-15");
  });

  it("keeps the end just edited and moves the other end when the order would break, in one call", () => {
    const onValueChange = vi.fn();
    render(
      <DateRangeField
        {...base}
        defaultValue={{ start: "2030-01-10", end: "2030-01-20" }}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.change(screen.getByLabelText("From"), { target: { value: "2030-02-01" } });
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenLastCalledWith({ start: "2030-02-01", end: "2030-02-01" });
    expect(screen.getByLabelText("From")).toHaveValue("2030-02-01");
    expect(screen.getByLabelText("To")).toHaveValue("2030-02-01");
    fireEvent.change(screen.getByLabelText("To"), { target: { value: "2030-01-05" } });
    expect(onValueChange).toHaveBeenCalledTimes(2);
    expect(onValueChange).toHaveBeenLastCalledWith({ start: "2030-01-05", end: "2030-01-05" });
    expect(screen.getByLabelText("From")).toHaveValue("2030-01-05");
    expect(screen.getByLabelText("To")).toHaveValue("2030-01-05");
  });

  it("leaves an in-order edit, an equal pair and an empty end alone", () => {
    const onValueChange = vi.fn();
    render(
      <DateRangeField
        {...base}
        defaultValue={{ start: "2030-01-10", end: "" }}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.change(screen.getByLabelText("From"), { target: { value: "2030-05-01" } });
    expect(onValueChange).toHaveBeenLastCalledWith({ start: "2030-05-01", end: "" });
    fireEvent.change(screen.getByLabelText("To"), { target: { value: "2030-05-01" } });
    expect(onValueChange).toHaveBeenLastCalledWith({ start: "2030-05-01", end: "2030-05-01" });
  });

  it("corrects the order in controlled mode through the reported range", () => {
    const onValueChange = vi.fn();
    render(
      <DateRangeField
        {...base}
        value={{ start: "2030-01-10", end: "2030-01-20" }}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.change(screen.getByLabelText("To"), { target: { value: "2030-01-01" } });
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenLastCalledWith({ start: "2030-01-01", end: "2030-01-01" });
  });

  it("combines the cross-constraint with the range min and max, and sets none from an empty end", () => {
    const { rerender } = render(<DateRangeField {...base} min="2030-01-01" max="2030-12-31" />);
    expect(screen.getByLabelText("From")).toHaveAttribute("min", "2030-01-01");
    expect(screen.getByLabelText("From")).toHaveAttribute("max", "2030-12-31");
    expect(screen.getByLabelText("To")).toHaveAttribute("min", "2030-01-01");
    expect(screen.getByLabelText("To")).toHaveAttribute("max", "2030-12-31");
    rerender(
      <DateRangeField
        {...base}
        min="2030-01-01"
        max="2030-12-31"
        value={{ start: "2029-06-01", end: "2031-06-01" }}
      />,
    );
    expect(screen.getByLabelText("From")).toHaveAttribute("max", "2030-12-31");
    expect(screen.getByLabelText("To")).toHaveAttribute("min", "2030-01-01");
    rerender(<DateRangeField {...base} />);
    expect(screen.getByLabelText("From")).not.toHaveAttribute("max");
    expect(screen.getByLabelText("To")).not.toHaveAttribute("min");
  });

  it("reports the whole range on every change, uncontrolled and controlled", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(<DateRangeField {...base} onValueChange={onValueChange} />);
    fireEvent.change(screen.getByLabelText("From"), { target: { value: "2030-01-10" } });
    expect(onValueChange).toHaveBeenLastCalledWith({ start: "2030-01-10", end: "" });
    fireEvent.change(screen.getByLabelText("To"), { target: { value: "2030-01-20" } });
    expect(onValueChange).toHaveBeenLastCalledWith({ start: "2030-01-10", end: "2030-01-20" });
    rerender(
      <DateRangeField
        {...base}
        value={{ start: "2031-01-01", end: "2031-01-05" }}
        onValueChange={onValueChange}
      />,
    );
    expect(screen.getByLabelText("From")).toHaveValue("2031-01-01");
    fireEvent.change(screen.getByLabelText("To"), { target: { value: "2031-01-09" } });
    expect(onValueChange).toHaveBeenLastCalledWith({ start: "2031-01-01", end: "2031-01-09" });
    expect(screen.getByLabelText("To")).toHaveValue("2031-01-05");
  });

  it("puts startName and endName on the inputs", () => {
    render(<DateRangeField {...base} startName="from" endName="to" />);
    expect(screen.getByLabelText("From")).toHaveAttribute("name", "from");
    expect(screen.getByLabelText("To")).toHaveAttribute("name", "to");
  });

  it("returns both ends to their defaults on a form reset", () => {
    render(
      <form>
        <DateRangeField {...base} defaultValue={{ start: "2030-01-10", end: "2030-01-20" }} />
        <button type="reset">Reset</button>
      </form>,
    );
    fireEvent.change(screen.getByLabelText("From"), { target: { value: "2030-01-12" } });
    fireEvent.change(screen.getByLabelText("To"), { target: { value: "2030-01-25" } });
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByLabelText("From")).toHaveValue("2030-01-10");
    expect(screen.getByLabelText("To")).toHaveValue("2030-01-20");
  });

  it("links the hint and the error to the group and marks both ends invalid", () => {
    render(<DateRangeField {...base} hint="Up to 14 nights" error="Choose a shorter stay" />);
    expect(screen.getByRole("group", { name: "Stay" })).toHaveAccessibleDescription(
      "Up to 14 nights Choose a shorter stay",
    );
    expect(screen.getByLabelText("From")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("To")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("From")).toHaveAccessibleDescription("Choose a shorter stay");
    expect(screen.getByLabelText("To")).toHaveAccessibleDescription("Choose a shorter stay");
  });

  it("marks both ends required, with or without native required", () => {
    const { rerender } = render(<DateRangeField {...base} required />);
    expect(screen.getByLabelText(/From/)).toBeRequired();
    expect(screen.getByLabelText(/To/)).toBeRequired();
    rerender(<DateRangeField {...base} required nativeRequired={false} />);
    expect(screen.getByLabelText(/From/)).not.toHaveAttribute("required");
    expect(screen.getByLabelText(/From/)).toHaveAttribute("aria-required", "true");
  });

  it("disables the group and both ends", async () => {
    const user = userEvent.setup();
    render(<DateRangeField {...base} disabled />);
    expect(screen.getByRole("group", { name: "Stay" })).toBeDisabled();
    expect(screen.getByLabelText("From")).toBeDisabled();
    await user.tab();
    expect(screen.getByLabelText("From")).not.toHaveFocus();
  });

  it("forwards the ref, className and rest props to the fieldset", () => {
    const ref = createRef<HTMLFieldSetElement>();
    render(<DateRangeField {...base} ref={ref} className="mine" data-testid="range" />);
    expect(ref.current).toBe(screen.getByTestId("range"));
    expect(ref.current).toHaveClass("mine");
  });

  it("stacks the ends with a container-driven grid and lets the fieldset shrink", () => {
    const css = readFileSync(resolve(__dirname, "DateRangeField.module.css"), "utf8");
    expect(css).toMatch(/\.ends\s*\{[^}]*repeat\(auto-fit,\s*minmax\(min\(100%,\s*11rem\),\s*1fr\)\)/s);
    expect(css).toMatch(/\.root\s*\{[^}]*min-inline-size:\s*0/s);
  });

  it("has no axe violations, plain, required, invalid and disabled", async () => {
    const { container } = render(
      <>
        <DateRangeField {...base} />
        <DateRangeField {...base} required hint="Hint" error="Error" clearLabel="Clear" />
        <DateRangeField {...base} disabled type="month" />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
