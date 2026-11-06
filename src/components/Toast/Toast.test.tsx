import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { useEffect } from "react";
import { axe } from "../../test/axe";
import { mockReducedMotion } from "../../test/motion";
import { LufiaProvider } from "../LufiaProvider";
import { ToastProvider, useOptionalToast, useToast, type ToastApi, type ToastProviderProps } from "./Toast";

const captured: { current: ToastApi | null } = { current: null };
/** The API of the provider under test. */
const api = () => captured.current!;
function Capture() {
  const toast = useToast();
  useEffect(() => {
    captured.current = toast;
  }, [toast]);
  return null;
}

function setup(props?: Partial<ToastProviderProps>) {
  return render(
    <ToastProvider {...props}>
      <Capture />
    </ToastProvider>,
  );
}

const polite = () => document.querySelector<HTMLElement>('[aria-live="polite"]')!;
const assertive = () => document.querySelector<HTMLElement>('[aria-live="assertive"]')!;
/** Runs timers and the frame that removes a toast once its exit is over (no stylesheet here, so no animation to wait for). */
const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));
/** `advance`, then the frame in which a dismissed toast is removed (React renders the dismissal only after the timer ran). */
const advanceAndSettle = (ms: number) => {
  advance(ms);
  advance(50);
};

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("ToastProvider", () => {
  it("keeps labelled, empty live regions mounted so later toasts are announced", () => {
    setup();
    expect(screen.getByRole("region", { name: "Notifications" })).toBeInTheDocument();
    expect(polite()).toBeEmptyDOMElement();
    expect(assertive()).toBeEmptyDOMElement();
  });

  it("announces errors assertively and everything else politely", () => {
    setup();
    act(() => {
      api().success("Saved");
      api().info("Syncing");
      api().warning("Almost full");
      api().error("Upload failed");
    });
    expect(within(polite()).getByText("Saved")).toBeInTheDocument();
    expect(within(polite()).getByText("Syncing")).toBeInTheDocument();
    expect(within(polite()).getByText("Almost full")).toBeInTheDocument();
    expect(within(assertive()).getByText("Upload failed")).toBeInTheDocument();
    expect(polite()).not.toHaveTextContent("Upload failed");
  });

  it("closes a toast by itself after the default duration", () => {
    setup();
    act(() => void api().success("Saved"));
    advance(4999);
    expect(screen.getByText("Saved")).toBeInTheDocument();
    advanceAndSettle(1);
    expect(screen.queryByText("Saved")).not.toBeInTheDocument();
  });

  it("honours a custom provider duration and a per-toast duration", () => {
    setup({ duration: 1000 });
    act(() => {
      api().success("Quick");
      api().success("Slow", { duration: 3000 });
    });
    advanceAndSettle(1100);
    expect(screen.queryByText("Quick")).not.toBeInTheDocument();
    expect(screen.getByText("Slow")).toBeInTheDocument();
  });

  it("never closes an error, or a toast with an action, by itself", () => {
    setup();
    act(() => {
      api().error("Upload failed");
      api().info("Moved to trash", { action: { label: "Undo", onAction: () => {} } });
    });
    advanceAndSettle(60_000);
    expect(screen.getByText("Upload failed")).toBeInTheDocument();
    expect(screen.getByText("Moved to trash")).toBeInTheDocument();
  });

  it("lets a caller opt an error into a timeout, or keep a toast until dismissed", () => {
    setup();
    act(() => {
      api().error("Transient", { duration: 2000 });
      api().success("Sticky", { duration: null });
    });
    advanceAndSettle(2100);
    expect(screen.queryByText("Transient")).not.toBeInTheDocument();
    advanceAndSettle(60_000);
    expect(screen.getByText("Sticky")).toBeInTheDocument();
  });

  it("pauses while hovered and gives the person time to read when the pointer leaves", () => {
    setup();
    act(() => void api().success("Saved"));
    const toast = screen.getByText("Saved").closest("li")!;
    advance(3000);
    fireEvent.pointerEnter(toast);
    advanceAndSettle(30_000);
    expect(screen.getByText("Saved")).toBeInTheDocument();
    fireEvent.pointerLeave(toast);
    advance(1900); // the 2 s that were left when it was paused
    expect(screen.getByText("Saved")).toBeInTheDocument();
    advanceAndSettle(200);
    expect(screen.queryByText("Saved")).not.toBeInTheDocument();
  });

  it("pauses while a control inside has focus and resumes on blur", () => {
    setup();
    act(() => void api().success("Saved"));
    advance(4500); // 0.5 s left: resuming grants at least 1.5 s
    const dismissButton = screen.getByRole("button", { name: "Dismiss" });
    act(() => dismissButton.focus());
    advanceAndSettle(30_000);
    expect(screen.getByText("Saved")).toBeInTheDocument();
    act(() => dismissButton.blur());
    advance(1400);
    expect(screen.getByText("Saved")).toBeInTheDocument();
    advanceAndSettle(200);
    expect(screen.queryByText("Saved")).not.toBeInTheDocument();
  });

  it("dismisses with the dismiss button and with Escape on a focused toast", () => {
    setup();
    act(() => {
      api().error("First");
      api().error("Second");
    });
    fireEvent.click(
      within(screen.getByText("First").closest("li")!).getByRole("button", { name: "Dismiss" }),
    );
    advance(50);
    expect(screen.queryByText("First")).not.toBeInTheDocument();
    const second = within(screen.getByText("Second").closest("li")!).getByRole("button", { name: "Dismiss" });
    act(() => second.focus());
    fireEvent.keyDown(second, { key: "Escape" });
    advance(50);
    expect(screen.queryByText("Second")).not.toBeInTheDocument();
  });

  it("runs the action once and dismisses the toast", () => {
    const onAction = vi.fn();
    setup();
    act(() => void api().info("Moved to trash", { action: { label: "Undo", onAction } }));
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(onAction).toHaveBeenCalledTimes(1);
    advance(50);
    expect(screen.queryByText("Moved to trash")).not.toBeInTheDocument();
  });

  it("does not stack an identical visible toast, and de-duplicates by id", () => {
    setup();
    let first = "";
    let again = "";
    act(() => {
      first = api().success("Saved");
      again = api().success("Saved");
      api().info("A", { id: "sync" });
      api().info("B", { id: "sync" });
    });
    expect(again).toBe(first);
    expect(screen.getAllByText("Saved")).toHaveLength(1);
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.queryByText("B")).not.toBeInTheDocument();
  });

  it("re-shows a toast whose id is reused while the first copy is still leaving", () => {
    setup();
    act(() => void api().success("First", { id: "save" }));
    act(() => {
      api().dismiss("save");
      api().success("Second", { id: "save" });
    });
    advanceAndSettle(50);
    expect(screen.queryByText("First")).not.toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });

  it("shows at most `limit` toasts, dropping the oldest", () => {
    setup({ limit: 2 });
    act(() => {
      api().error("one");
      api().error("two");
      api().error("three");
    });
    advance(50);
    expect(screen.queryByText("one")).not.toBeInTheDocument();
    expect(screen.getByText("two")).toBeInTheDocument();
    expect(screen.getByText("three")).toBeInTheDocument();
  });

  it("clears every toast", () => {
    setup();
    act(() => {
      api().error("one");
      api().success("two");
      api().clear();
    });
    advance(50);
    expect(screen.queryByText("one")).not.toBeInTheDocument();
    expect(screen.queryByText("two")).not.toBeInTheDocument();
  });

  it("removes a dismissed toast at once under reduced motion", () => {
    mockReducedMotion(true);
    setup();
    act(() => void api().error("Upload failed"));
    act(() => api().clear());
    advance(20);
    expect(screen.queryByText("Upload failed")).not.toBeInTheDocument();
  });

  it("takes the dismiss button's name and the region's name from the provider", () => {
    render(
      <LufiaProvider labels={{ dismiss: "Dispensar", notifications: "Avisos" }}>
        <ToastProvider>
          <Capture />
        </ToastProvider>
      </LufiaProvider>,
    );
    act(() => void api().error("Falhou"));
    expect(screen.getByRole("region", { name: "Avisos" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dispensar" })).toBeInTheDocument();
  });

  it("reflects the placement on the viewport and marks it exempt from the inert background", () => {
    setup({ placement: "top-start" });
    const region = screen.getByRole("region", { name: "Notifications" });
    expect(region).toHaveAttribute("data-placement", "top-start");
    expect(region).toHaveAttribute("data-lufia-inert-exempt");
  });

  it("has no axe violations with every tone and an action on screen", async () => {
    vi.useRealTimers();
    setup();
    act(() => {
      api().info("Syncing");
      api().success("Saved");
      api().warning("Almost full");
      api().error("Upload failed", { action: { label: "Retry", onAction: () => {} } });
    });
    expect(await axe(document.body)).toHaveNoViolations();
  });
});

describe("useToast", () => {
  it("throws outside a provider, and useOptionalToast returns null", () => {
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
    function Probe() {
      return <p>{useOptionalToast() === null ? "none" : "some"}</p>;
    }
    render(<Probe />);
    expect(screen.getByText("none")).toBeInTheDocument();
    expect(() => render(<Capture />)).toThrow(/ToastProvider/);
    quiet.mockRestore();
  });
});
