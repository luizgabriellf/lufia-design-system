import { fireEvent, render, screen } from "@testing-library/react";
import { mockReducedMotion } from "../../test/motion";
import { NavSheet } from "./NavSheet";

function setup({ swipe = true, onOpenChange = vi.fn() } = {}) {
  const onLink = vi.fn();
  render(
    <NavSheet open onOpenChange={onOpenChange} label="Menu" swipeToDismiss={swipe}>
      <a href="/one" onClick={onLink}>
        One
      </a>
    </NavSheet>,
  );
  const panel = screen.getByRole("dialog", { name: "Menu" });
  const body = document.querySelector<HTMLElement>("[data-sheet-body]")!;
  return { panel, body, onOpenChange, onLink, link: screen.getByRole("link", { name: "One" }) };
}

const touch = (clientX: number, clientY: number) => ({ touches: [{ identifier: 1, clientX, clientY }] });
const lift = (clientX: number, clientY: number) => ({
  touches: [],
  changedTouches: [{ identifier: 1, clientX, clientY }],
});

function scrolledTo(element: HTMLElement, top: number) {
  Object.defineProperty(element, "scrollTop", { configurable: true, value: top });
}

describe("dragging the sheet down from its body", () => {
  beforeEach(() => mockReducedMotion(true));
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("follows the finger from the top of the body, and a long drag dismisses", () => {
    const { panel, body, onOpenChange } = setup();
    fireEvent.touchStart(body, touch(50, 100));
    fireEvent.touchMove(body, touch(50, 130));
    fireEvent.touchMove(body, touch(50, 190));
    expect(panel).toHaveAttribute("data-dragging", "true");
    expect(panel.style.getPropertyValue("--lufia-sheet-drag")).toBe("90px");
    fireEvent.touchEnd(body, lift(50, 190));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(panel).not.toHaveAttribute("data-dragging");
  });

  it("springs back after a short, slow drag", () => {
    let now = 0;
    vi.spyOn(performance, "now").mockImplementation(() => (now += 400));
    const { panel, body, onOpenChange } = setup();
    fireEvent.touchStart(body, touch(50, 100));
    fireEvent.touchMove(body, touch(50, 120));
    expect(panel).toHaveAttribute("data-dragging", "true");
    fireEvent.touchEnd(body, lift(50, 120));
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(panel).not.toHaveAttribute("data-dragging");
    expect(panel.style.getPropertyValue("--lufia-sheet-drag")).toBe("0px");
  });

  it("dismisses on a quick flick that is shorter than the threshold", () => {
    let now = 0;
    vi.spyOn(performance, "now").mockImplementation(() => (now += 5));
    const { body, onOpenChange } = setup();
    fireEvent.touchStart(body, touch(50, 100));
    fireEvent.touchMove(body, touch(50, 112));
    fireEvent.touchMove(body, touch(50, 140));
    fireEvent.touchEnd(body, lift(50, 140));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("leaves a scrolled body to scroll, and a sideways move alone", () => {
    const { panel, body, onOpenChange } = setup();
    scrolledTo(body, 40);
    fireEvent.touchStart(body, touch(50, 100));
    fireEvent.touchMove(body, touch(50, 200));
    fireEvent.touchEnd(body, lift(50, 200));
    expect(panel).not.toHaveAttribute("data-dragging");
    expect(onOpenChange).not.toHaveBeenCalled();

    scrolledTo(body, 0);
    fireEvent.touchStart(body, touch(50, 100));
    fireEvent.touchMove(body, touch(150, 110));
    fireEvent.touchMove(body, touch(250, 130));
    fireEvent.touchEnd(body, lift(250, 130));
    expect(panel).not.toHaveAttribute("data-dragging");
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("stops the browser's pull to refresh by cancelling the first downward move at the top", () => {
    const { body } = setup();
    fireEvent.touchStart(body, touch(50, 100));
    // Not cancelled would return true: a cancelled event returns false.
    expect(fireEvent.touchMove(body, touch(50, 103))).toBe(false);
  });

  it("does not cancel a scroll in the middle of the body", () => {
    const { body } = setup();
    Object.defineProperty(body, "clientHeight", { configurable: true, value: 100 });
    Object.defineProperty(body, "scrollHeight", { configurable: true, value: 400 });
    scrolledTo(body, 50);
    fireEvent.touchStart(body, touch(50, 100));
    expect(fireEvent.touchMove(body, touch(50, 90))).toBe(true);
    expect(fireEvent.touchMove(body, touch(50, 140))).toBe(true);
  });

  it("swallows the click the lifted finger would send to the link under it", () => {
    const { body, link, onLink } = setup();
    fireEvent.touchStart(body, touch(50, 100));
    fireEvent.touchMove(body, touch(50, 112));
    fireEvent.touchMove(body, touch(50, 125));
    fireEvent.touchEnd(body, lift(50, 125));
    fireEvent.click(link, { detail: 1 });
    expect(onLink).not.toHaveBeenCalled();
    fireEvent.click(link, { detail: 1 });
    expect(onLink).toHaveBeenCalledTimes(1);
  });

  it("does nothing with swipeToDismiss off", () => {
    const off = setup({ swipe: false });
    fireEvent.touchStart(off.body, touch(50, 100));
    fireEvent.touchMove(off.body, touch(50, 200));
    expect(off.panel).not.toHaveAttribute("data-dragging");
  });

  it("ignores a second finger and gives up a drag when it lands", () => {
    const { panel, body, onOpenChange } = setup();
    fireEvent.touchStart(body, touch(50, 100));
    fireEvent.touchMove(body, touch(50, 130));
    fireEvent.touchMove(body, touch(50, 160));
    expect(panel).toHaveAttribute("data-dragging", "true");
    fireEvent.touchMove(body, {
      touches: [
        { identifier: 1, clientX: 50, clientY: 160 },
        { identifier: 2, clientX: 80, clientY: 160 },
      ],
    });
    expect(panel).not.toHaveAttribute("data-dragging");
    fireEvent.touchEnd(body, lift(50, 160));
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
