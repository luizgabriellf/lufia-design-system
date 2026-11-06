import { act, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { decodeModalId, useModalState, type ModalStateAdapter } from "./useModalState";

/** A router stand-in: the URL lives in a variable and every write is recorded. */
function memoryAdapter(initial = "") {
  let search = initial;
  const writes: Array<{ search: string; mode: string }> = [];
  const listeners = new Set<() => void>();
  const adapter: ModalStateAdapter = {
    get: () => new URLSearchParams(search),
    set: (params, mode) => {
      search = params.toString();
      writes.push({ search, mode });
      listeners.forEach((fn) => fn());
    },
    subscribe: (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
  return { adapter, writes, current: () => search };
}

describe("useModalState", () => {
  it("reads the open modal and its id from the URL", () => {
    const { adapter } = memoryAdapter("modal=detail&id=42&tab=a");
    const { result } = renderHook(() => useModalState({ adapter }));
    expect(result.current.modal).toBe("detail");
    expect(result.current.id).toBe("42");
  });

  it("opens a modal with a push and keeps unrelated parameters", () => {
    const { adapter, writes } = memoryAdapter("status=open");
    const { result } = renderHook(() => useModalState({ adapter }));
    act(() => result.current.open("detail", "42"));
    expect(writes).toEqual([{ search: "status=open&modal=detail&id=42", mode: "push" }]);
    expect(result.current.modal).toBe("detail");
  });

  it("remembers the parent modal and returns to it on close", () => {
    const { adapter, writes } = memoryAdapter("modal=detail&id=42");
    const { result } = renderHook(() => useModalState({ adapter }));
    act(() => result.current.open("history", "42"));
    expect(writes.at(-1)?.search).toBe("modal=history&id=42&returnModal=detail&returnId=42");
    act(() => result.current.close());
    expect(writes.at(-1)).toEqual({ search: "modal=detail&id=42", mode: "replace" });
  });

  it("closes to an empty query", () => {
    const { adapter, writes } = memoryAdapter("modal=detail");
    const { result } = renderHook(() => useModalState({ adapter }));
    act(() => result.current.close());
    expect(writes.at(-1)).toEqual({ search: "", mode: "replace" });
    expect(result.current.modal).toBeNull();
  });

  it("drops consumed one-shot parameters when opening", () => {
    const { adapter, writes } = memoryAdapter("new=1&page=2");
    const { result } = renderHook(() => useModalState({ adapter }));
    act(() => result.current.open("create", undefined, { consumeKeys: ["new"] }));
    expect(writes.at(-1)?.search).toBe("page=2&modal=create");
  });

  it("uses the latest URL when a stale callback runs after another parameter changed", () => {
    const store = memoryAdapter("filter=a");
    const { result } = renderHook(() => useModalState({ adapter: store.adapter }));
    const staleOpen = result.current.open;
    act(() => store.adapter.set(new URLSearchParams("filter=b"), "replace"));
    act(() => staleOpen("detail"));
    expect(store.current()).toBe("filter=b&modal=detail");
  });

  it("supports renamed parameters and a navigation callback", () => {
    const { adapter, writes } = memoryAdapter();
    const onNavigate = vi.fn();
    const { result } = renderHook(() => useModalState({ adapter, onNavigate, keys: { modal: "dialog" } }));
    act(() => result.current.open("detail"));
    expect(writes.at(-1)?.search).toBe("dialog=detail");
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it("re-renders when the URL changes outside the hook (back button)", () => {
    const store = memoryAdapter();
    const { result } = renderHook(() => useModalState({ adapter: store.adapter }));
    act(() => store.adapter.set(new URLSearchParams("modal=detail"), "push"));
    expect(result.current.modal).toBe("detail");
  });

  it("drives the browser History API when no adapter is given", async () => {
    window.history.replaceState(null, "", "/page?tab=a");
    const user = userEvent.setup();
    function Demo() {
      const { modal, open, close } = useModalState();
      return (
        <div>
          <p>{modal ?? "closed"}</p>
          <button type="button" onClick={() => open("detail", "7")}>
            Open
          </button>
          <button type="button" onClick={close}>
            Close
          </button>
        </div>
      );
    }
    render(<Demo />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByText("detail")).toBeInTheDocument();
    expect(window.location.search).toBe("?tab=a&modal=detail&id=7");
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.getByText("closed")).toBeInTheDocument();
    expect(window.location.search).toBe("?tab=a");
    window.history.replaceState(null, "", "/");
  });
});

describe("decodeModalId", () => {
  it("decodes composite ids and tolerates malformed ones", () => {
    expect(decodeModalId("item%3A%3A42")).toBe("item::42");
    expect(decodeModalId("%E0%A4%A")).toBe("%E0%A4%A");
    expect(decodeModalId(null)).toBeNull();
    expect(decodeModalId("")).toBeNull();
  });
});
