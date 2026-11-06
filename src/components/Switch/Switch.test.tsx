import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { axe } from "../../test/axe";
import { Switch } from "./Switch";

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

  it("has no axe violations", async () => {
    const { container } = render(<Switch label="Alerts" hint="Hint" error="Error" defaultChecked />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
