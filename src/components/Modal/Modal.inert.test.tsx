import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { endAnimation, mockReducedMotion } from "../../test/motion";
import { useConfirmDialog } from "../ConfirmDialog";
import { inertBackground as inertBackgroundV070 } from "../../test/fixtures/inertBackgroundV070";
import { inertBackground } from "../useFocusTrap/inertBackground";
import { Modal } from "./Modal";

beforeEach(() => {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const layers = () => document.querySelectorAll('[data-lufia-part="layer"]');
const notInert = (element: Element) => expect(element.closest("[inert]")).toBeNull();
/** Body children marked inert (a closed kept-mounted panel carries its own `inert`, deeper in the tree). */
const inertAttributes = () => [...document.body.children].filter((child) => child.hasAttribute("inert"));

function Pair() {
  const [a, setA] = useState(false);
  const [b, setB] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setA(true)}>
        Open A
      </button>
      <Modal
        open={a}
        onClose={() => setA(false)}
        title="A"
        footer={<button onClick={() => setB(true)}>Open B</button>}
      />
      <Modal open={b} onClose={() => setB(false)} title="B" />
    </>
  );
}

describe("modal opened over another modal", () => {
  it("is not inert when two sibling modals open one from inside the other", async () => {
    const user = userEvent.setup();
    render(<Pair />);
    expect(layers()).toHaveLength(0);
    await user.click(screen.getByRole("button", { name: "Open A" }));
    notInert(screen.getByRole("dialog", { name: "A" }));
    await user.click(screen.getByRole("button", { name: "Open B" }));
    notInert(screen.getByRole("dialog", { name: "B" }));
    expect(screen.getByRole("dialog", { name: "A", hidden: true }).closest("[inert]")).not.toBeNull();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "B" })).not.toBeInTheDocument());
    notInert(screen.getByRole("dialog", { name: "A" }));
  });

  it("is not inert when a kept-mounted sibling layer was in the document before the first one opened", async () => {
    const user = userEvent.setup();
    function Kept() {
      const [a, setA] = useState(false);
      const [b, setB] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setA(true)}>
            Open A
          </button>
          <Modal
            keepMounted
            open={a}
            onClose={() => setA(false)}
            title="A"
            footer={<button onClick={() => setB(true)}>Open B</button>}
          />
          <Modal keepMounted open={b} onClose={() => setB(false)} title="B" />
        </>
      );
    }
    render(<Kept />);
    await user.click(screen.getByRole("button", { name: "Open A" }));
    await user.click(screen.getByRole("button", { name: "Open B" }));
    notInert(screen.getByRole("dialog", { name: "B" }));
    await user.keyboard("{Escape}");
    notInert(screen.getByRole("dialog", { name: "A" }));
    await user.keyboard("{Escape}");
    expect(inertAttributes()).toHaveLength(0);
  });

  it("leaves the confirm dialog usable when useConfirmDialog is reused over a reopened modal", async () => {
    const user = userEvent.setup();
    function Host() {
      const [open, setOpen] = useState(false);
      const { confirm, confirmDialog } = useConfirmDialog();
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open A
          </button>
          <Modal
            open={open}
            onClose={() => setOpen(false)}
            title="A"
            footer={
              <button
                type="button"
                onClick={() =>
                  void confirm({ title: "Sure?", message: "Really.", confirmLabel: "Yes", cancelLabel: "No" })
                }
              >
                Ask
              </button>
            }
          />
          {confirmDialog}
        </>
      );
    }
    render(<Host />);
    await user.click(screen.getByRole("button", { name: "Open A" }));
    await user.click(screen.getByRole("button", { name: "Ask" }));
    notInert(screen.getByRole("alertdialog"));
    await user.click(screen.getByRole("button", { name: "No" }));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(inertAttributes()).toHaveLength(0);

    await user.click(screen.getByRole("button", { name: "Open A" }));
    await user.click(screen.getByRole("button", { name: "Ask" }));
    notInert(screen.getByRole("alertdialog"));
    expect(screen.getByRole("button", { name: "Yes" })).toHaveFocus();
  });

  it("keeps the top of three stacked modals live and leaves nothing inert, for any closing order", async () => {
    const orders: number[][] = [
      [2, 1, 0],
      [0, 1, 2],
      [1, 0, 2],
      [1, 2, 0],
      [0, 2, 1],
    ];
    for (const order of orders) {
      const user = userEvent.setup();
      function Triple() {
        const [open, setOpen] = useState([false, false, false]);
        const set = (index: number, value: boolean) =>
          setOpen((current) => current.map((entry, i) => (i === index ? value : entry)));
        return (
          <>
            <button type="button" onClick={() => set(0, true)}>
              Open 0
            </button>
            {open.map((isOpen, index) => (
              <Modal
                key={index}
                open={isOpen}
                onClose={() => set(index, false)}
                title={`M${index}`}
                footer={
                  <>
                    <button type="button" onClick={() => set(index + 1, true)}>
                      Open {index + 1}
                    </button>
                    <button type="button" onClick={() => set(index, false)}>
                      Close {index}
                    </button>
                  </>
                }
              />
            ))}
          </>
        );
      }
      const { unmount } = render(<Triple />);
      await user.click(screen.getByRole("button", { name: "Open 0" }));
      await user.click(screen.getByRole("button", { name: "Open 1" }));
      notInert(screen.getByRole("dialog", { name: "M1" }));
      await user.click(screen.getByRole("button", { name: "Open 2" }));
      notInert(screen.getByRole("dialog", { name: "M2" }));

      const open = new Set([0, 1, 2]);
      for (const index of order) {
        // The close button is clicked directly: the dialog may be under another one, so a user could not reach it.
        const close = [...document.querySelectorAll<HTMLElement>("button")].find(
          (candidate) => candidate.textContent === `Close ${index}`,
        )!;
        act(() => close.click());
        open.delete(index);
        await waitFor(() =>
          expect(screen.queryByRole("dialog", { name: `M${index}`, hidden: true })).toBeNull(),
        );
        const top = Math.max(...open);
        if (open.size > 0) notInert(screen.getByRole("dialog", { name: `M${top}` }));
      }
      expect(inertAttributes()).toHaveLength(0);
      unmount();
      cleanup();
    }
  });

  it("removes the layer only after the exit animation ends, and at once under reduced motion", async () => {
    const real = window.getComputedStyle.bind(window);
    vi.spyOn(window, "getComputedStyle").mockImplementation((element: Element, pseudo?: string | null) =>
      // Only the Reveal wrappers play an exit animation here.
      element.hasAttribute("data-variant")
        ? ({ animationName: "fade", animationDuration: "0.2s" } as CSSStyleDeclaration)
        : real(element, pseudo),
    );
    function One({ open }: { open: boolean }) {
      return <Modal open={open} onClose={() => {}} title="A" />;
    }
    const { rerender } = render(<One open />);
    expect(layers()).toHaveLength(1);
    rerender(<One open={false} />);
    expect(layers()).toHaveLength(1);
    const backdrop = document.querySelector('[data-lufia-part="backdrop"]')!;
    const frame = document.querySelector('[data-lufia-part="frame"]')!;
    act(() => endAnimation(backdrop));
    expect(layers()).toHaveLength(1);
    act(() => endAnimation(frame));
    expect(layers()).toHaveLength(0);
    // Re-opening during the exit keeps the layer.
    rerender(<One open />);
    rerender(<One open={false} />);
    rerender(<One open />);
    act(() => endAnimation(document.querySelector('[data-lufia-part="backdrop"]')!));
    expect(layers()).toHaveLength(1);
    notInert(screen.getByRole("dialog", { name: "A" }));

    cleanup();
    vi.restoreAllMocks();
    mockReducedMotion(true);
    const second = render(<One open />);
    expect(layers()).toHaveLength(1);
    second.rerender(<One open={false} />);
    await waitFor(() => expect(layers()).toHaveLength(0));
  });
});

