import { act, render, screen, waitFor } from "@testing-library/react";
import { useRef } from "react";
import { endAnimation, mockReducedMotion, stubExitAnimation } from "../../test/motion";
import { usePresence } from "./usePresence";

function Probe({ open, skip = false }: { open: boolean; skip?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { phase, finish } = usePresence(open, ref, { skipWhenNotRendered: skip });
  return (
    <>
      <output>{phase}</output>
      {phase === "unmounted" ? null : <div ref={ref} data-testid="panel" onAnimationEnd={finish} />}
    </>
  );
}

const phase = () => screen.getByRole("status").textContent;

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("usePresence", () => {
  it("starts in the phase of its input and does not mount while closed", () => {
    const { rerender } = render(<Probe open={false} />);
    expect(phase()).toBe("unmounted");
    expect(screen.queryByTestId("panel")).toBeNull();
    rerender(<Probe open />);
    expect(phase()).toBe("open");
  });

  it("stays closed (mounted) until the animation ends, then unmounts", () => {
    mockReducedMotion(false);
    stubExitAnimation();
    const { rerender } = render(<Probe open />);
    rerender(<Probe open={false} />);
    expect(phase()).toBe("closed");
    act(() => endAnimation(screen.getByTestId("panel")));
    expect(phase()).toBe("unmounted");
  });

  it("unmounts by a timeout when animationend never arrives", async () => {
    mockReducedMotion(false);
    stubExitAnimation("exit", "0.05s");
    const { rerender } = render(<Probe open />);
    rerender(<Probe open={false} />);
    expect(phase()).toBe("closed");
    await waitFor(() => expect(phase()).toBe("unmounted"), { timeout: 1000 });
  });

  it("does not wait when the stylesheet defines no animation", async () => {
    mockReducedMotion(false);
    const { rerender } = render(<Probe open />);
    rerender(<Probe open={false} />);
    await waitFor(() => expect(phase()).toBe("unmounted"));
  });

  it("goes straight back to open when the input returns during the exit, and the timeout no longer applies", async () => {
    mockReducedMotion(false);
    stubExitAnimation("exit", "0.05s");
    const { rerender } = render(<Probe open />);
    rerender(<Probe open={false} />);
    rerender(<Probe open />);
    expect(phase()).toBe("open");
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(phase()).toBe("open");
  });

  it("unmounts at once under reduced motion", () => {
    mockReducedMotion(true);
    stubExitAnimation();
    const { rerender } = render(<Probe open />);
    rerender(<Probe open={false} />);
    expect(phase()).toBe("unmounted");
  });

  it("skips the exit of an element that is not rendered only when asked to", async () => {
    mockReducedMotion(false);
    stubExitAnimation();
    Object.defineProperty(HTMLElement.prototype, "checkVisibility", {
      value: () => false,
      configurable: true,
    });
    try {
      const plain = render(<Probe open />);
      plain.rerender(<Probe open={false} />);
      await act(async () => {
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      });
      expect(phase()).toBe("closed");
      plain.unmount();
      const skipping = render(<Probe open skip />);
      skipping.rerender(<Probe open={false} skip />);
      await waitFor(() => expect(phase()).toBe("unmounted"), { timeout: 100 });
    } finally {
      delete (HTMLElement.prototype as Partial<HTMLElement>).checkVisibility;
    }
  });
});
