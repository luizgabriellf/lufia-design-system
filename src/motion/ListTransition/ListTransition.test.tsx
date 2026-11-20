import { act, render, screen, waitFor } from "@testing-library/react";
import { axe } from "../../test/axe";
import { endAnimation, mockReducedMotion, stubExitAnimation } from "../../test/motion";
import { ListTransition } from "./ListTransition";

type Task = { id: string; label: string };
const task = (id: string): Task => ({ id, label: `Task ${id}` });

function List({ items, ...rest }: { items: Task[]; tabIndex?: number }) {
  return (
    <ListTransition items={items} getKey={(t) => t.id} aria-label="Tasks" {...rest}>
      {(t) => <span>{t.label}</span>}
    </ListTransition>
  );
}

const itemOf = (label: string) => screen.getByText(label).closest("li")!;

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("ListTransition", () => {
  it("renders the initial items without animating them", () => {
    render(<List items={[task("a"), task("b")]} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    for (const li of screen.getAllByRole("listitem")) {
      expect(li).toHaveAttribute("data-state", "open");
      expect(li).not.toHaveAttribute("data-animate");
    }
  });

  it("animates a new key in and leaves the others alone", () => {
    const { rerender } = render(<List items={[task("a")]} />);
    rerender(<List items={[task("a"), task("b")]} />);
    expect(itemOf("Task b")).toHaveAttribute("data-animate");
    expect(itemOf("Task a")).not.toHaveAttribute("data-animate");
  });

  it("keeps a removed item mounted, inert and hidden until its exit ends, then unmounts it", () => {
    stubExitAnimation();
    const { rerender } = render(<List items={[task("a"), task("b")]} />);
    rerender(<List items={[task("a")]} />);
    const leaving = itemOf("Task b");
    expect(leaving).toHaveAttribute("data-state", "closed");
    expect(leaving).toHaveAttribute("inert");
    expect(leaving).toHaveAttribute("aria-hidden", "true");
    act(() => endAnimation(leaving));
    expect(screen.queryByText("Task b")).not.toBeInTheDocument();
    expect(screen.getAllByRole("listitem", { hidden: true })).toHaveLength(1);
  });

  it("ignores animationend bubbling from inside the item", () => {
    stubExitAnimation();
    const { rerender } = render(<List items={[task("a"), task("b")]} />);
    rerender(<List items={[task("a")]} />);
    act(() => endAnimation(screen.getByText("Task b")));
    expect(screen.getByText("Task b")).toBeInTheDocument();
  });

  it("unmounts on the next frame when no exit animation is defined", async () => {
    const { rerender } = render(<List items={[task("a"), task("b")]} />);
    rerender(<List items={[task("a")]} />);
    expect(screen.getByText("Task b")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText("Task b")).not.toBeInTheDocument());
  });

  it("unmounts after the exit duration plus a margin when animationend never fires", () => {
    vi.useFakeTimers();
    try {
      stubExitAnimation();
      const { rerender } = render(<List items={[task("a"), task("b")]} />);
      rerender(<List items={[task("a")]} />);
      act(() => void vi.advanceTimersByTime(100));
      expect(screen.getByText("Task b")).toBeInTheDocument();
      act(() => void vi.advanceTimersByTime(300));
      expect(screen.queryByText("Task b")).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("keeps the leaving item where it was and orders survivors by items", () => {
    stubExitAnimation();
    const { rerender } = render(<List items={[task("a"), task("b"), task("c")]} />);
    rerender(<List items={[task("c"), task("a")]} />);
    const labels = screen.getAllByRole("listitem", { hidden: true }).map((li) => li.textContent);
    expect(labels).toEqual(["Task c", "Task a", "Task b"]);
  });

  it("brings the same item back when its key returns during the exit, with no duplicate", () => {
    stubExitAnimation();
    const { rerender } = render(<List items={[task("a"), task("b")]} />);
    const before = itemOf("Task b");
    rerender(<List items={[task("a")]} />);
    rerender(<List items={[task("a"), task("b")]} />);
    expect(screen.getAllByText("Task b")).toHaveLength(1);
    const back = itemOf("Task b");
    expect(back).toBe(before);
    expect(back).toHaveAttribute("data-state", "open");
    expect(back).not.toHaveAttribute("inert");
    expect(back).not.toHaveAttribute("aria-hidden");
    act(() => endAnimation(back));
    expect(screen.getByText("Task b")).toBeInTheDocument();
  });

  it("survives rapid add and remove of the same key", () => {
    stubExitAnimation();
    const { rerender } = render(<List items={[task("a")]} />);
    for (let i = 0; i < 4; i++) {
      rerender(<List items={[task("a"), task("b")]} />);
      rerender(<List items={[task("a")]} />);
    }
    expect(screen.getAllByText("Task b")).toHaveLength(1);
    act(() => endAnimation(itemOf("Task b")));
    expect(screen.queryByText("Task b")).not.toBeInTheDocument();
  });

  it("adds and removes at once under reduced motion, leaving no exit node", () => {
    mockReducedMotion(true);
    stubExitAnimation();
    const { rerender } = render(<List items={[task("a"), task("b")]} />);
    rerender(<List items={[task("a")]} />);
    expect(screen.queryByText("Task b")).not.toBeInTheDocument();
    rerender(<List items={[task("a"), task("b")]} />);
    expect(screen.getByText("Task b")).toBeInTheDocument();
  });

  it("moves focus to the list when a focused item leaves and the list has a tabIndex", () => {
    stubExitAnimation();
    const items = [task("a"), task("b")];
    const Item = ({ list }: { list: Task[] }) => (
      <ListTransition items={list} getKey={(t) => t.id} aria-label="Tasks" tabIndex={-1}>
        {(t) => <button type="button">{t.label}</button>}
      </ListTransition>
    );
    const { rerender } = render(<Item list={items} />);
    screen.getByText("Task b").focus();
    rerender(<Item list={[items[0]!]} />);
    expect(screen.getByRole("list")).toHaveFocus();
  });

  it("leaves focus alone when the list has no tabIndex", () => {
    stubExitAnimation();
    const items = [task("a"), task("b")];
    const Item = ({ list }: { list: Task[] }) => (
      <ListTransition items={list} getKey={(t) => t.id} aria-label="Tasks">
        {(t) => <button type="button">{t.label}</button>}
      </ListTransition>
    );
    const { rerender } = render(<Item list={items} />);
    screen.getByText("Task b").focus();
    rerender(<Item list={[items[0]!]} />);
    expect(screen.getByRole("list")).not.toHaveFocus();
  });

  it("renders ul > li with no wrapper between them, and div items for as=div", () => {
    const { container, rerender } = render(<List items={[task("a")]} />);
    const ul = container.firstElementChild!;
    expect(ul.tagName).toBe("UL");
    expect([...ul.children].every((c) => c.tagName === "LI")).toBe(true);
    rerender(
      <ListTransition as="div" items={[task("a")]} getKey={(t) => t.id}>
        {(t) => t.label}
      </ListTransition>,
    );
    expect(container.firstElementChild!.tagName).toBe("DIV");
    expect(container.firstElementChild!.firstElementChild!.tagName).toBe("DIV");
  });

  it("passes className, rest props and itemClassName", () => {
    render(
      <ListTransition
        items={[task("a")]}
        getKey={(t) => t.id}
        className="x"
        data-testid="l"
        itemClassName="y"
      >
        {(t) => t.label}
      </ListTransition>,
    );
    expect(screen.getByTestId("l")).toHaveClass("x");
    expect(screen.getByRole("listitem")).toHaveClass("y");
  });

  it("has no axe violations, also while an item leaves", async () => {
    stubExitAnimation();
    const { container, rerender } = render(<List items={[task("a"), task("b")]} />);
    expect(await axe(container)).toHaveNoViolations();
    rerender(<List items={[task("a")]} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  describe("forms", () => {
    function Form({ items }: { items: Task[] }) {
      return (
        <form aria-label="Form">
          <ListTransition items={items} getKey={(t) => t.id} aria-label="Tasks">
            {(t) => <input aria-label={t.label} name={`task-${t.id}`} defaultValue={t.id} required />}
          </ListTransition>
        </form>
      );
    }

    it("leaves a leaving item's controls out of FormData while it is still mounted", () => {
      stubExitAnimation();
      const { rerender } = render(<Form items={[task("a"), task("b")]} />);
      const form = screen.getByRole("form") as HTMLFormElement;
      expect([...new FormData(form).keys()]).toEqual(["task-a", "task-b"]);
      rerender(<Form items={[task("a")]} />);
      expect(screen.getByLabelText("Task b", { selector: "input" })).toBeInTheDocument();
      expect([...new FormData(form).keys()]).toEqual(["task-a"]);
    });

    it("does not let an empty required control in a leaving item fail validation", () => {
      stubExitAnimation();
      const { rerender } = render(<Form items={[task("a"), task("b")]} />);
      const form = screen.getByRole("form") as HTMLFormElement;
      const b = screen.getByLabelText("Task b") as HTMLInputElement;
      b.value = "";
      expect(form.checkValidity()).toBe(false);
      rerender(<Form items={[task("a")]} />);
      expect(b).toBeDisabled();
      expect(form.checkValidity()).toBe(true);
    });

    it("re-enables the controls when the key returns during the exit", () => {
      stubExitAnimation();
      const { rerender } = render(<Form items={[task("a"), task("b")]} />);
      const b = screen.getByLabelText("Task b");
      rerender(<Form items={[task("a")]} />);
      rerender(<Form items={[task("a"), task("b")]} />);
      expect(screen.getByLabelText("Task b")).toBe(b);
      expect(b).toBeEnabled();
    });
  });

  it("unmounts a leaving item without waiting for its exit when it is not rendered", async () => {
    stubExitAnimation();
    const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "checkVisibility");
    Object.defineProperty(HTMLElement.prototype, "checkVisibility", {
      value: () => false,
      configurable: true,
    });
    try {
      const { rerender } = render(<List items={[task("a"), task("b")]} />);
      rerender(<List items={[task("a")]} />);
      await waitFor(() => expect(screen.queryByText("Task b")).not.toBeInTheDocument(), { timeout: 100 });
    } finally {
      if (original) Object.defineProperty(HTMLElement.prototype, "checkVisibility", original);
      else delete (HTMLElement.prototype as Partial<HTMLElement>).checkVisibility;
    }
  });
});
