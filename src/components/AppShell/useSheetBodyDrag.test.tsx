import { act, fireEvent, render, screen } from "@testing-library/react";
import { mockReducedMotion } from "../../test/motion";
import { NavSheet } from "./NavSheet";

function setup({ swipe = true, onOpenChange = vi.fn() } = {}) {
  const onLink = vi.fn();
  render(
    <NavSheet open onOpenChange={onOpenChange} label="Menu" swipeToDismiss={swipe}>
      <a href="/one" onClick={onLink}>
        One
      </a>
      <div data-testid="inner" style={{ overflowY: "auto" }}>
        <a href="/two">Two</a>
      </div>
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

function sized(element: HTMLElement, client: number, scroll: number) {
  Object.defineProperty(element, "clientHeight", { configurable: true, value: client });
  Object.defineProperty(element, "scrollHeight", { configurable: true, value: scroll });
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

  it("decides nothing inside the slop: a first small move is not cancelled, and a sideways swipe never is", () => {
    const { panel, body } = setup();
    fireEvent.touchStart(body, touch(50, 100));
    // Not cancelled returns true, a cancelled event returns false.
    expect(fireEvent.touchMove(body, touch(50, 103))).toBe(true);
    expect(panel).not.toHaveAttribute("data-dragging");
    fireEvent.touchEnd(body, lift(50, 103));

    // A row that scrolls sideways, at the top of the sheet, with a little downward drift.
    fireEvent.touchStart(body, touch(50, 100));
    expect(fireEvent.touchMove(body, touch(60, 104))).toBe(true);
    expect(fireEvent.touchMove(body, touch(150, 112))).toBe(true);
    expect(fireEvent.touchMove(body, touch(250, 120))).toBe(true);
    expect(panel).not.toHaveAttribute("data-dragging");
  });

  it("cancels a downward move once it is known to be the sheet (so no pull to refresh starts)", () => {
    const { body } = setup();
    fireEvent.touchStart(body, touch(50, 100));
    expect(fireEvent.touchMove(body, touch(50, 112))).toBe(false);
  });

  it("cancels a scroll that has nowhere to go at the bottom, and not one that can still move", () => {
    const { body } = setup();
    sized(body, 100, 400);
    scrolledTo(body, 300);
    fireEvent.touchStart(body, touch(50, 100));
    fireEvent.touchMove(body, touch(50, 90));
    expect(fireEvent.touchMove(body, touch(50, 70))).toBe(false);
    fireEvent.touchEnd(body, lift(50, 70));

    scrolledTo(body, 50);
    fireEvent.touchStart(body, touch(50, 100));
    expect(fireEvent.touchMove(body, touch(50, 70))).toBe(true);
    expect(fireEvent.touchMove(body, touch(50, 140))).toBe(true);
  });

  it("respects an inner list that can still scroll: no sheet drag and no cancelled scroll", () => {
    const { panel, body } = setup();
    const inner = screen.getByTestId("inner");
    sized(inner, 100, 300);
    scrolledTo(inner, 60);
    fireEvent.touchStart(inner, touch(50, 100));
    expect(fireEvent.touchMove(inner, touch(50, 112))).toBe(true);
    expect(fireEvent.touchMove(inner, touch(50, 180))).toBe(true);
    expect(panel).not.toHaveAttribute("data-dragging");
    fireEvent.touchEnd(body, lift(50, 180));
  });

  it("drags the sheet from an inner list that is at its top while the body is too", () => {
    const { panel, onOpenChange } = setup();
    const inner = screen.getByTestId("inner");
    sized(inner, 100, 300);
    scrolledTo(inner, 0);
    fireEvent.touchStart(inner, touch(50, 100));
    fireEvent.touchMove(inner, touch(50, 112));
    fireEvent.touchMove(inner, touch(50, 190));
    expect(panel).toHaveAttribute("data-dragging", "true");
    fireEvent.touchEnd(inner, lift(50, 190));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("does not drag the sheet while the body is scrolled, even from an inner list at its top", () => {
    const { panel, body } = setup();
    const inner = screen.getByTestId("inner");
    sized(inner, 100, 300);
    scrolledTo(inner, 0);
    scrolledTo(body, 40);
    sized(body, 100, 400);
    fireEvent.touchStart(inner, touch(50, 100));
    expect(fireEvent.touchMove(inner, touch(50, 112))).toBe(true);
    expect(fireEvent.touchMove(inner, touch(50, 190))).toBe(true);
    expect(panel).not.toHaveAttribute("data-dragging");
  });

  it("treats an inner list that does not overflow as no scroller", () => {
    const { panel } = setup();
    const inner = screen.getByTestId("inner");
    // Nothing to scroll, whatever its style or a stale offset says.
    sized(inner, 100, 100);
    scrolledTo(inner, 30);
    fireEvent.touchStart(inner, touch(50, 100));
    fireEvent.touchMove(inner, touch(50, 112));
    fireEvent.touchMove(inner, touch(50, 150));
    expect(panel).toHaveAttribute("data-dragging", "true");
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

  describe("the swallowed click", () => {
    const dragAndLift = (body: HTMLElement) => {
      fireEvent.touchStart(body, touch(50, 100));
      fireEvent.touchMove(body, touch(50, 112));
      fireEvent.touchMove(body, touch(50, 125));
      fireEvent.touchEnd(body, lift(50, 125));
    };
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("lapses by itself shortly after the drag, so it cannot eat someone else's click", () => {
      const { body, link, onLink } = setup();
      dragAndLift(body);
      act(() => void vi.advanceTimersByTime(500));
      fireEvent.click(link, { detail: 1 });
      expect(onLink).toHaveBeenCalledTimes(1);
    });

    it("lapses at the next pointer down", () => {
      const { body, link, onLink } = setup();
      dragAndLift(body);
      fireEvent.pointerDown(link);
      fireEvent.click(link, { detail: 1 });
      expect(onLink).toHaveBeenCalledTimes(1);
    });

    it("still swallows the click that follows the drag at once", () => {
      const { body, link, onLink } = setup();
      dragAndLift(body);
      fireEvent.click(link, { detail: 1 });
      expect(onLink).not.toHaveBeenCalled();
    });

    it("does not swallow anything after a plain tap that never dragged", () => {
      const { body, link, onLink } = setup();
      fireEvent.touchStart(body, touch(50, 100));
      fireEvent.touchEnd(body, lift(50, 100));
      fireEvent.click(link, { detail: 1 });
      expect(onLink).toHaveBeenCalledTimes(1);
    });
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
