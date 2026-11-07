import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { axe } from "../../test/axe";
import { mockReducedMotion } from "../../test/motion";
import { RouteTransition } from "./RouteTransition";

const css = readFileSync("src/motion/RouteTransition/RouteTransition.module.css", "utf8");

afterEach(() => vi.unstubAllGlobals());

describe("RouteTransition", () => {
  it("does not animate the first render", () => {
    render(
      <RouteTransition transitionKey="/a">
        <main>page a</main>
      </RouteTransition>,
    );
    expect(screen.getByText("page a")).not.toHaveAttribute("data-route-enter");
  });

  it("marks the content when the key changes", () => {
    const { rerender } = render(
      <RouteTransition transitionKey="/a">
        <main>page a</main>
      </RouteTransition>,
    );
    rerender(
      <RouteTransition transitionKey="/b">
        <main>page b</main>
      </RouteTransition>,
    );
    expect(screen.getByText("page b")).toHaveAttribute("data-route-enter", "rise");
  });

  it("plays nothing while the key is unchanged", () => {
    const { rerender } = render(
      <RouteTransition transitionKey="/a">
        <main>one</main>
      </RouteTransition>,
    );
    rerender(
      <RouteTransition transitionKey="/a">
        <main>two</main>
      </RouteTransition>,
    );
    expect(screen.getByText("two")).not.toHaveAttribute("data-route-enter");
  });

  it("uses the fade variant when asked", () => {
    const { rerender } = render(
      <RouteTransition transitionKey={1} variant="fade">
        <main>one</main>
      </RouteTransition>,
    );
    rerender(
      <RouteTransition transitionKey={2} variant="fade">
        <main>two</main>
      </RouteTransition>,
    );
    expect(screen.getByText("two")).toHaveAttribute("data-route-enter", "fade");
  });

  it("leaves static and fixed children alone", () => {
    const { rerender } = render(
      <RouteTransition transitionKey="/a">
        <aside data-route-static="">banner</aside>
        <div style={{ position: "fixed" }}>fixed</div>
        <main>page a</main>
      </RouteTransition>,
    );
    rerender(
      <RouteTransition transitionKey="/b">
        <aside data-route-static="">banner</aside>
        <div style={{ position: "fixed" }}>fixed</div>
        <main>page b</main>
      </RouteTransition>,
    );
    expect(screen.getByText("banner")).not.toHaveAttribute("data-route-enter");
    expect(screen.getByText("fixed")).not.toHaveAttribute("data-route-enter");
    expect(screen.getByText("page b")).toHaveAttribute("data-route-enter");
  });

  it("restarts the animation on a second change", () => {
    const { rerender } = render(
      <RouteTransition transitionKey="/a">
        <main>page</main>
      </RouteTransition>,
    );
    const page = screen.getByText("page");
    rerender(
      <RouteTransition transitionKey="/b">
        <main>page</main>
      </RouteTransition>,
    );
    const removed = vi.spyOn(page, "removeAttribute");
    rerender(
      <RouteTransition transitionKey="/c">
        <main>page</main>
      </RouteTransition>,
    );
    expect(removed).toHaveBeenCalledWith("data-route-enter");
    expect(page).toHaveAttribute("data-route-enter", "rise");
  });

  it("marks nothing under reduced motion", () => {
    mockReducedMotion(true);
    const { rerender } = render(
      <RouteTransition transitionKey="/a">
        <main>page a</main>
      </RouteTransition>,
    );
    rerender(
      <RouteTransition transitionKey="/b">
        <main>page b</main>
      </RouteTransition>,
    );
    expect(screen.getByText("page b")).not.toHaveAttribute("data-route-enter");
  });

  it("keeps the same region and its children mounted across a change", () => {
    const { rerender } = render(
      <RouteTransition transitionKey="/a" data-testid="r" className="extra">
        <main>page</main>
      </RouteTransition>,
    );
    const region = screen.getByTestId("r");
    rerender(
      <RouteTransition transitionKey="/b" data-testid="r" className="extra">
        <main>page</main>
      </RouteTransition>,
    );
    expect(screen.getByTestId("r")).toBe(region);
    expect(region).toHaveClass("extra");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <RouteTransition transitionKey="/a">
        <main>page</main>
      </RouteTransition>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("animates from tokens and is removed under reduced motion", () => {
    expect(css).toMatch(/route-rise var\(--lufia-motion-duration-enter\) var\(--lufia-motion-easing-out\)/);
    expect(css).toMatch(
      /@keyframes route-rise \{\s*from \{\s*opacity: 0;\s*transform: translateY\(var\(--lufia-motion-distance-rise\)\)/,
    );
    const reduced = css.match(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/);
    expect(reduced?.[1]).toMatch(/animation:\s*none/);
  });
});