describe("inertBackground", () => {
  const body = (tag = "div") => document.body.appendChild(document.createElement(tag));

  it("lifts the root of a modal that opens inside a root another modal inerted", () => {
    const page = body();
    const a = body();
    const b = body();
    const releaseA = inertBackground(a);
    expect(b).toHaveAttribute("inert");
    const releaseB = inertBackground(b);
    expect(b).not.toHaveAttribute("inert");
    expect(a).toHaveAttribute("inert");
    expect(page).toHaveAttribute("inert");
    releaseA();
    expect(b).not.toHaveAttribute("inert");
    expect(a).toHaveAttribute("inert");
    releaseB();
    for (const element of [page, a, b]) {
      expect(element).not.toHaveAttribute("inert");
      element.remove();
    }
  });

  it("does not touch an element that was inert already", () => {
    const page = body();
    page.setAttribute("inert", "");
    const a = body();
    const release = inertBackground(a);
    release();
    expect(page).toHaveAttribute("inert");
    page.remove();
    a.remove();
  });

  it("agrees across duplicated module copies through the shared global state", async () => {
    const first = (await import("../useFocusTrap/inertBackground")).inertBackground;
    vi.resetModules();
    const second = (await import("../useFocusTrap/inertBackground")).inertBackground;
    expect(second).not.toBe(first);
    const page = body();
    const a = body();
    const b = body();
    const releaseA = first(a);
    const releaseB = second(b);
    try {
      // B (second copy) is on top: its root is live, A's is inert, even though A came from the other copy.
      expect(b).not.toHaveAttribute("inert");
      expect(a).toHaveAttribute("inert");
      releaseB();
      expect(a).not.toHaveAttribute("inert");
      expect(page).toHaveAttribute("inert");
    } finally {
      releaseB();
      releaseA();
      for (const element of [page, a, b]) element.remove();
    }
    expect(page).not.toHaveAttribute("inert");
  });

  it("hands an element back live when it becomes exempt while a modal is open", () => {
    const page = body();
    const a = body();
    const release = inertBackground(a);
    expect(page).toHaveAttribute("inert");
    page.setAttribute("data-lufia-inert-exempt", "");
    // Another modal opening triggers a fresh pass.
    const b = body();
    const releaseB = inertBackground(b);
    expect(page).not.toHaveAttribute("inert");
    releaseB();
    release();
    for (const element of [page, a, b]) element.remove();
  });

  it("does not leave a detached element inert when it is reattached later", () => {
    const page = body();
    const a = body();
    const release = inertBackground(a);
    expect(page).toHaveAttribute("inert");
    page.remove();
    const b = body();
    const releaseB = inertBackground(b); // a fresh pass sees `page` gone
    expect(page).not.toHaveAttribute("inert");
    releaseB();
    release();
    document.body.appendChild(page);
    expect(page).not.toHaveAttribute("inert");
    for (const element of [page, a, b]) element.remove();
  });
});

