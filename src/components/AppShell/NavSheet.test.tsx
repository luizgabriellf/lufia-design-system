import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { axe } from "../../test/axe";
import { mockReducedMotion } from "../../test/motion";
import { NavSheet } from "./NavSheet";

function Harness({ swipe = true, initial = false }: { swipe?: boolean; initial?: boolean }) {
  const [open, setOpen] = useState(initial);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open menu
      </button>
      <p>Page content</p>
      <NavSheet open={open} onOpenChange={setOpen} label="Menu" header={<b>Brand</b>} swipeToDismiss={swipe}>
        <a href="/one">One</a>
        <a href="/two">Two</a>
      </NavSheet>
    </>
  );
}

const sheet = () => screen.queryByRole("dialog", { name: "Menu" });

describe("NavSheet", () => {
  beforeEach(() => mockReducedMotion(true));
  afterEach(() => vi.unstubAllGlobals());

  it("renders nothing while closed", () => {
    render(<Harness />);
    expect(sheet()).toBeNull();
  });

  it("opens as a modal dialog and puts focus on the sheet itself", async () => {
    render(<Harness />);
    await userEvent.setup().click(screen.getByRole("button", { name: "Open menu" }));
    const dialog = sheet()!;
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveFocus();
  });

  it("makes the rest of the page inert while open and restores it after", async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(container).toHaveAttribute("inert");
    await user.keyboard("{Escape}");
    expect(container).not.toHaveAttribute("inert");
  });

  it("closes on Escape and returns focus to the opener", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.keyboard("{Escape}");
    await waitFor(() => expect(sheet()).toBeNull());
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveFocus();
  });

  it("closes from the close button and from a click on the dimmed page", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(sheet()).toBeNull());
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const backdrop = document.querySelector<HTMLElement>('[aria-hidden="true"][class*="backdrop"]')!;
    await user.click(backdrop);
    await waitFor(() => expect(sheet()).toBeNull());
  });

  it("keeps Tab inside the sheet", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.tab();
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: "One" })).toHaveFocus();
    await user.tab();
    await user.tab();
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
  });

  describe("swipe to dismiss", () => {
    const grabber = () => document.querySelector<HTMLElement>("[data-swipe]")!;
    const drag = (to: number, steps = 4) => {
      fireEvent.pointerDown(grabber(), { pointerId: 1, clientY: 100, button: 0, pointerType: "touch" });
      for (let i = 1; i <= steps; i += 1) {
        fireEvent.pointerMove(grabber(), {
          pointerId: 1,
          clientY: 100 + (to * i) / steps,
          pointerType: "touch",
        });
      }
      return () => fireEvent.pointerUp(grabber(), { pointerId: 1, clientY: 100 + to, pointerType: "touch" });
    };

    it("follows the finger and dismisses past the threshold", async () => {
      render(<Harness initial />);
      const release = drag(200);
      expect(sheet()).toHaveAttribute("data-dragging", "true");
      expect(sheet()!.style.getPropertyValue("--lufia-sheet-drag")).toBe("200px");
      act(() => release());
      await waitFor(() => expect(sheet()).toBeNull());
    });

    it("springs back after a short drag", () => {
      render(<Harness initial />);
      const release = drag(20);
      act(() => release());
      expect(sheet()).not.toBeNull();
      expect(sheet()).not.toHaveAttribute("data-dragging");
      expect(sheet()!.style.getPropertyValue("--lufia-sheet-drag")).toBe("0px");
    });

    it("never moves up", () => {
      render(<Harness initial />);
      drag(-80);
      expect(sheet()!.style.getPropertyValue("--lufia-sheet-drag")).not.toMatch(/^[1-9]/);
    });

    it("leaves the close button to its own click", async () => {
      render(<Harness initial />);
      fireEvent.pointerDown(screen.getByRole("button", { name: "Close" }), {
        pointerId: 1,
        clientY: 100,
        button: 0,
      });
      fireEvent.pointerMove(grabber(), { pointerId: 1, clientY: 400 });
      expect(sheet()).not.toHaveAttribute("data-dragging");
    });

    it("is off when swipeToDismiss is false", () => {
      render(<Harness initial swipe={false} />);
      expect(document.querySelector("[data-swipe]")).toBeNull();
    });
  });

  it("waits for the exit animation unless motion is reduced", async () => {
    mockReducedMotion(false);
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.keyboard("{Escape}");
    // Without a stylesheet there is no animation, so it unmounts on the next frame.
    await waitFor(() => expect(sheet()).toBeNull());
  });

  it("has no axe violations open", async () => {
    render(<Harness initial />);
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
