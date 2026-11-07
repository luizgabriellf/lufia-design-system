import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { axe } from "../../test/axe";
import { Switch } from "./Switch";
import { SwitchInput, resetControlledWarning } from "./SwitchInput";

describe("Switch", () => {
  it("is a switch button named by its label, off by default", () => {
    render(<Switch label="Email alerts" />);
    const control = screen.getByRole("switch", { name: "Email alerts" });
    expect(control.tagName).toBe("BUTTON");
    expect(control).toHaveAttribute("aria-checked", "false");
  });

  it("toggles with a click, Space and Enter, and through its label", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Switch label="Email alerts" onCheckedChange={onCheckedChange} />);
    const control = screen.getByRole("switch");
    await user.click(control);
    expect(control).toHaveAttribute("aria-checked", "true");
    control.focus();
    await user.keyboard(" ");
    expect(control).toHaveAttribute("aria-checked", "false");
    await user.keyboard("{Enter}");
    expect(control).toHaveAttribute("aria-checked", "true");
    await user.click(screen.getByText("Email alerts"));
    expect(control).toHaveAttribute("aria-checked", "false");
    expect(onCheckedChange.mock.calls.map(([value]) => value)).toEqual([true, false, true, false]);
  });

  it("follows a controlled value and lets the parent refuse the change", async () => {
    const user = userEvent.setup();
    render(<Switch label="Locked on" checked onCheckedChange={() => {}} />);
    await user.click(screen.getByRole("switch"));
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("works controlled with state", async () => {
    const user = userEvent.setup();
    function Harness() {
      const [on, setOn] = useState(true);
      return <Switch label="Dark mode" checked={on} onCheckedChange={setOn} />;
    }
    render(<Harness />);
    await user.click(screen.getByRole("switch"));
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  });

  it("submits name=value only while on", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <form>
        <Switch label="Alerts" name="alerts" />
      </form>,
    );
    expect(container.querySelector('input[name="alerts"]')).toBeNull();
    await user.click(screen.getByRole("switch"));
    expect(container.querySelector('input[name="alerts"]')).toHaveValue("on");
  });

  it("does not toggle when disabled", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Switch label="Alerts" disabled onCheckedChange={onCheckedChange} />);
    await user.click(screen.getByRole("switch"));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("describes the switch with its hint and error", () => {
    render(<Switch label="Alerts" hint="Sent once a day." error="Could not save." />);
    const control = screen.getByRole("switch");
    expect(control).toHaveAccessibleDescription("Sent once a day. Could not save.");
    expect(control).toBeInvalid();
  });

  it("goes back to its default when the form is reset", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <form>
        <Switch label="Alerts" name="alerts" defaultChecked />
        <button type="reset">Reset</button>
      </form>,
    );
    await user.click(screen.getByRole("switch"));
    expect(container.querySelector('input[name="alerts"]')).toBeNull();
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
    expect(container.querySelector('input[name="alerts"]')).toHaveValue("on");
  });

  it("resets to the latest default after a form action changes it", async () => {
    const user = userEvent.setup();
    function Settings() {
      const [initial, setInitial] = useState(false);
      return (
        <form action={() => setInitial(true)}>
          <Switch label="Alerts" defaultChecked={initial} />
          <button type="submit">Save</button>
        </form>
      );
    }
    render(<Settings />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("has no axe violations", async () => {
    const { container } = render(<Switch label="Alerts" hint="Hint" error="Error" defaultChecked />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("SwitchInput", () => {
  it("is a native checkbox with the switch role, off by default", () => {
    render(<SwitchInput label="Email alerts" name="alerts" />);
    const control = screen.getByRole("switch", { name: "Email alerts" });
    expect(control.tagName).toBe("INPUT");
    expect(control).toHaveAttribute("type", "checkbox");
    expect(control).not.toBeChecked();
  });

  it("is read from the form: name=value while on, nothing while off", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <form>
        <SwitchInput label="Alerts" name="alerts" value="yes" />
        <SwitchInput label="Digest" name="digest" defaultChecked />
      </form>,
    );
    const form = container.querySelector("form")!;
    expect(Object.fromEntries(new FormData(form))).toEqual({ digest: "on" });
    await user.click(screen.getByRole("switch", { name: "Alerts" }));
    expect(Object.fromEntries(new FormData(form))).toEqual({ alerts: "yes", digest: "on" });
    expect((form.elements.namedItem("alerts") as HTMLInputElement).checked).toBe(true);
  });

  it("toggles with Space and through its label, and reports the new state", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const onChange = vi.fn();
    render(<SwitchInput label="Alerts" onCheckedChange={onCheckedChange} onChange={onChange} />);
    const control = screen.getByRole("switch");
    control.focus();
    await user.keyboard(" ");
    expect(control).toBeChecked();
    await user.click(screen.getByText("Alerts"));
    expect(control).not.toBeChecked();
    expect(onCheckedChange.mock.calls.map(([value]) => value)).toEqual([true, false]);
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("follows a controlled value", async () => {
    const user = userEvent.setup();
    function Harness() {
      const [on, setOn] = useState(true);
      return <SwitchInput label="Dark mode" checked={on} onCheckedChange={setOn} />;
    }
    render(<Harness />);
    expect(screen.getByRole("switch")).toBeChecked();
    await user.click(screen.getByRole("switch"));
    expect(screen.getByRole("switch")).not.toBeChecked();
  });

  it("warns once in development when checked has no handler", () => {
    resetControlledWarning();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { rerender } = render(<SwitchInput label="A" checked />);
    rerender(<SwitchInput label="A" checked />);
    expect(warn).toHaveBeenCalledTimes(1);
    resetControlledWarning();
    render(<SwitchInput label="B" checked onCheckedChange={() => {}} />);
    render(<SwitchInput label="C" defaultChecked />);
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  it("goes back to its default when the form is reset", async () => {
    const user = userEvent.setup();
    render(
      <form>
        <SwitchInput label="Alerts" name="alerts" defaultChecked />
        <button type="reset">Reset</button>
      </form>,
    );
    await user.click(screen.getByRole("switch"));
    expect(screen.getByRole("switch")).not.toBeChecked();
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByRole("switch")).toBeChecked();
  });

  it("validates as a required checkbox and ignores clicks when disabled", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { container } = render(
      <form>
        <SwitchInput label="Terms" name="terms" required />
        <SwitchInput label="Off" disabled onCheckedChange={onCheckedChange} />
      </form>,
    );
    expect(container.querySelector("form")!.checkValidity()).toBe(false);
    await user.click(screen.getByRole("switch", { name: "Terms" }));
    expect(container.querySelector("form")!.checkValidity()).toBe(true);
    await user.click(screen.getByRole("switch", { name: "Off" }));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("describes the switch with its hint and error and passes className to the root", () => {
    const { container } = render(
      <SwitchInput label="Alerts" hint="Sent once a day." error="Could not save." className="extra" />,
    );
    const control = screen.getByRole("switch");
    expect(control).toHaveAccessibleDescription("Sent once a day. Could not save.");
    expect(control).toBeInvalid();
    expect(container.firstElementChild).toHaveClass("extra");
  });

  it("has no axe violations", async () => {
    const { container } = render(<SwitchInput label="Alerts" hint="Hint" error="Error" defaultChecked />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
