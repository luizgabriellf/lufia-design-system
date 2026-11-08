import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRef } from "react";
import { useNavScrollHints } from "./useNavScrollHints";

function Harness({
  current,
  keys = ["a", "b", "c"],
  generation = 0,
}: {
  current: string;
  keys?: string[];
  generation?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  useNavScrollHints(ref);
  return (
    <nav ref={ref} aria-label="Nav">
      {keys.map((key) => (
        <a key={`${key}${generation}`} href={`/${key}`} aria-current={key === current ? "page" : undefined}>
          {key}
        </a>
      ))}
    </nav>
  );
}

let size = { client: 100, scroll: 400 };
const observers: Array<() => void> = [];
let observed: Element[] = [];

beforeEach(() => {
  size = { client: 100, scroll: 400 };
  observers.length = 0;
  observed = [];
  const proto = HTMLElement.prototype;
  Object.defineProperty(proto, "clientHeight", { configurable: true, get: () => size.client });
  Object.defineProperty(proto, "scrollHeight", { configurable: true, get: () => size.scroll });
  Object.defineProperty(proto, "scrollTop", {
    configurable: true,
    get(this: { _top?: number }) {
      return this._top ?? 0;
    },
    set(this: { _top?: number }, value: number) {
      this._top = value;
    },
  });
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
    const top = this.tagName === "NAV" ? 0 : this.textContent === "c" ? 300 : 10;
    const height = this.tagName === "NAV" ? 100 : 20;
    return { top, bottom: top + height, height } as DOMRect;
  });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: () => void) {
        observers.push(callback);
      }
      observe(target: Element) {
        observed.push(target);
      }
      disconnect() {}
    },
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  for (const name of ["clientHeight", "scrollHeight", "scrollTop"]) {
    delete (HTMLElement.prototype as unknown as Record<string, unknown>)[name];
  }
});

const nav = () => screen.getByRole("navigation", { name: "Nav" });

describe("useNavScrollHints", () => {
  it("centres a current page that is out of view, once for each page", async () => {
    const { rerender } = render(<Harness current="c" />);
    // 300 (item top) - 0 (view top) - (100 - 20) / 2
    expect(nav().scrollTop).toBe(260);
    rerender(<Harness current="c" />);
    await act(async () => {});
    expect(nav().scrollTop).toBe(260);
    rerender(<Harness current="a" />);
    await act(async () => {});
    expect(nav().scrollTop).toBe(260);
    rerender(<Harness current="c" />);
    await waitFor(() => expect(nav().scrollTop).toBe(520));
  });

  it("does not pull the list back when the person has scrolled away and the size changes", () => {
    render(<Harness current="c" />);
    expect(nav().scrollTop).toBe(260);
    nav().scrollTop = 0;
    act(() => observers.forEach((callback) => callback()));
    expect(nav().scrollTop).toBe(0);
  });

  it("watches the scroller and its children, so a group opening or closing re-marks the edges", () => {
    render(<Harness current="a" />);
    expect(observed).toContain(nav());
    for (const child of Array.from(nav().children)) expect(observed).toContain(child);
    expect(nav()).toHaveAttribute("data-more", "end");
    // The content shrinks (a group closed) without the scroller's own box changing.
    size = { client: 100, scroll: 100 };
    act(() => observers.forEach((callback) => callback()));
    expect(nav()).not.toHaveAttribute("data-more");
  });

  it("re-marks and watches new children when items are added or removed", async () => {
    const { rerender } = render(<Harness current="a" keys={["a"]} />);
    size = { client: 100, scroll: 100 };
    act(() => observers.forEach((callback) => callback()));
    expect(nav()).not.toHaveAttribute("data-more");
    size = { client: 100, scroll: 400 };
    rerender(<Harness current="a" keys={["a", "b", "c"]} />);
    await waitFor(() => expect(nav()).toHaveAttribute("data-more", "end"));
  });

  it("brings a current item that appears as a new node into view, and not the same node again", async () => {
    const { rerender } = render(<Harness current="c" keys={["a", "b"]} />);
    expect(nav().scrollTop).toBe(0);
    rerender(<Harness current="c" keys={["a", "b", "c"]} />);
    await waitFor(() => expect(nav().scrollTop).toBe(260));
    nav().scrollTop = 0;
    rerender(<Harness current="c" keys={["a", "b", "c"]} />);
    await act(async () => {});
    expect(nav().scrollTop).toBe(0);
    // The same page rendered as a fresh node (a remount).
    rerender(<Harness current="c" keys={["a", "b", "c"]} generation={1} />);
    await waitFor(() => expect(nav().scrollTop).toBe(260));
  });

  it("leaves the scroll alone when the current page is already in view", () => {
    render(<Harness current="a" />);
    expect(nav().scrollTop).toBe(0);
  });

  it("waits for the scroller to have a size, then reveals", () => {
    size = { client: 0, scroll: 0 };
    render(<Harness current="c" />);
    expect(nav().scrollTop).toBe(0);
    size = { client: 100, scroll: 400 };
    act(() => observers.forEach((callback) => callback()));
    expect(nav().scrollTop).toBe(260);
  });

  it("marks which edges hide more items, and none when everything fits", () => {
    render(<Harness current="a" />);
    expect(nav()).toHaveAttribute("data-more", "end");
    nav().scrollTop = 100;
    fireEvent.scroll(nav());
    expect(nav()).toHaveAttribute("data-more", "both");
    nav().scrollTop = 300;
    fireEvent.scroll(nav());
    expect(nav()).toHaveAttribute("data-more", "start");
    size = { client: 100, scroll: 100 };
    nav().scrollTop = 0;
    fireEvent.scroll(nav());
    expect(nav()).not.toHaveAttribute("data-more");
  });
});
