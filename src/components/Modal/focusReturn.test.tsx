import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { mockDialog } from "../../test/dialog";
import { mockReducedMotion, stubExitAnimation } from "../../test/motion";
import { NavSheet } from "../AppShell/NavSheet";
import { Modal } from "./Modal";

/**
 * Where focus goes when a modal layer closes, over every combination that has broken before: whether the first dialog is
 * unmounted or kept mounted when closed, which kind of layer opens next, where that layer sits in the tree (sibling effects
 * run in tree order), whether the first dialog was flushed by an earlier swap and reopened, and whether the new layer replaces
 * the first dialog (swap) or stacks over it while it stays open.
 */
type First = "unmounting" | "keepMounted";
type Next = "portal" | "native" | "navsheet";
type Order = "before" | "after";
type History = "first open" | "flushed then reopened";
type Scenario = "swap" | "stack";

function Matrix({ first, next, order }: { first: First; next: Next; order: Order }) {
  const [a, setA] = useState(false);
  const [b, setB] = useState(false);
  const [c, setC] = useState(false);
  const layer =
    next === "navsheet" ? (
      <NavSheet open={b} onOpenChange={setB} label="B" renderAs="dialog">
        <a href="/one">One</a>
      </NavSheet>
    ) : (
      <Modal
        open={b}
        renderAs={next === "native" ? "dialog" : "portal"}
        title="B"
        onClose={() => setB(false)}
      >
        <input aria-label="In B" />
      </Modal>
    );
  return (
    <>
      {order === "before" ? layer : null}
      <button type="button" onClick={() => setA(true)}>
        Open A
      </button>
      <Modal
        open={a}
        renderAs="dialog"
        keepMounted={first === "keepMounted"}
        title="A"
        onClose={() => setA(false)}
      >
        <button
          type="button"
          onClick={() => {
            setA(false);
            setB(true);
          }}
        >
          Swap
        </button>
        <button type="button" onClick={() => setC(true)}>
          Stack
        </button>
      </Modal>
      {order === "after" ? layer : null}
      <Modal open={c} renderAs="dialog" title="C" onClose={() => setC(false)}>
        <input aria-label="In C" />
      </Modal>
    </>
  );
}

const firsts: First[] = ["unmounting", "keepMounted"];
const nexts: Next[] = ["portal", "native", "navsheet"];
const orders: Order[] = ["before", "after"];
const histories: History[] = ["first open", "flushed then reopened"];
const scenarios: Scenario[] = ["swap", "stack"];
const cases = firsts.flatMap((first) =>
  nexts.flatMap((next) =>
    orders.flatMap((order) =>
      histories.flatMap((history) =>
        scenarios.map((scenario) => [first, next, order, history, scenario] as const),
      ),
    ),
  ),
);

describe("focus return across modal layers", () => {
  let dialogMock: ReturnType<typeof mockDialog>;
  beforeEach(() => {
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
    dialogMock = mockDialog();
    mockReducedMotion(false);
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    dialogMock.restore();
  });

  it.each(cases)("A %s, layer %s placed %s A, %s, %s", async (first, next, order, history, scenario) => {
    const user = userEvent.setup();
    render(<Matrix first={first} next={next} order={order} />);
    const opener = screen.getByRole("button", { name: "Open A" });
    const dialogNamed = (name: string) => screen.getByRole("dialog", { name });
    const swap = async () => {
      await user.click(within(dialogNamed("A")).getByRole("button", { name: "Swap" }));
      await waitFor(() => expect(dialogNamed("B")).toContainElement(document.activeElement as HTMLElement));
    };
    const closeTop = async (name: string) => {
      await user.keyboard("{Escape}");
      await waitFor(() => expect(screen.queryByRole("dialog", { name })).not.toBeInTheDocument());
    };

    await user.click(opener);
    if (history === "flushed then reopened") {
      stubExitAnimation("exit");
      await swap();
      vi.restoreAllMocks();
      await closeTop("B");
      await waitFor(() => expect(opener).toHaveFocus());
      await user.click(opener);
    }

    if (scenario === "swap") {
      stubExitAnimation("exit");
      await swap();
      vi.restoreAllMocks();
      await closeTop("B");
      await waitFor(() => expect(opener).toHaveFocus());
    } else {
      const stack = within(dialogNamed("A")).getByRole("button", { name: "Stack" });
      await user.click(stack);
      await waitFor(() => expect(dialogNamed("C")).toContainElement(document.activeElement as HTMLElement));
      await closeTop("C");
      await waitFor(() => expect(stack).toHaveFocus());
    }
  });
});
