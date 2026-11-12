import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { axe } from "../../test/axe";
import { FormField } from "../FormField";
import { DateField, type DateFieldType } from "./DateField";

const TYPES: readonly DateFieldType[] = ["date", "time", "datetime-local", "month"];
const SAMPLE: Record<DateFieldType, string> = {
  date: "2030-01-31",
  time: "14:30",
  "datetime-local": "2030-01-31T14:30",
  month: "2030-01",
};

afterEach(() => {
  vi.unstubAllGlobals();
  delete (HTMLInputElement.prototype as { showPicker?: unknown }).showPicker;
});

describe("DateField", () => {
  it.each(TYPES)("renders a native %s input in the field box", (type) => {
    const { container } = render(<DateField type={type} aria-label="When" defaultValue={SAMPLE[type]} />);
    const input = container.querySelector("input")!;
    expect(input).toHaveAttribute("type", type);
    expect(input).toHaveValue(SAMPLE[type]);
    expect(input.parentElement).toHaveAttribute("data-type", type);
  });

  it("defaults to a date input and passes min, max, step, name and required on", () => {
    const { container } = render(
      <DateField aria-label="When" min="2030-01-01" max="2030-12-31" step={7} name="when" required />,
    );
    const input = container.querySelector("input")!;
    expect(input).toHaveAttribute("type", "date");
    expect(input).toHaveAttribute("min", "2030-01-01");
    expect(input).toHaveAttribute("max", "2030-12-31");
    expect(input).toHaveAttribute("step", "7");
    expect(input).toHaveAttribute("name", "when");
    expect(input).toBeRequired();
  });

  it("calls onValueChange with the string the control emits, uncontrolled and controlled", () => {
    const onValueChange = vi.fn();
    const { container, rerender } = render(<DateField aria-label="When" onValueChange={onValueChange} />);
    const input = container.querySelector("input")!;
    fireEvent.change(input, { target: { value: "2030-02-01" } });
    expect(onValueChange).toHaveBeenLastCalledWith("2030-02-01");
    expect(input).toHaveValue("2030-02-01");
    rerender(<DateField aria-label="When" value="2031-03-03" onValueChange={onValueChange} />);
    expect(input).toHaveValue("2031-03-03");
    fireEvent.change(input, { target: { value: "2032-04-04" } });
    expect(onValueChange).toHaveBeenLastCalledWith("2032-04-04");
    expect(input).toHaveValue("2031-03-03");
  });

  it("forwards the ref, the native onChange and the rest props to the input", () => {
    const ref = createRef<HTMLInputElement>();
    const onChange = vi.fn();
    render(<DateField ref={ref} aria-label="When" onChange={onChange} data-testid="in" className="mine" />);
    expect(ref.current).toBe(screen.getByTestId("in"));
    fireEvent.change(ref.current!, { target: { value: "2030-02-01" } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(ref.current!.parentElement).toHaveClass("mine");
  });

  it("takes its id, description, invalid and required state from a FormField", () => {
    render(
      <FormField label="Start" hint="Pick a day" error="Too early" required>
        <DateField />
      </FormField>,
    );
    const input = screen.getByLabelText(/Start/);
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Pick a day Too early");
  });

  it("keeps aria-required and no native required with nativeRequired={false}", () => {
    render(
      <FormField label="Start" required nativeRequired={false}>
        <DateField />
      </FormField>,
    );
    const input = screen.getByLabelText(/Start/);
    expect(input).not.toHaveAttribute("required");
    expect(input).toHaveAttribute("aria-required", "true");
  });

  it("exposes invalid, disabled and read-only on the box and the control", () => {
    const { container } = render(<DateField aria-label="When" invalid disabled readOnly />);
    const box = container.firstElementChild!;
    expect(box).toHaveAttribute("data-invalid");
    expect(box).toHaveAttribute("data-disabled");
    expect(box).toHaveAttribute("data-readonly");
    expect(container.querySelector("input")).toHaveAttribute("aria-invalid", "true");
  });

  it("marks an empty control so its height and colour can be kept", () => {
    const { container, rerender } = render(<DateField aria-label="When" />);
    expect(container.querySelector("input")).toHaveAttribute("data-empty");
    rerender(<DateField aria-label="When" value="2030-01-31" />);
    expect(container.querySelector("input")).not.toHaveAttribute("data-empty");
  });

  describe("clear button", () => {
    it("is absent without clearLabel", () => {
      render(<DateField aria-label="When" defaultValue="2030-01-31" />);
      expect(screen.queryByRole("button")).toBeNull();
    });

    it("clears the value, reports it and returns focus to the input", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <DateField
          aria-label="When"
          defaultValue="2030-01-31"
          clearLabel="Clear date"
          onValueChange={onValueChange}
        />,
      );
      await user.click(screen.getByRole("button", { name: "Clear date" }));
      expect(onValueChange).toHaveBeenCalledWith("");
      expect(screen.getByLabelText("When")).toHaveValue("");
      expect(screen.getByLabelText("When")).toHaveFocus();
      expect(screen.queryByRole("button")).toBeNull();
    });

    it("is an edit: native onChange, bubbling input and change events, and one onValueChange", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const onChange = vi.fn();
      const events: string[] = [];
      const { container } = render(
        <form onInput={() => events.push("input")} onChangeCapture={() => events.push("react-change")}>
          <DateField
            aria-label="When"
            name="when"
            defaultValue="2030-01-31"
            clearLabel="Clear date"
            onValueChange={onValueChange}
            onChange={onChange}
          />
        </form>,
      );
      const form = container.querySelector("form")!;
      form.addEventListener("change", () => events.push("native-change"));
      await user.click(screen.getByRole("button", { name: "Clear date" }));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0]![0].target.value).toBe("");
      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange).toHaveBeenCalledWith("");
      expect(events).toContain("native-change");
      expect(events).toContain("input");
      expect(new FormData(form).get("when")).toBe("");
    });

    it("shows only with a value, and never when required, disabled or read-only", () => {
      const { rerender } = render(<DateField aria-label="When" clearLabel="Clear" />);
      expect(screen.queryByRole("button")).toBeNull();
      rerender(<DateField aria-label="When" clearLabel="Clear" value="2030-01-31" />);
      expect(screen.getByRole("button", { name: "Clear" })).toBeInTheDocument();
      rerender(<DateField aria-label="When" clearLabel="Clear" value="2030-01-31" required />);
      expect(screen.queryByRole("button")).toBeNull();
      rerender(<DateField aria-label="When" clearLabel="Clear" value="2030-01-31" disabled />);
      expect(screen.queryByRole("button")).toBeNull();
      rerender(<DateField aria-label="When" clearLabel="Clear" value="2030-01-31" readOnly />);
      expect(screen.queryByRole("button")).toBeNull();
    });

    it("is hidden for a field that is required without native required", () => {
      render(
        <FormField label="Start" required nativeRequired={false}>
          <DateField clearLabel="Clear" defaultValue="2030-01-31" />
        </FormField>,
      );
      expect(screen.queryByRole("button")).toBeNull();
    });
  });

  it("returns to its default value when the form is reset", () => {
    const { container } = render(
      <form>
        <DateField aria-label="When" defaultValue="2030-01-31" />
        <button type="reset">Reset</button>
      </form>,
    );
    const input = container.querySelector("input")!;
    fireEvent.change(input, { target: { value: "2031-02-02" } });
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(input).toHaveValue("2030-01-31");
  });

  describe("package icon and the native picker", () => {
    it("keeps the native indicator and draws no icon where the picker cannot be opened from a script", () => {
      const { container } = render(<DateField aria-label="When" />);
      expect(container.querySelector("[data-lufia-icon]")).toBeNull();
      expect(container.querySelector("input")).not.toHaveAttribute("data-picker-icon");
    });

    it("keeps the native indicator when the browser downgraded the control type", () => {
      (HTMLInputElement.prototype as { showPicker?: unknown }).showPicker = vi.fn();
      vi.stubGlobal("CSS", { supports: () => true });
      vi.spyOn(HTMLInputElement.prototype, "type", "get").mockReturnValue("text");
      const { container } = render(<DateField aria-label="When" type="month" />);
      expect(container.querySelector("[data-lufia-icon]")).toBeNull();
      expect(container.querySelector("input")).not.toHaveAttribute("data-picker-icon");
      vi.restoreAllMocks();
    });

    it("needs both showPicker and the indicator pseudo-element before it takes over", () => {
      (HTMLInputElement.prototype as { showPicker?: unknown }).showPicker = vi.fn();
      vi.stubGlobal("CSS", { supports: () => false });
      const { container } = render(<DateField aria-label="When" />);
      expect(container.querySelector("[data-lufia-icon]")).toBeNull();
    });

    it("draws the calendar or clock icon and opens the picker on click when it is supported", async () => {
      const user = userEvent.setup();
      const showPicker = vi.fn();
      (HTMLInputElement.prototype as { showPicker?: unknown }).showPicker = showPicker;
      vi.stubGlobal("CSS", { supports: () => true });
      const { container, rerender } = render(<DateField aria-label="When" />);
      const icon = container.querySelector("[aria-hidden='true'] [data-lufia-icon]")!;
      expect(icon).not.toBeNull();
      expect(container.querySelector("input")).toHaveAttribute("data-picker-icon");
      const calendar = icon.getAttribute("data-lufia-icon");
      await user.click(icon);
      expect(showPicker).toHaveBeenCalledTimes(1);
      rerender(<DateField aria-label="When" type="time" />);
      expect(
        container.querySelector("[aria-hidden='true'] [data-lufia-icon]")!.getAttribute("data-lufia-icon"),
      ).not.toBe(calendar);
    });

    it("does not open the picker of a disabled or read-only field, and survives a refusal", async () => {
      const user = userEvent.setup();
      const showPicker = vi.fn(() => {
        throw new DOMException("no activation", "NotAllowedError");
      });
      (HTMLInputElement.prototype as { showPicker?: unknown }).showPicker = showPicker;
      vi.stubGlobal("CSS", { supports: () => true });
      const { container, rerender } = render(<DateField aria-label="When" readOnly />);
      await user.click(container.querySelector("[data-lufia-icon]")!);
      expect(showPicker).not.toHaveBeenCalled();
      rerender(<DateField aria-label="When" />);
      await user.click(container.querySelector("[data-lufia-icon]")!);
      expect(showPicker).toHaveBeenCalledTimes(1);
    });
  });

  it("pins the platform-dependent styles that keep an empty control tall and start-aligned", () => {
    const css = readFileSync(resolve(__dirname, "DateField.module.css"), "utf8");
    const native = /\.native\s*\{([^}]*)\}/.exec(css)?.[1] ?? "";
    expect(native).toMatch(/min-block-size:\s*calc\(var\(--lufia-target-touch, 2\.75rem\)/);
    expect(native).toMatch(/appearance:\s*none/);
    expect(native).toMatch(/text-align:\s*start/);
    expect(css).toMatch(/::-webkit-date-and-time-value\s*\{[^}]*min-block-size/);
    // The native indicator is hidden only when the component has confirmed it can open the picker itself.
    expect(css).toMatch(
      /\.native\[data-picker-icon\]::-webkit-calendar-picker-indicator\s*\{[^}]*display:\s*none/,
    );
    expect(css).not.toMatch(/\n\.native::-webkit-calendar-picker-indicator\s*\{[^}]*display:\s*none/);
  });

  it("works controlled from state", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = useState("2030-01-31");
      return <DateField aria-label="When" value={value} onValueChange={setValue} clearLabel="Clear" />;
    }
    render(<Controlled />);
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.getByLabelText("When")).toHaveValue("");
  });

  it("has no axe violations in any type, state or inside a FormField", async () => {
    for (const type of TYPES) {
      const { container, unmount } = render(
        <FormField label="When" hint="Local time" error="Invalid" required>
          <DateField type={type} defaultValue={SAMPLE[type]} clearLabel="Clear" />
        </FormField>,
      );
      expect(await axe(container)).toHaveNoViolations();
      unmount();
    }
    const { container } = render(
      <>
        <DateField aria-label="Disabled" disabled />
        <DateField aria-label="Read only" readOnly defaultValue="2030-01-31" />
        <DateField aria-label="Clearable" defaultValue="2030-01-31" clearLabel="Clear" />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