describe("inertBackground beside a v0.7.0 copy", () => {
  const setup = () => {
    document.body.innerHTML =
      "<div id=app></div><div id=oldL><div id=oldC></div></div><div id=newL><div id=newC></div></div>";
    const get = (id: string) => document.getElementById(id)!;
    return { oldC: get("oldC"), newC: get("newC") };
  };
  const orders: [string, string[]][] = [
    ["old, new, close old, close new", ["open old", "open new", "close old", "close new"]],
    ["old, new, close new, close old", ["open old", "open new", "close new", "close old"]],
    ["new, old, close old, close new", ["open new", "open old", "close old", "close new"]],
    ["new, old, close new, close old", ["open new", "open old", "close new", "close old"]],
  ];

  it.each(orders)("never throws and leaves nothing inert: %s", (_name, steps) => {
    const { oldC, newC } = setup();
    const releases: Record<string, () => void> = {};
    for (const step of steps) {
      const [op, who] = step.split(" ") as [string, "old" | "new"];
      expect(() => {
        if (op === "open")
          releases[who] = (who === "old" ? inertBackgroundV070 : inertBackground)(
            who === "old" ? oldC : newC,
          );
        else releases[who]!();
      }).not.toThrow();
    }
    expect([...document.body.children].filter((child) => child.hasAttribute("inert"))).toHaveLength(0);
    document.body.innerHTML = "";
  });

  it("does not break a v0.7.0 copy that is loaded after the current one has run", async () => {
    const { oldC, newC } = setup();
    // A page where no copy has run yet: the current copy creates its state first, the older one is loaded afterwards.
    delete (globalThis as { __lufiaInertState?: unknown }).__lufiaInertState;
    delete (globalThis as { __lufiaInertStateV2?: unknown }).__lufiaInertStateV2;
    inertBackground(newC)();
    vi.resetModules();
    const late = (await import("../../test/fixtures/inertBackgroundV070")).inertBackground;
    let release = () => {};
    expect(() => {
      release = late(oldC);
    }).not.toThrow();
    expect(() => release()).not.toThrow();
    expect([...document.body.children].filter((child) => child.hasAttribute("inert"))).toHaveLength(0);
    document.body.innerHTML = "";
  });
});
