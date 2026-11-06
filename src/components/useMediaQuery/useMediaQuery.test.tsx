import { act, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { useMediaQuery } from "./useMediaQuery";

function stubMatchMedia(initial: boolean) {
  let matches = initial;
  const listeners = new Set<() => void>();
  vi.stubGlobal("matchMedia", (query: string) => ({
    get matches() {
      return matches;
    },
    media: query,
    addEventListener: (_: string, fn: () => void) => listeners.add(fn),
    removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
  }));
  return {
    set(next: boolean) {
      matches = next;
      listeners.forEach((fn) => fn());
    },
    listeners,
  };
}

function Probe({ defaultValue }: { defaultValue?: boolean }) {
  const narrow = useMediaQuery("(max-width: 40rem)", { defaultValue });
  return <p>{narrow ? "narrow" : "wide"}</p>;
}

afterEach(() => vi.unstubAllGlobals());

describe("useMediaQuery", () => {
  it("reports the current match and follows changes", () => {
    const media = stubMatchMedia(false);
    render(<Probe />);
    expect(screen.getByText("wide")).toBeInTheDocument();
    act(() => media.set(true));
    expect(screen.getByText("narrow")).toBeInTheDocument();
  });

  it("unsubscribes on unmount", () => {
    const media = stubMatchMedia(true);
    const { unmount } = render(<Probe />);
    expect(media.listeners.size).toBe(1);
    unmount();
    expect(media.listeners.size).toBe(0);
  });

  it("renders the default value on the server", () => {
    expect(renderToString(<Probe />)).toContain("wide");
    expect(renderToString(<Probe defaultValue />)).toContain("narrow");
  });

  it("falls back to the default value without matchMedia", () => {
    vi.stubGlobal("matchMedia", undefined);
    render(<Probe defaultValue />);
    expect(screen.getByText("narrow")).toBeInTheDocument();
  });
});
