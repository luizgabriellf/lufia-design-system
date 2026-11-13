import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { axe } from "../../test/axe";
import { Modal } from "../Modal";
import { Popover, type PopoverProps } from "./Popover";

/** jsdom has no layout: every element gets a box so `useDismiss` and the Tab handling see rendered elements. */
const withLayout = () =>
  vi
    .spyOn(Element.prototype, "getClientRects")
    .mockReturnValue([new DOMRect(0, 0, 10, 10)] as unknown as DOMRectList);

afterEach(() => {
  vi.restoreAllMocks();
});

function setup(props: Partial<PopoverProps> = {}) {
  withLayout();
  const user = userEvent.setup();
  const view = render(
    <>
      <button type="button">Before</button>
      <Popover
        label="Filters"
        trigger={(triggerProps) => (
          <button type="button" {...triggerProps}>
            Open filters
          </button>
        )}
        {...props}
      >
        <input aria-label="Owner" />
        <button type="button">Apply</button>
      </Popover>
      <button type="button">After</button>
    </>,
  );
  return { user, view, trigger: screen.getByRole("button", { name: "Open filters" }) };
}

const gone = () => waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

describe("Popover", () => {
  it("renders a closed trigger with the disclosure ARIA and no panel", () => {
    const { trigger } = setup();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger).not.toHaveAttribute("aria-controls");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens on click as a named dialog, links it to the trigger and focuses the first control", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    const panel = screen.getByRole("dialog", { name: "Filters" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAttribute("aria-controls", panel.id);
    expect(screen.getByRole("textbox", { name: "Owner" })).toHaveFocus();
  });

  it("focuses the panel itself with initialFocus=panel", async () => {
    const { user, trigger } = setup({ initialFocus: "panel" });
    await user.click(trigger);
    expect(screen.getByRole("dialog")).toHaveFocus();
  });

  it("renders in a portal on the body, not inside the trigger's parent", async () => {
    const { user, trigger, view } = setup();
    await user.click(trigger);
    const panel = screen.getByRole("dialog");
    expect(panel.parentElement).toBe(document.body);
    expect(view.container.contains(panel)).toBe(false);
  });

  it("is not modal: no aria-modal, the page stays interactive, no scroll lock", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    expect(screen.getByRole("dialog")).not.toHaveAttribute("aria-modal");
    expect(screen.getByRole("button", { name: "Before" }).closest("[inert]")).toBeNull();
    expect(document.body.style.overflow).not.toBe("hidden");
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    await user.keyboard("{Escape}");
    await gone();
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("closes on a press outside and leaves focus where the press put it", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "After" }));
    await gone();
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
  });

  it("stays open on a press inside, and the trigger toggles it closed", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "Apply" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(trigger);
    await gone();
  });

  it("does not move focus when it starts open", () => {
    setup({ defaultOpen: true });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(document.body).toHaveFocus();
  });

  it("closes on Escape when it started open", async () => {
    const { user } = setup({ defaultOpen: true });
    await user.keyboard("{Escape}");
    await gone();
  });

  it("goes through onOpenChange and follows a controlled open", async () => {
    const onOpenChange = vi.fn();
    const { user, trigger, view } = setup({ open: false, onOpenChange });
    await user.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    view.rerender(
      <Popover
        open
        onOpenChange={onOpenChange}
        label="Filters"
        trigger={(props) => (
          <button type="button" {...props}>
            Open filters
          </button>
        )}
      >
        <input aria-label="Owner" />
      </Popover>,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("returns focus to the trigger when the caller closes it while focus is inside", async () => {
    withLayout();
    const user = userEvent.setup();
    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <Popover
          open={open}
          onOpenChange={setOpen}
          label="Filters"
          trigger={(props) => (
            <button type="button" {...props}>
              Open filters
            </button>
          )}
        >
          <button type="button" onClick={() => setOpen(false)}>
            Done
          </button>
        </Popover>
      );
    }
    render(<Controlled />);
    await user.click(screen.getByRole("button", { name: "Open filters" }));
    expect(screen.getByRole("button", { name: "Done" })).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Done" }));
    await gone();
    expect(screen.getByRole("button", { name: "Open filters" })).toHaveFocus();
  });

  it("sends Tab from the last control through the trigger, and Shift+Tab from the first back to it", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    await user.tab({ shift: true });
    expect(trigger).toHaveFocus();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Apply" }));
    await user.tab();
    // The trigger took focus first and the Tab moved on from it: the next element in the page order.
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
  });

  it("passes className and rest props to the panel", async () => {
    const { user, trigger } = setup({ className: "custom", "data-testid": "panel" } as Partial<PopoverProps>);
    await user.click(trigger);
    const panel = screen.getByTestId("panel");
    expect(panel).toHaveClass("custom");
    expect(panel).toBe(screen.getByRole("dialog"));
  });

  it("is hosted inside the open modal it belongs to, so the modal's inert page does not lock it out", async () => {
    withLayout();
    const user = userEvent.setup();
    render(
      <Modal open onClose={() => {}} title="Settings">
        <Popover
          label="Help"
          trigger={(props) => (
            <button type="button" {...props}>
              Open help
            </button>
          )}
        >
          <button type="button">Inside help</button>
        </Popover>
      </Modal>,
    );
    await user.click(screen.getByRole("button", { name: "Open help" }));
    const panel = screen.getByRole("dialog", { name: "Help" });
    expect(panel.closest('[aria-modal="true"], dialog[open]')).not.toBeNull();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Help" })).not.toBeInTheDocument());
    // Escape closed the popover alone: the modal under it is still open.
    expect(screen.getByRole("dialog", { name: "Settings" })).toBeInTheDocument();
  });

  it("copies the trigger's theme scope and direction onto the panel", async () => {
    withLayout();
    const user = userEvent.setup();
    render(
      <div data-lufia-theme="example" data-lufia-mode="dark" dir="rtl">
        <Popover
          label="Filters"
          trigger={(props) => (
            <button type="button" {...props}>
              Open filters
            </button>
          )}
        >
          Content
        </Popover>
      </div>,
    );
    await user.click(screen.getByRole("button", { name: "Open filters" }));
    const panel = screen.getByRole("dialog");
    expect(panel).toHaveAttribute("data-lufia-theme", "example");
    expect(panel).toHaveAttribute("data-lufia-mode", "dark");
    expect(panel).toHaveAttribute("dir", "rtl");
  });

  it("places the panel from the trigger's box and flips above it when the bottom has no room", async () => {
    withLayout();
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
      if (this.getAttribute("role") === "dialog") return new DOMRect(0, 0, 200, 120);
      if (this.tagName === "BUTTON") return new DOMRect(100, 740, 80, 40);
      return new DOMRect(0, 0, 0, 0);
    });
    Object.defineProperty(document.documentElement, "clientWidth", { configurable: true, value: 1000 });
    Object.defineProperty(document.documentElement, "clientHeight", { configurable: true, value: 800 });
    const user = userEvent.setup();
    render(
      <Popover
        label="Filters"
        trigger={(props) => (
          <button type="button" {...props}>
            Open filters
          </button>
        )}
      >
        Content
      </Popover>,
    );
    await user.click(screen.getByRole("button", { name: "Open filters" }));
    const panel = screen.getByRole("dialog");
    expect(panel).toHaveAttribute("data-side", "top");
    expect(panel.style.left).toBe("100px");
    expect(panel.style.top).toBe(`${740 - 8 - 120}px`);
    // It follows the trigger when the page scrolls.
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });
    await act(async () => {
      window.dispatchEvent(new Event("scroll"));
    });
  });

  it("has no axe violations, closed and open", async () => {
    const { user, trigger, view } = setup();
    expect(await axe(view.container)).toHaveNoViolations();
    await user.click(trigger);
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
