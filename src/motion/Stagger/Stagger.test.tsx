import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { axe } from "../../test/axe";
import { mockReducedMotion } from "../../test/motion";
import { Stagger } from "./Stagger";

const css = readFileSync("src/motion/Stagger/Stagger.module.css", "utf8");

afterEach(() => vi.unstubAllGlobals());

const index = (element: HTMLElement) => element.style.getPropertyValue("--stagger-index");

describe("Stagger", () => {
  it("gives each child element the next step", () => {
    render(
      <Stagger>
        <p>one</p>
        <p>two</p>
        <p>three</p>
      </Stagger>,
    );
    expect(["one", "two", "three"].map((text) => index(screen.getByText(text)))).toEqual(["0", "1", "2"]);
  });

  it("caps the sequence: children past the limit enter with the last step", () => {
    render(
      <Stagger limit={3}>
        {["a", "b", "c", "d", "e"].map((text) => (
          <p key={text}>{text}</p>
        ))}
      </Stagger>,
    );
    expect(["a", "b", "c", "d", "e"].map((text) => index(screen.getByText(text)))).toEqual([
      "0",
      "1",
      "2",
      "2",
      "2",
    ]);
  });

  it("keeps a child's own style and leaves text nodes alone", () => {
    render(
      <Stagger data-testid="s">
        text
        <p style={{ color: "red" }}>styled</p>
      </Stagger>,
    );
    expect(screen.getByText("styled")).toHaveStyle({ color: "rgb(255, 0, 0)" });
    expect(index(screen.getByText("styled"))).toBe("0");
    expect(screen.getByTestId("s")).toHaveTextContent("textstyled");
  });

  it("marks the root under reduced motion", () => {
    mockReducedMotion(true);
    render(
      <Stagger data-testid="s">
        <p>one</p>
      </Stagger>,
    );
    expect(screen.getByTestId("s")).toHaveAttribute("data-reduced");
  });

  it("does not mark the root with full motion", () => {
    mockReducedMotion(false);
    render(
      <Stagger data-testid="s">
        <p>one</p>
      </Stagger>,
    );
    expect(screen.getByTestId("s")).not.toHaveAttribute("data-reduced");
  });

  it("passes className and rest props to the root", () => {
    render(
      <Stagger className="extra" data-testid="s">
        <p>one</p>
      </Stagger>,
    );
    expect(screen.getByTestId("s")).toHaveClass("extra");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <Stagger>
        <p>one</p>
        <p>two</p>
      </Stagger>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("moves only opacity and transform, from tokens, and is removed under reduced motion", () => {
    expect(css).toMatch(
      /animation:\s*stagger-in var\(--lufia-motion-duration-enter\) var\(--lufia-motion-easing-out\)/,
    );
    expect(css).toMatch(
      /@keyframes stagger-in \{\s*from \{\s*opacity: 0;\s*transform: translateY\(var\(--lufia-motion-distance-rise\)\);\s*\}\s*\}/,
    );
    const reduced = css.match(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/);
    expect(reduced?.[1]).toMatch(/animation:\s*none/);
    expect(css).toMatch(/\[data-reduced\] > \* \{\s*animation:\s*none/);
  });
});
