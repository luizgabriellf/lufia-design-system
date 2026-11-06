import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState } from "react";
import { axe } from "../../test/axe";
import { useFocusTrap, type UseFocusTrapOptions } from "./useFocusTrap";

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
