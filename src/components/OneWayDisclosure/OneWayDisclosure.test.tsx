import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { axe } from "../../test/axe";
import { OneWayDisclosure } from "./OneWayDisclosure";

const button = () => document.querySelector("button")!;

describe("OneWayDisclosure", () => {
  it("starts closed: the button shows and the content is hidden", () => {
    render(<OneWayDisclosure trigger="Fill in now">Form</OneWayDisclosure>);
    expect(screen.getByRole("button", { name: "Fill in now" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Form")).not.toBeVisible();
  });

  it("points aria-controls at the content", () => {
    render(<OneWayDisclosure trigger="Fill in now">Form</OneWayDisclosure>);
    const controlled = document.getElementById(button().getAttribute("aria-controls")!);
    expect(controlled).toHaveTextContent("Form");
  });

  it("shows the content, hides the button and moves focus into the content on activation", async () => {
    const user = userEvent.setup();
    render(
      <OneWayDisclosure trigger="Fill in now" label="Details">
        <input aria-label="Name" />
      </OneWayDisclosure>,
    );
    await user.tab();
    expect(button()).toHaveFocus();
    await user.keyboard("{Enter}");
    const region = screen.getByRole("region", { name: "Details" });
    expect(region).toBeVisible();
    expect(region).toHaveFocus();
    expect(button()).not.toBeVisible();
    expect(button()).toHaveAttribute("aria-expanded", "true");
    // Focus did not fall back to the body: Tab continues from inside the content.
    await user.tab();
    expect(screen.getByLabelText("Name")).toHaveFocus();
  });

  it("does not move focus on first render, even when it starts open", () => {
    render(
      <OneWayDisclosure trigger="Fill in now" defaultOpen label="Details">
        Form
      </OneWayDisclosure>,
    );
    expect(screen.getByRole("region")).toBeVisible();
    expect(screen.getByRole("region")).not.toHaveFocus();
    expect(document.body).toHaveFocus();
  });

  it("exposes a region only when it has a name", () => {
    const { rerender } = render(
      <OneWayDisclosure trigger="Go" defaultOpen>
        Form
      </OneWayDisclosure>,
    );
    expect(screen.queryByRole("region")).toBeNull();
    rerender(
      <OneWayDisclosure trigger="Go" defaultOpen label="Details">
        Form
      </OneWayDisclosure>,
    );
    expect(screen.getByRole("region", { name: "Details" })).toBeInTheDocument();
  });

  it("stays closed in controlled mode until the app opens it, then moves focus", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <OneWayDisclosure trigger="Go" open={false} onOpenChange={onOpenChange} label="Details">
        Form
      </OneWayDisclosure>,
    );
    await user.click(button());
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("region")).toBeNull();
    rerender(
      <OneWayDisclosure trigger="Go" open onOpenChange={onOpenChange} label="Details">
        Form
      </OneWayDisclosure>,
    );
    expect(screen.getByRole("region", { name: "Details" })).toHaveFocus();
  });

  it("brings the button back when the app closes it", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <OneWayDisclosure trigger="Go" open={open} onOpenChange={setOpen}>
          <button type="button" onClick={() => setOpen(false)}>
            Undo
          </button>
        </OneWayDisclosure>
      );
    }
    render(<Controlled />);
    await user.click(screen.getByRole("button", { name: "Go" }));
    expect(screen.queryByRole("button", { name: "Go" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(screen.getByRole("button", { name: "Go" })).toHaveAttribute("aria-expanded", "false");
  });

  it("forwards className and rest props to the root and the class to the panel", () => {
    const { container } = render(
      <OneWayDisclosure trigger="Go" className="mine" panelClassName="inner" data-testid="root">
        Form
      </OneWayDisclosure>,
    );
    expect(screen.getByTestId("root")).toHaveClass("mine");
    expect(container.querySelector(".inner")).toHaveTextContent("Form");
  });

  it("has no axe violations closed, open and named", async () => {
    const { container, rerender } = render(<OneWayDisclosure trigger="Fill in now">Form</OneWayDisclosure>);
    expect(await axe(container)).toHaveNoViolations();
    rerender(
      <OneWayDisclosure trigger="Fill in now" defaultOpen label="Details">
        <p>Form</p>
      </OneWayDisclosure>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
