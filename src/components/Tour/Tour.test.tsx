import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { axe } from "../../test/axe";
import { Modal } from "../Modal";
import { Tour, type TourProps, type TourStep } from "./Tour";

const labels: TourProps["labels"] = {
  next: "Next",
  back: "Back",
  skip: "Skip tour",
  close: "Close tour",
  finish: "Done",
  stepOf: (current, total) => `Step ${current} of ${total}`,
};

const steps: TourStep[] = [
  { target: "#first", title: "First stop", body: "This is the first control." },
  { target: "#second", title: "Second stop", body: "This is the second control.", placement: "top" },
  { title: "No target", body: "A word about everything." },
];

type Boxes = Record<string, DOMRect>;
const boxes: Boxes = {
  first: new DOMRect(100, 200, 80, 40),
  second: new DOMRect(300, 400, 120, 40),
};

/** jsdom has no layout: elements get a box (the targets their own, the card a fixed size) and a viewport is defined. */
function withLayout({ width = 1000, height = 800 }: { width?: number; height?: number } = {}) {
  vi.spyOn(Element.prototype, "getClientRects").mockImplementation(function (this: Element) {
    const hidden = this.closest("[data-hidden]");
    return (hidden ? [] : [new DOMRect(0, 0, 10, 10)]) as unknown as DOMRectList;
  });
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
    if (this.getAttribute("role") === "dialog" && this.getAttribute("aria-modal") === "false")
      return new DOMRect(0, 0, 320, 180);
    return boxes[this.id] ?? new DOMRect(0, 0, 0, 0);
  });
  Object.defineProperty(document.documentElement, "clientWidth", { configurable: true, value: width });
  Object.defineProperty(document.documentElement, "clientHeight", { configurable: true, value: height });
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", { configurable: true, value: 180 });
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", { configurable: true, value: 320 });
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  Reflect.deleteProperty(HTMLElement.prototype, "offsetHeight");
  Reflect.deleteProperty(HTMLElement.prototype, "offsetWidth");
  Reflect.deleteProperty(document.documentElement, "clientWidth");
  Reflect.deleteProperty(document.documentElement, "clientHeight");
});

function Page({ children }: { children: React.ReactNode }) {
  return (
    <>
      <button id="first" type="button">
        First control
      </button>
      <button id="second" type="button">
        Second control
      </button>
      <input aria-label="Search" />
      {children}
    </>
  );
}

function setup(props: Partial<TourProps> = {}) {
  withLayout();
  const user = userEvent.setup();
  const view = render(
    <Page>
      <Tour steps={steps} open labels={labels} {...props} />
    </Page>,
  );
  return { user, view };
}

const card = () => screen.getByRole("dialog");
const spot = () => document.querySelector<HTMLElement>('[data-lufia-part="spotlight"]')!;
const layer = () => document.querySelector<HTMLElement>("[data-target]")!;

