import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { axe } from "../../test/axe";
import { mockDialog } from "../../test/dialog";
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
    const part = this.getAttribute("data-lufia-part");
    return boxes[this.id] ?? (part ? boxes[`part:${part}`] : undefined) ?? new DOMRect(0, 0, 0, 0);
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

const card = () => document.querySelector<HTMLElement>('[data-lufia-part="card"]') as HTMLElement;
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

  describe("do steps and target status", () => {
    const doSteps: TourStep[] = [
      {
        target: "#first",
        title: "Try it",
        body: "Press the first control.",
        mode: "do",
        missingBody: "Not on screen.",
      },
      { target: "#second", title: "Read it", body: "Then read this." },
      { target: "#first", title: "Last try", body: "Press it again.", mode: "do" },
    ];
    const doLabels = {
      ...labels,
      doHint: "Do this on the page",
      skipStep: "Skip step",
      seeking: "Opening…",
      blocked: "Close the open window",
    };

    it("hides the next button and shows the hint on a do step, and does not step forward with the arrow key", async () => {
      const onStepChange = vi.fn();
      const { user } = setup({ steps: doSteps, labels: doLabels, onStepChange });
      expect(card()).toHaveAttribute("data-mode", "do");
      expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Skip step" })).not.toBeInTheDocument();
      expect(screen.getByText("Do this on the page")).toBeInTheDocument();
      await user.keyboard("{ArrowRight}");
      expect(onStepChange).not.toHaveBeenCalled();
    });

    it("keeps next on a read step, and finish is hidden on a last do step", () => {
      setup({ steps: doSteps, labels: doLabels, stepIndex: 1 });
      expect(card()).toHaveAttribute("data-mode", "read");
      expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
      expect(screen.queryByText("Do this on the page")).not.toBeInTheDocument();
    });

    it("hides finish on a last do step", () => {
      setup({ steps: doSteps, labels: doLabels, stepIndex: 2 });
      expect(screen.queryByRole("button", { name: "Done" })).not.toBeInTheDocument();
    });

    it("leaves a last do step with the close button as its only action, unless that is switched off", () => {
      setup({ steps: doSteps, labels: doLabels, stepIndex: 2 });
      expect(screen.getByRole("button", { name: "Close tour" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Skip tour" })).not.toBeInTheDocument();
    });

    it("never leaves a last do step without an action: skip shows when the close button is off", async () => {
      const onClose = vi.fn();
      const { user } = setup({
        steps: doSteps,
        labels: doLabels,
        stepIndex: 2,
        showCloseButton: false,
        onClose,
      });
      expect(screen.queryByRole("button", { name: "Close tour" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Done" })).not.toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Skip tour" }));
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledWith("skip");
    });

    it("shows skip on a last do step with skipOnLastStep, beside close", () => {
      setup({ steps: doSteps, labels: doLabels, stepIndex: 2, skipOnLastStep: true });
      expect(screen.getByRole("button", { name: "Skip tour" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Close tour" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Done" })).not.toBeInTheDocument();
    });

    it("has no axe violations on a last do step with no close button", async () => {
      setup({ steps: doSteps, labels: doLabels, stepIndex: 2, showCloseButton: false });
      expect(await axe(layer())).toHaveNoViolations();
    });

    it("offers to skip a do step whose target is missing, showing its missing body and no hint", async () => {
      const onStepChange = vi.fn();
      const onFinish = vi.fn();
      const { user } = setup({
        steps: doSteps,
        labels: doLabels,
        targetStatus: "missing",
        onStepChange,
        onFinish,
      });
      expect(card()).toHaveAttribute("data-status", "missing");
      expect(screen.getByText("Not on screen.")).toBeInTheDocument();
      expect(screen.queryByText("Press the first control.")).not.toBeInTheDocument();
      expect(screen.queryByText("Do this on the page")).not.toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Skip step" }));
      expect(onStepChange).toHaveBeenCalledWith(1);
    });

    it("finishes from a missing last do step", async () => {
      const onFinish = vi.fn();
      const { user } = setup({
        steps: doSteps,
        labels: doLabels,
        stepIndex: 2,
        targetStatus: "missing",
        onFinish,
      });
      await user.click(screen.getByRole("button", { name: "Done" }));
      expect(onFinish).toHaveBeenCalled();
    });

    it("appends the seeking label to the body and keeps a do step waiting", () => {
      setup({ steps: doSteps, labels: doLabels, targetStatus: "seeking" });
      expect(screen.getByText("Opening…")).toBeInTheDocument();
      expect(screen.getByText(/Press the first control/)).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument();
    });

    it("shows the blocked body when something else is in the way", () => {
      setup({ steps: doSteps, labels: doLabels, targetStatus: "blocked" });
      expect(screen.getByText("Close the open window")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Skip step" })).toBeInTheDocument();
    });

    it("has no axe violations on a do step", async () => {
      setup({ steps: doSteps, labels: doLabels });
      expect(await axe(layer())).toHaveNoViolations();
    });
  });

  describe("custom targets", () => {
    it("finds the target with resolveTarget, before the step's own target, and falls back when it returns null", () => {
      const resolve = vi.fn((step: TourStep) =>
        step.title === "First stop" ? document.getElementById("second") : null,
      );
      setup({ resolveTarget: resolve });
      // The first step points at "#first" but the resolver sends it to "#second".
      expect(spot().style.transform).toBe("translate(294px, 394px)");
      expect(resolve).toHaveBeenCalledWith(expect.objectContaining({ title: "First stop" }));
    });

    it("uses the step target when the resolver returns null", () => {
      setup({ resolveTarget: () => null });
      expect(spot().style.transform).toBe("translate(94px, 194px)");
    });

    it("appends the stand-in note only when the host says the element is a stand-in", async () => {
      const noted: TourStep[] = [
        { target: "#first", title: "Hidden item", body: "Body.", standInNote: "It is in the menu." },
      ];
      const { view } = setup({ steps: noted, isStandIn: () => true });
      expect(screen.getByText("It is in the menu.")).toBeInTheDocument();
      view.rerender(
        <Page>
          <Tour steps={noted} open labels={labels} isStandIn={() => false} />
        </Page>,
      );
      await waitFor(() => expect(screen.queryByText("It is in the menu.")).not.toBeInTheDocument());
    });
  });

  describe("focus and typing", () => {
    it("does not move focus to the card while a field outside it holds a value", async () => {
      const { user, view } = setup();
      const field = screen.getByRole("textbox", { name: "Search" });
      await user.click(field);
      await user.keyboard("abc");
      view.rerender(
        <Page>
          <Tour steps={steps} open labels={labels} stepIndex={1} />
        </Page>,
      );
      expect(field).toHaveFocus();
    });

    it("still moves focus to the heading when the focused field is empty", async () => {
      const { user, view } = setup();
      const field = screen.getByRole("textbox", { name: "Search" });
      await user.click(field);
      view.rerender(
        <Page>
          <Tour steps={steps} open labels={labels} stepIndex={1} />
        </Page>,
      );
      expect(screen.getByRole("heading", { name: "Second stop" })).toHaveFocus();
    });

    it("is compact while a field of the page has focus on a phone, and settles after it leaves", async () => {
      withLayout({ width: 360, height: 640 });
      const user = userEvent.setup();
      render(
        <Page>
          <Tour steps={steps} open labels={labels} compactOnTyping />
        </Page>,
      );
      expect(card()).not.toHaveAttribute("data-compact");
      await user.click(screen.getByRole("textbox", { name: "Search" }));
      expect(card()).toHaveAttribute("data-compact");
      await user.click(document.body);
      // Not at once: the card holds its size through the settle delay.
      expect(card()).toHaveAttribute("data-compact");
      await waitFor(() => expect(card()).not.toHaveAttribute("data-compact"));
    });

    it("is never compact on a wide screen, or when the option is off", async () => {
      const { user } = setup({ compactOnTyping: true });
      await user.click(screen.getByRole("textbox", { name: "Search" }));
      expect(card()).not.toHaveAttribute("data-compact");
    });

    it("does not change while a press is in progress", async () => {
      withLayout({ width: 360, height: 640 });
      render(
        <Page>
          <Tour steps={steps} open labels={labels} compactOnTyping />
        </Page>,
      );
      const field = screen.getByRole("textbox", { name: "Search" });
      act(() => field.focus());
      await waitFor(() => expect(card()).toHaveAttribute("data-compact"));
      fireEvent.pointerDown(document.body);
      act(() => field.blur());
      await new Promise((resolve) => setTimeout(resolve, 450));
      expect(card()).toHaveAttribute("data-compact");
      fireEvent.pointerUp(document.body);
      await waitFor(() => expect(card()).not.toHaveAttribute("data-compact"));
    });
  });

  describe("skipOnLastStep", () => {
    it("hides skip on the last step by default", () => {
      setup({ stepIndex: 2 });
      expect(screen.queryByRole("button", { name: "Skip tour" })).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Done" })).toBeInTheDocument();
    });

    it("keeps skip before finish on the last read step, and reports the same outcome as earlier steps", async () => {
      const onClose = vi.fn();
      const onFinish = vi.fn();
      const { user } = setup({ stepIndex: 2, skipOnLastStep: true, onClose, onFinish });
      const buttons = within(card())
        .getAllByRole("button")
        .map((button) => button.textContent || button.getAttribute("aria-label"));
      expect(buttons).toEqual(["Close tour", "Skip tour", "Back", "Done"]);
      expect(screen.getByRole("heading", { name: "No target" })).toHaveFocus();
      await user.click(screen.getByRole("button", { name: "Skip tour" }));
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledWith("skip");
      expect(onFinish).not.toHaveBeenCalled();
      await user.click(screen.getByRole("button", { name: "Done" }));
      expect(onFinish).toHaveBeenCalledTimes(1);
    });

    it("has no axe violations with both skip and finish on the last step", async () => {
      setup({ stepIndex: 2, skipOnLastStep: true });
      expect(await axe(layer())).toHaveNoViolations();
    });
  });

  describe("switches", () => {
    it("removes the close button, Escape and the arrow keys when they are switched off", async () => {
      const onClose = vi.fn();
      const onStepChange = vi.fn();
      const { user } = setup({
        showCloseButton: false,
        closeOnEscape: false,
        arrowKeyNavigation: false,
        onClose,
        onStepChange,
      });
      expect(screen.queryByRole("button", { name: "Close tour" })).not.toBeInTheDocument();
      await user.keyboard("{Escape}{ArrowRight}");
      expect(onClose).not.toHaveBeenCalled();
      expect(onStepChange).not.toHaveBeenCalled();
      await user.click(screen.getByRole("button", { name: "Skip tour" }));
      expect(onClose).toHaveBeenCalledWith("skip");
    });

    it("marks the layer and the card with stable data attributes", () => {
      setup();
      expect(layer()).toHaveAttribute("data-lufia-part", "layer");
      expect(card()).toHaveAttribute("data-lufia-part", "card");
      expect(card()).toHaveAttribute("data-status", "ready");
    });
  });

  describe("inside a dialog", () => {
    const dialogBoxes = () => {
      boxes.dlg = new DOMRect(300, 100, 300, 500);
    };
    const withDialog = (props: Partial<TourProps>, pageWidth = 1000) => {
      withLayout({ width: pageWidth, height: pageWidth < 600 ? 640 : 800 });
      dialogBoxes();
      return render(
        <dialog id="dlg" open>
          <header id="hdr">Header</header>
          <div
            id="scroller"
            style={{ overflowY: "auto" }}
            ref={(element) => {
              if (!element) return;
              Object.defineProperty(element, "scrollHeight", { configurable: true, value: 900 });
              Object.defineProperty(element, "clientHeight", { configurable: true, value: 200 });
            }}
          >
            <button id="first" type="button">
              In the dialog
            </button>
          </div>
          <footer id="ftr">Footer</footer>
          <Tour
            steps={[{ target: "#first", title: "In it", body: "Here." }]}
            open
            labels={labels}
            {...props}
          />
        </dialog>,
      );
    };
    afterEach(() => {
      delete boxes.dlg;
      delete boxes.scroller;
      delete boxes.hdr;
      delete boxes.ftr;
      boxes.first = new DOMRect(100, 200, 80, 40);
    });

    it("places the card beside the dialog when there is room, only when asked", () => {
      withDialog({ dialogLayout: { beside: true } });
      // The dialog ends at 600: the card starts after the gap.
      expect(card()).toHaveAttribute("data-kind", "float");
      expect(parseFloat(card().style.left)).toBeGreaterThanOrEqual(600);
    });

    it("keeps the card by the target without the option", () => {
      withDialog({});
      expect(parseFloat(card().style.left)).toBeLessThan(600);
    });

    it("clips the spotlight to the dialog's scroll area", () => {
      boxes.scroller = new DOMRect(0, 100, 300, 200);
      boxes.first = new DOMRect(100, 280, 80, 40);
      withDialog({ dialogLayout: { clipSpotlight: true } });
      // 280 to 320 cut at 300: 20 tall, plus the padding on both sides.
      expect(spot().style.blockSize).toBe("32px");
    });

    it("does not clip the spotlight without the option", () => {
      boxes.scroller = new DOMRect(0, 100, 300, 200);
      boxes.first = new DOMRect(100, 280, 80, 40);
      withDialog({});
      expect(spot().style.blockSize).toBe("52px");
    });

    it("docks a full-screen phone dialog above the sheet, and hands it back on close", () => {
      boxes.dlg = new DOMRect(0, 0, 360, 640);
      withLayout({ width: 360, height: 640 });
      boxes.dlg = new DOMRect(0, 0, 360, 640);
      const view = render(
        <dialog id="dlg" open>
          <button id="first" type="button">
            In the dialog
          </button>
          <Tour
            steps={[{ target: "#first", title: "In it", body: "Here." }]}
            open
            labels={labels}
            dialogLayout={{ dock: true }}
          />
        </dialog>,
      );
      const dialog = view.container.querySelector("dialog") as HTMLElement;
      expect(dialog).toHaveAttribute("data-lufia-tour-docked");
      expect(card()).toHaveAttribute("data-edge", "bottom");
      expect(dialog.style.getPropertyValue("height")).toContain("180px");
      view.rerender(<dialog id="dlg" open />);
      expect(dialog).not.toHaveAttribute("data-lufia-tour-docked");
      expect(dialog.style.getPropertyValue("height")).toBe("");
    });

    it("resizes a marked shell with the dialog, and never an unmarked first child", () => {
      withLayout({ width: 360, height: 640 });
      boxes.dlg = new DOMRect(0, 0, 360, 640);
      const tree = (tour: boolean) => (
        <dialog id="dlg" open>
          <header id="hdr">Header</header>
          <div data-lufia-tour-shell id="shell">
            <button id="first" type="button">
              In the dialog
            </button>
          </div>
          {tour && (
            <Tour
              steps={[{ target: "#first", title: "In it", body: "Here." }]}
              open
              labels={labels}
              dialogLayout={{ dock: true }}
            />
          )}
        </dialog>
      );
      const view = render(tree(true));
      const shell = view.container.querySelector<HTMLElement>("#shell")!;
      expect(shell.style.getPropertyValue("height")).toContain("180px");
      expect(view.container.querySelector<HTMLElement>("#hdr")!.style.getPropertyValue("height")).toBe("");
      view.rerender(tree(false));
      expect(shell.style.getPropertyValue("height")).toBe("");
    });

    it("leaves the dialog alone without the dock option", () => {
      withLayout({ width: 360, height: 640 });
      boxes.dlg = new DOMRect(0, 0, 360, 640);
      const view = render(
        <dialog id="dlg" open>
          <button id="first" type="button">
            In the dialog
          </button>
          <Tour steps={[{ target: "#first", title: "In it", body: "Here." }]} open labels={labels} />
        </dialog>,
      );
      expect(view.container.querySelector("dialog")).not.toHaveAttribute("data-lufia-tour-docked");
    });

    it("reserves room for the dialog's own footer when scrolling the target clear of the sheet", () => {
      Element.prototype.scrollBy = vi.fn();
      withLayout({ width: 360, height: 640 });
      boxes.dlg = new DOMRect(0, 0, 360, 640);
      boxes.hdr = new DOMRect(0, 0, 360, 60);
      boxes.ftr = new DOMRect(0, 560, 360, 80);
      boxes.first = new DOMRect(100, 590, 80, 40);
      render(
        <dialog id="dlg" open>
          <header id="hdr">Header</header>
          <button id="first" type="button">
            In the dialog
          </button>
          <footer id="ftr">Footer</footer>
          <Tour
            steps={[{ target: "#first", title: "In it", body: "Here." }]}
            open
            labels={labels}
            dialogLayout={{ dock: true }}
          />
        </dialog>,
      );
      // The footer starts at 560, so the room above it ends at 548: the target's bottom (630) goes up by 82.
      expect(Element.prototype.scrollBy).toHaveBeenCalledWith({ top: 82, behavior: "smooth" });
      Reflect.deleteProperty(Element.prototype, "scrollBy");
    });

    it("scrolls the target clear of the footer again when the dialog docks only after its entrance", () => {
      const frames: FrameRequestCallback[] = [];
      vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => frames.push(callback));
      const scrollBy = vi.fn();
      Element.prototype.scrollBy = scrollBy;
      withLayout({ width: 360, height: 640 });
      // Still animating in: scaled down, so not full screen yet and not docked.
      boxes.dlg = new DOMRect(8, 8, 344, 624);
      boxes.hdr = new DOMRect(0, 0, 360, 60);
      boxes.ftr = new DOMRect(0, 560, 360, 80);
      boxes.first = new DOMRect(100, 400, 80, 40);
      render(
        <dialog id="dlg" open>
          <header id="hdr">Header</header>
          <button id="first" type="button">
            In the dialog
          </button>
          <footer id="ftr">Footer</footer>
          <Tour
            steps={[{ target: "#first", title: "In it", body: "Here." }]}
            open
            labels={labels}
            dialogLayout={{ dock: true }}
          />
        </dialog>,
      );
      const dialog = document.querySelector("dialog")!;
      expect(dialog).not.toHaveAttribute("data-lufia-tour-docked");
      // Clear of the floating card's room (640 - 180 - 12 = 448): nothing to scroll yet.
      expect(scrollBy).not.toHaveBeenCalled();
      // The entrance ends: the dialog fills the screen and docks, which moves its footer up to 380.
      boxes.dlg = new DOMRect(0, 0, 360, 640);
      boxes.ftr = new DOMRect(0, 380, 360, 80);
      act(() => frames.splice(0).forEach((frame) => frame(0)));
      expect(dialog).toHaveAttribute("data-lufia-tour-docked");
      // The room above the footer ends at 368: the target's bottom (440) goes up by 72.
      expect(scrollBy).toHaveBeenCalledWith({ top: 72, behavior: "smooth" });
      boxes.first = new DOMRect(100, 200, 80, 40);
      Reflect.deleteProperty(Element.prototype, "scrollBy");
    });
  });

  describe("inside the package Modal", () => {
    const phoneBoxes = () => {
      withLayout({ width: 360, height: 640 });
      boxes.dlg = new DOMRect(0, 0, 360, 640);
      boxes["part:header"] = new DOMRect(0, 0, 360, 56);
      boxes["part:footer"] = new DOMRect(0, 560, 360, 80);
    };
    let dialogMock: ReturnType<typeof mockDialog>;
    beforeEach(() => {
      dialogMock = mockDialog();
    });
    const tourModal = (renderAs: "dialog" | "portal", props: Partial<TourProps> | null = {}) => (
      <Modal id="dlg" open onClose={() => {}} title="Edit" footer="Save" renderAs={renderAs}>
        <article>
          <header id="inner-header">Inside the content</header>
          <button id="first" type="button">
            Low in the body
          </button>
          <footer id="inner-footer">Content footer</footer>
        </article>
        {props && (
          <Tour
            steps={[{ target: "#first", title: "In it", body: "Here." }]}
            open
            labels={labels}
            dialogLayout={{ dock: true }}
            {...props}
          />
        )}
      </Modal>
    );
    afterEach(() => {
      cleanup();
      dialogMock.restore();
      delete boxes.dlg;
      delete boxes["part:header"];
      delete boxes["part:footer"];
      delete boxes["inner-header"];
      delete boxes["inner-footer"];
      boxes.first = new DOMRect(100, 200, 80, 40);
      Reflect.deleteProperty(Element.prototype, "scrollBy");
    });

    it.each(["dialog", "portal"] as const)(
      "docks a full-screen %s Modal without resizing its header, and hands it back",
      (renderAs) => {
        phoneBoxes();
        const view = render(tourModal(renderAs));
        const panel = document.querySelector<HTMLElement>('[data-lufia-part="panel"]')!;
        const header = document.querySelector<HTMLElement>('[data-lufia-part="header"]')!;
        expect(panel).toHaveAttribute("data-lufia-tour-docked");
        expect(panel.style.getPropertyValue("height")).toBe("calc(100dvh - 180px)");
        expect(panel.style.getPropertyValue("margin-block-end")).toBe("180px");
        for (const part of ["header", "body", "footer"]) {
          const element = document.querySelector<HTMLElement>(`[data-lufia-part="${part}"]`)!;
          expect(element.style.getPropertyValue("height")).toBe("");
          expect(element.style.getPropertyValue("max-height")).toBe("");
        }
        expect(header.style.cssText).toBe("");
        view.rerender(tourModal(renderAs, null));
        expect(panel).not.toHaveAttribute("data-lufia-tour-docked");
        expect(panel.style.getPropertyValue("height")).toBe("");
        expect(panel.style.getPropertyValue("max-height")).toBe("");
        expect(panel.style.getPropertyValue("margin-block-end")).toBe("");
      },
    );

    it("hands the Modal back when the tour moves to a step outside it", () => {
      phoneBoxes();
      boxes.second = new DOMRect(300, 400, 120, 40);
      const outside = (index: number) => (
        <>
          <button id="second" type="button">
            Outside
          </button>
          {tourModal("dialog", {
            steps: [
              { target: "#first", title: "In it", body: "Here." },
              { target: "#second", title: "Out", body: "There." },
            ],
            stepIndex: index,
          })}
        </>
      );
      const view = render(outside(0));
      const panel = document.querySelector<HTMLElement>('[data-lufia-part="panel"]')!;
      expect(panel).toHaveAttribute("data-lufia-tour-docked");
      view.rerender(outside(1));
      expect(panel).not.toHaveAttribute("data-lufia-tour-docked");
      expect(panel.style.getPropertyValue("height")).toBe("");
      expect(panel.style.getPropertyValue("margin-block-end")).toBe("");
    });

    it("clears the Modal's own bars, not a header or footer inside the content, when revealing", () => {
      Element.prototype.scrollBy = vi.fn();
      phoneBoxes();
      // Content bars with boxes that would change the answer if they were mistaken for the Modal's.
      boxes["inner-header"] = new DOMRect(0, 300, 360, 20);
      boxes["inner-footer"] = new DOMRect(0, 400, 360, 20);
      boxes.first = new DOMRect(100, 590, 80, 40);
      render(tourModal("dialog"));
      // The Modal footer starts at 560: the room above it ends at 548, so the target's bottom (630) goes up by 82.
      expect(Element.prototype.scrollBy).toHaveBeenCalledWith({ top: 82, behavior: "smooth" });
    });

    it("cuts the spotlight where the sticky header and footer cover the scroller", () => {
      withLayout({ width: 360, height: 640 });
      boxes.dlg = new DOMRect(0, 0, 360, 640);
      boxes["part:header"] = new DOMRect(0, 0, 360, 56);
      boxes["part:footer"] = new DOMRect(0, 460, 360, 80);
      boxes.first = new DOMRect(100, 20, 80, 100);
      Object.defineProperty(HTMLElement.prototype, "scrollHeight", { configurable: true, value: 900 });
      Object.defineProperty(HTMLElement.prototype, "clientHeight", { configurable: true, value: 300 });
      const style = vi.spyOn(window, "getComputedStyle").mockImplementation(
        (element) =>
          ({
            overflowY: element.getAttribute("data-lufia-part") === "panel" ? "auto" : "visible",
            fontSize: "16px",
            direction: "ltr",
          }) as CSSStyleDeclaration,
      );
      render(tourModal("dialog", { dialogLayout: { clipSpotlight: true } }));
      // 20 to 120 cut at the header's bottom (56): 64 tall, plus the padding on both sides.
      expect(spot().style.blockSize).toBe("76px");
      style.mockRestore();
      Reflect.deleteProperty(HTMLElement.prototype, "scrollHeight");
      Reflect.deleteProperty(HTMLElement.prototype, "clientHeight");
      delete boxes["part:footer"];
    });
  });

  it("has no axe violations", async () => {
    setup();
    // The layer (card, spotlight, status region) is what the tour owns; the page around it is the app's.
    expect(await axe(layer())).toHaveNoViolations();
  });
});
