import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState } from "react";
import { axe } from "../../test/axe";
import { hasOpenOverlay, overlayDepth } from "./layerStack";
import { getFocusableElements, useFocusTrap, type UseFocusTrapOptions } from "./useFocusTrap";

function Trap({
  name,
  options,
  onEscape,
}: {
  name: string;
  options?: UseFocusTrapOptions;
  onEscape?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(true, ref, { onEscape, ...options });
  return (
    <div ref={ref} role="dialog" aria-label={name} tabIndex={-1}>
      <button type="button">{name} first</button>
      <button type="button" disabled>
        {name} disabled
      </button>
      <input aria-label={`${name} field`} />
      <button type="button">{name} last</button>
    </div>
  );
}

function Host({ options }: { options?: UseFocusTrapOptions }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(open, ref, { onEscape: () => setOpen(false), ...options });
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      <button type="button">Behind</button>
      {open ? (
        <div ref={ref} role="dialog" aria-label="Panel" tabIndex={-1}>
          <button type="button">One</button>
          <button type="button">Two</button>
        </div>
      ) : null}
    </>
  );
}

describe("useFocusTrap", () => {
  it("focuses the container when it opens", () => {
    render(<Trap name="A" />);
    expect(screen.getByRole("dialog", { name: "A" })).toHaveFocus();
  });

  it("can focus the first tabbable element or a chosen one instead", () => {
    const { unmount } = render(<Trap name="A" options={{ initialFocus: "first" }} />);
    expect(screen.getByRole("button", { name: "A first" })).toHaveFocus();
    unmount();

    function Chosen() {
      const target = useRef<HTMLButtonElement>(null);
      const ref = useRef<HTMLDivElement>(null);
      useFocusTrap(true, ref, { initialFocus: target });
      return (
        <div ref={ref} tabIndex={-1}>
          <button type="button">Other</button>
          <button type="button" ref={target}>
            Safe
          </button>
        </div>
      );
    }
    render(<Chosen />);
    expect(screen.getByRole("button", { name: "Safe" })).toHaveFocus();
  });

  it("wraps Tab from the last element to the first and Shift+Tab back, skipping disabled controls", async () => {
    const user = userEvent.setup();
    render(<Trap name="A" options={{ initialFocus: "first" }} />);
    await user.tab();
    expect(screen.getByLabelText("A field")).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "A last" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "A first" })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "A last" })).toHaveFocus();
  });

  /* eslint-disable jsx-a11y/tabindex-no-positive -- Exercise explicit tab order values for compatibility. */
  it("skips programmatic-only and disabled controls even when they declare tabindex", () => {
    const { container } = render(
      <div>
        <button type="button" tabIndex={-2}>
          Programmatic only
        </button>
        <button type="button" disabled tabIndex={2}>
          Disabled with tabindex
        </button>
        <button type="button">Tabbable</button>
      </div>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(getFocusableElements(root)).toEqual([screen.getByRole("button", { name: "Tabbable" })]);
  });

  it("uses positive tabindex order, then DOM order, and wraps at the real Tab endpoints", async () => {
    const user = userEvent.setup();
    function OrderedTrap() {
      const ref = useRef<HTMLDivElement>(null);
      useFocusTrap(true, ref, { initialFocus: "first" });
      return (
        <div ref={ref} role="dialog" aria-label="Ordered" tabIndex={-1}>
          <button type="button">Normal first</button>
          <button type="button" tabIndex={3}>
            Priority three
          </button>
          <button type="button" tabIndex={1}>
            Priority one
          </button>
          <button type="button" tabIndex={-2}>
            Programmatic only
          </button>
          <button type="button">Normal last</button>
        </div>
      );
    }
    render(<OrderedTrap />);

    const first = screen.getByRole("button", { name: "Priority one" });
    const second = screen.getByRole("button", { name: "Priority three" });
    const normalFirst = screen.getByRole("button", { name: "Normal first" });
    const normalLast = screen.getByRole("button", { name: "Normal last" });
    expect(first).toHaveFocus();
    await user.tab();
    expect(second).toHaveFocus();
    await user.tab();
    expect(normalFirst).toHaveFocus();
    await user.tab();
    expect(normalLast).toHaveFocus();
    await user.tab();
    expect(first).toHaveFocus();
    await user.tab({ shift: true });
    expect(normalLast).toHaveFocus();
  });

  /* eslint-enable jsx-a11y/tabindex-no-positive */

  it("brings focus back inside when it escaped to the page", async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Outside</button>
        <Trap name="A" />
      </>,
    );
    screen.getByRole("button", { name: "Outside" }).focus();
    await user.tab();
    expect(screen.getByRole("button", { name: "A first" })).toHaveFocus();
  });

  it("calls onEscape only for the topmost of two stacked traps", async () => {
    const user = userEvent.setup();
    const outer = vi.fn();
    const inner = vi.fn();
    render(
      <>
        <Trap name="Outer" onEscape={outer} />
        <Trap name="Inner" onEscape={inner} />
      </>,
    );
    await user.keyboard("{Escape}");
    expect(inner).toHaveBeenCalledTimes(1);
    expect(outer).not.toHaveBeenCalled();
  });

  it("ignores Escape when no handler is given or the key was already used", async () => {
    const user = userEvent.setup();
    const onEscape = vi.fn();
    // Registered before the trap's own listener, so it runs first, as a nested widget's handler would.
    const claim = (event: KeyboardEvent) => event.preventDefault();
    document.addEventListener("keydown", claim);
    render(<Trap name="A" onEscape={onEscape} />);
    await user.keyboard("{Escape}");
    expect(onEscape).not.toHaveBeenCalled();
    document.removeEventListener("keydown", claim);
  });

  it("returns focus to the element that opened it", async () => {
    const user = userEvent.setup();
    render(<Host />);
    const opener = screen.getByRole("button", { name: "Open" });
    await user.click(opener);
    expect(screen.getByRole("dialog")).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it("does not restore focus when asked not to", async () => {
    const user = userEvent.setup();
    render(<Host options={{ restoreFocus: false }} />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    await user.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: "Open" })).not.toHaveFocus();
  });

  it("makes the rest of the page inert while open, and only what it set itself", () => {
    const page = document.createElement("div");
    const alreadyInert = document.createElement("div");
    alreadyInert.setAttribute("inert", "");
    const live = document.createElement("div");
    live.setAttribute("data-lufia-inert-exempt", "");
    const layer = document.createElement("div");
    document.body.append(page, alreadyInert, live, layer);

    const { unmount } = render(<Trap name="A" options={{ inertBackground: true }} />, { container: layer });
    expect(page).toHaveAttribute("inert");
    expect(layer).not.toHaveAttribute("inert");
    expect(live).not.toHaveAttribute("inert");

    unmount();
    expect(page).not.toHaveAttribute("inert");
    expect(alreadyInert).toHaveAttribute("inert");
    page.remove();
    alreadyInert.remove();
    live.remove();
    layer.remove();
  });

  it("keeps the page inert until the last of two stacked traps closes", () => {
    const page = document.createElement("div");
    const first = document.createElement("div");
    const second = document.createElement("div");
    document.body.append(page, first, second);

    const a = render(<Trap name="A" options={{ inertBackground: true }} />, { container: first });
    const b = render(<Trap name="B" options={{ inertBackground: true }} />, { container: second });
    expect(first).toHaveAttribute("inert");
    b.unmount();
    expect(first).not.toHaveAttribute("inert");
    expect(page).toHaveAttribute("inert");
    a.unmount();
    expect(page).not.toHaveAttribute("inert");
    page.remove();
    first.remove();
    second.remove();
  });

  it("has no axe violations while open", async () => {
    const { container } = render(<Trap name="A" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("overlay readers with real traps", () => {
  it("follow a trap opening and closing, and count nested traps", async () => {
    const user = userEvent.setup();
    expect(hasOpenOverlay()).toBe(false);
    render(<Host />);
    expect(overlayDepth()).toBe(0);
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(hasOpenOverlay()).toBe(true);
    expect(overlayDepth()).toBe(1);
    render(<Trap name="Nested" />);
    expect(overlayDepth()).toBe(2);
  });

  it("drop to zero once the traps unmount", () => {
    const { unmount } = render(<Trap name="A" />);
    expect(overlayDepth()).toBe(1);
    unmount();
    expect(hasOpenOverlay()).toBe(false);
  });
});

describe("inertBackground across module copies", () => {
  it("shares its reference counts, so one copy's release keeps the page inert while another copy's modal is open", async () => {
    const first = (await import("./inertBackground")).inertBackground;
    vi.resetModules();
    const second = (await import("./inertBackground")).inertBackground;
    expect(second).not.toBe(first);

    const page = document.body.appendChild(document.createElement("div"));
    const one = document.body.appendChild(document.createElement("div"));
    const two = document.body.appendChild(document.createElement("div"));
    const releaseFirst = first(one);
    const releaseSecond = second(two);
    try {
      expect(page).toHaveAttribute("inert");
      releaseFirst();
      // The second copy's modal is still open, so the page behind must stay inert.
      expect(page).toHaveAttribute("inert");
    } finally {
      releaseFirst();
      releaseSecond();
      page.remove();
      one.remove();
      two.remove();
    }
    expect(page).not.toHaveAttribute("inert");
  });
});