describe("Tour", () => {
  it("renders nothing while closed", () => {
    setup({ open: false });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the first step as a named, described, non-modal dialog with its counter", () => {
    setup();
    const dialog = screen.getByRole("dialog", { name: "First stop" });
    expect(dialog).toHaveAttribute("aria-modal", "false");
    expect(dialog).toHaveAccessibleDescription("This is the first control.");
    expect(dialog).toHaveTextContent("Step 1 of 3");
    expect(screen.getByRole("status")).toHaveTextContent("Step 1 of 3");
    expect(screen.getByRole("button", { name: "Close tour" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Back" })).not.toBeInTheDocument();
  });

  it("puts a spotlight on the target, padded, and the card beside it", () => {
    setup({ spotlightPadding: 10 });
    expect(layer()).toHaveAttribute("data-target", "true");
    expect(spot().style.transform).toBe("translate(90px, 190px)");
    expect(spot().style.inlineSize).toBe("100px");
    expect(spot().style.blockSize).toBe("60px");
    expect(card()).toHaveAttribute("data-kind", "float");
    // Below the target: its bottom edge plus the gap (0.5rem plus the padding), centred on it.
    expect(card().style.top).toBe(`${240 + 8 + 10}px`);
    // Centred on the target would start at -20px: shifted in to the viewport margin.
    expect(card().style.left).toBe("8px");
  });

  it("falls back to a centred card when the step has no target, the selector matches nothing, or the target is hidden", async () => {
    const { view } = setup({ steps: [{ title: "Hello", body: "No target here." }] });
    expect(card()).toHaveAttribute("data-kind", "center");
    expect(layer()).toHaveAttribute("data-target", "false");
    view.rerender(
      <Page>
        <Tour steps={[{ target: "#nothing", title: "Hello", body: "Missing." }]} open labels={labels} />
      </Page>,
    );
    expect(card()).toHaveAttribute("data-kind", "center");
    view.rerender(
      <>
        <div data-hidden="">
          <Page>{null}</Page>
        </div>
        <Tour steps={[{ target: "#first", title: "Hello", body: "Hidden." }]} open labels={labels} />
      </>,
    );
    expect(card()).toHaveAttribute("data-kind", "center");
  });

  it("treats an invalid selector as a missing target", () => {
    setup({ steps: [{ target: "###", title: "Hello", body: "Bad selector." }] });
    expect(card()).toHaveAttribute("data-kind", "center");
  });

  it("accepts a ref as the target", () => {
    withLayout();
    const ref = createRef<HTMLButtonElement>();
    render(
      <>
        <button id="first" type="button" ref={ref}>
          First control
        </button>
        <Tour steps={[{ target: ref, title: "By ref", body: "Pointing with a ref." }]} open labels={labels} />
      </>,
    );
    expect(layer()).toHaveAttribute("data-target", "true");
    expect(screen.getByRole("dialog", { name: "By ref" })).toHaveAttribute("data-kind", "float");
  });

  it("moves focus to the heading and hands it back to the opener when it closes", async () => {
    withLayout();
    const user = userEvent.setup();
    function Host() {
      const [open, setOpen] = useState(false);
      return (
        <Page>
          <button type="button" onClick={() => setOpen(true)}>
            Start tour
          </button>
          <Tour
            steps={steps}
            open={open}
            labels={labels}
            onFinish={() => setOpen(false)}
            onClose={() => setOpen(false)}
          />
        </Page>
      );
    }
    render(<Host />);
    const start = screen.getByRole("button", { name: "Start tour" });
    await user.click(start);
    expect(screen.getByRole("heading", { name: "First stop" })).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Skip tour" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(start).toHaveFocus();
  });

  it("steps with the buttons, moves focus to each new heading, and finishes on the last step", async () => {
    const onStepChange = vi.fn();
    const onFinish = vi.fn();
    const { user } = setup({ onStepChange, onFinish });
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(onStepChange).toHaveBeenLastCalledWith(1);
    expect(screen.getByRole("heading", { name: "Second stop" })).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent("Step 2 of 3");
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(onStepChange).toHaveBeenLastCalledWith(0);
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.queryByRole("button", { name: "Skip tour" })).not.toBeInTheDocument();
    expect(onFinish).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Done" }));
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it("reports how it was left: skip, close, Escape", async () => {
    const onClose = vi.fn();
    const { user } = setup({ onClose });
    await user.click(screen.getByRole("button", { name: "Skip tour" }));
    expect(onClose).toHaveBeenLastCalledWith("skip");
    await user.click(screen.getByRole("button", { name: "Close tour" }));
    expect(onClose).toHaveBeenLastCalledWith("close");
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenLastCalledWith("escape");
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it("leaves Escape to a field of the page that has focus", async () => {
    const onClose = vi.fn();
    const { user } = setup({ onClose });
    await user.click(screen.getByRole("textbox", { name: "Search" }));
    await user.keyboard("{Escape}");
    expect(onClose).not.toHaveBeenCalled();
  });

  it("steps with the arrow keys while focus is on the card, following the reading direction", async () => {
    const onStepChange = vi.fn();
    const { user } = setup({ onStepChange });
    await user.keyboard("{ArrowRight}");
    expect(onStepChange).toHaveBeenLastCalledWith(1);
    await user.keyboard("{ArrowLeft}");
    expect(onStepChange).toHaveBeenLastCalledWith(0);
    onStepChange.mockClear();
    await user.keyboard("{ArrowLeft}");
    expect(onStepChange).not.toHaveBeenCalled();
  });

  it("never finishes the tour with an arrow key", async () => {
    const onFinish = vi.fn();
    const onStepChange = vi.fn();
    const { user } = setup({ stepIndex: 2, onFinish, onStepChange });
    await user.keyboard("{ArrowRight}");
    expect(onFinish).not.toHaveBeenCalled();
    expect(onStepChange).not.toHaveBeenCalled();
  });

  it("reverses the arrow keys in right-to-left text", async () => {
    withLayout();
    const user = userEvent.setup();
    const onStepChange = vi.fn();
    render(
      <div dir="rtl">
        <Page>
          <Tour steps={steps} open labels={labels} onStepChange={onStepChange} />
        </Page>
      </div>,
    );
    await user.keyboard("{ArrowLeft}");
    expect(onStepChange).toHaveBeenLastCalledWith(1);
  });

  it("does not steal arrow keys from the page", async () => {
    const onStepChange = vi.fn();
    const { user } = setup({ onStepChange });
    await user.click(screen.getByRole("textbox", { name: "Search" }));
    await user.keyboard("{ArrowRight}");
    expect(onStepChange).not.toHaveBeenCalled();
  });

  it("manages its own step and starts over when it opens again", async () => {
    const { user, view } = setup();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("dialog", { name: "Second stop" })).toBeInTheDocument();
    view.rerender(
      <Page>
        <Tour steps={steps} open={false} labels={labels} />
      </Page>,
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    view.rerender(
      <Page>
        <Tour steps={steps} open labels={labels} />
      </Page>,
    );
    expect(screen.getByRole("dialog", { name: "First stop" })).toBeInTheDocument();
  });

  it("follows a controlled stepIndex and asks for changes through onStepChange", async () => {
    const onStepChange = vi.fn();
    const { user, view } = setup({ stepIndex: 1, onStepChange });
    expect(screen.getByRole("dialog", { name: "Second stop" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(onStepChange).toHaveBeenCalledWith(2);
    expect(screen.getByRole("dialog", { name: "Second stop" })).toBeInTheDocument();
    view.rerender(
      <Page>
        <Tour steps={steps} open stepIndex={2} labels={labels} />
      </Page>,
    );
    expect(screen.getByRole("dialog", { name: "No target" })).toHaveAttribute("data-kind", "center");
  });

  it("keeps the page operable: nothing inert, no scroll lock, and the page still takes presses", async () => {
    const onPress = vi.fn();
    withLayout();
    const user = userEvent.setup();
    render(
      <>
        <button type="button" onClick={onPress}>
          Page action
        </button>
        <Tour steps={steps} open labels={labels} />
      </>,
    );
    await user.click(screen.getByRole("button", { name: "Page action" }));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Page action" }).closest("[inert]")).toBeNull();
    expect(document.body.style.overflow).not.toBe("hidden");
  });

  it("follows the target when it moves", () => {
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => frames.push(callback));
    setup();
    expect(spot().style.transform).toBe("translate(94px, 194px)");
    boxes.first = new DOMRect(150, 260, 80, 40);
    act(() => frames.splice(0).forEach((frame) => frame(0)));
    expect(spot().style.transform).toBe("translate(144px, 254px)");
    boxes.first = new DOMRect(100, 200, 80, 40);
  });

  it("scrolls an off-screen target into view, smoothly, or at once under reduced motion", () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    boxes.first = new DOMRect(100, 1200, 80, 40);
    setup();
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "center", inline: "nearest", behavior: "smooth" });
    scrollIntoView.mockClear();
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("reduce"),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    setup();
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "center", inline: "nearest", behavior: "auto" });
    boxes.first = new DOMRect(100, 200, 80, 40);
    Reflect.deleteProperty(Element.prototype, "scrollIntoView");
  });

  it("is a sheet on a narrow screen, on the edge the target is not near", () => {
    withLayout({ width: 360, height: 640 });
    Element.prototype.scrollBy = vi.fn();
    const { unmount } = render(
      <Page>
        <Tour steps={steps} open labels={labels} />
      </Page>,
    );
    expect(card()).toHaveAttribute("data-kind", "sheet");
    expect(card()).toHaveAttribute("data-edge", "bottom");
    unmount();
    boxes.first = new DOMRect(100, 560, 80, 40);
    render(
      <Page>
        <Tour steps={steps} open labels={labels} />
      </Page>,
    );
    expect(card()).toHaveAttribute("data-edge", "top");
    boxes.first = new DOMRect(100, 200, 80, 40);
    Reflect.deleteProperty(Element.prototype, "scrollBy");
  });

  it("is portalled into the open modal that holds the target, so the modal's inert page does not lock it out", async () => {
    withLayout();
    render(
      <Modal open onClose={() => {}} title="Settings">
        <button id="first" type="button">
          Inside the modal
        </button>
        <Tour steps={[{ target: "#first", title: "In the modal", body: "Here." }]} open labels={labels} />
      </Modal>,
    );
    const dialog = screen.getByRole("dialog", { name: "In the modal" });
    expect(dialog.closest('[aria-modal="true"], dialog[open]')).not.toBeNull();
    expect(layer()).toHaveAttribute("data-dim", "false");
  });

  it("has no axe violations", async () => {
    setup();
    // The layer (card, spotlight, status region) is what the tour owns; the page around it is the app's.
    expect(await axe(layer())).toHaveNoViolations();
  });
});
