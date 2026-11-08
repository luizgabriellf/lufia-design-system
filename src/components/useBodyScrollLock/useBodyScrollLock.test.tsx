import { render } from "@testing-library/react";
import { axe } from "../../test/axe";
import { isBodyScrollLocked, useBodyScrollLock } from "./useBodyScrollLock";

function Overlay({ locked, selectors }: { locked: boolean; selectors?: string[] }) {
  useBodyScrollLock(locked, { scrollContainerSelectors: selectors });
  return <div role="dialog" aria-label="Overlay" />;
}

beforeEach(() => {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});

describe("useBodyScrollLock", () => {
  it("locks the body while locked and restores it on unlock", () => {
    const { rerender } = render(<Overlay locked={false} />);
    expect(isBodyScrollLocked()).toBe(false);
    rerender(<Overlay locked />);
    expect(isBodyScrollLocked()).toBe(true);
    expect(document.body.style.position).toBe("fixed");
    rerender(<Overlay locked={false} />);
    expect(isBodyScrollLocked()).toBe(false);
    expect(document.body.style.position).toBe("");
  });

  it("restores the scroll instantly, so scroll-behavior: smooth does not animate it", () => {
    const { rerender } = render(<Overlay locked />);
    rerender(<Overlay locked={false} />);
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 0, left: 0, behavior: "instant" });
  });

  it("unlocks on unmount", () => {
    const { unmount } = render(<Overlay locked />);
    expect(isBodyScrollLocked()).toBe(true);
    unmount();
    expect(isBodyScrollLocked()).toBe(false);
  });

  it("is reference counted across stacked overlays", () => {
    const first = render(<Overlay locked />);
    const second = render(<Overlay locked />);
    first.unmount();
    expect(isBodyScrollLocked()).toBe(true);
    expect(document.body.style.position).toBe("fixed");
    second.unmount();
    expect(isBodyScrollLocked()).toBe(false);
  });

  it("locks an inner scroll container when the document itself does not overflow", () => {
    const shell = document.createElement("div");
    shell.className = "shell";
    shell.style.overflowY = "auto";
    shell.scrollTo = vi.fn() as unknown as typeof shell.scrollTo;
    Object.defineProperty(shell, "scrollHeight", { value: 900, configurable: true });
    Object.defineProperty(shell, "clientHeight", { value: 400, configurable: true });
    document.body.appendChild(shell);
    const { unmount } = render(<Overlay locked selectors={[".shell"]} />);
    expect(shell.style.overflowY).toBe("hidden");
    expect(document.body.style.position).toBe("");
    unmount();
    expect(shell.style.overflowY).toBe("auto");
    expect(shell.scrollTo).toHaveBeenLastCalledWith({ top: 0, left: 0, behavior: "instant" });
    shell.remove();
  });

  it("compensates the scrollbar width so the page does not shift, and restores the padding", () => {
    const html = document.documentElement;
    const innerWidth = vi.spyOn(window, "innerWidth", "get").mockReturnValue(1024);
    const clientWidth = vi.spyOn(html, "clientWidth", "get").mockReturnValue(1009);
    document.body.style.paddingRight = "4px";
    const { unmount } = render(<Overlay locked />);
    expect(document.body.style.paddingRight).toBe("19px");
    // width: 100% must include that padding, or a content-box body would widen and the page would still jump.
    expect(document.body.style.boxSizing).toBe("border-box");
    unmount();
    expect(document.body.style.boxSizing).toBe("");
    expect(document.body.style.paddingRight).toBe("4px");
    document.body.style.paddingRight = "";
    innerWidth.mockRestore();
    clientWidth.mockRestore();
  });

  it("adds no padding when the scrollbar takes no space", () => {
    const { unmount } = render(<Overlay locked />);
    expect(document.body.style.paddingRight).toBe("");
    unmount();
  });

  it("does not interfere with accessibility of the overlay", async () => {
    const { container } = render(<Overlay locked />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
