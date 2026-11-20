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

  it("clamps the limit so the delay stays capped", () => {
    render(
      <Stagger limit={1000}>
        {Array.from({ length: 12 }, (_, i) => (
          <p key={i}>{`n${i}`}</p>
        ))}
      </Stagger>,
    );
    expect(index(screen.getByText("n11"))).toBe("7");
  });

  it("leaves Fragments alone", () => {
    render(
      <Stagger data-testid="s">
        <>
          <p>inside</p>
        </>
        <p>after</p>
      </Stagger>,
    );
    expect(index(screen.getByText("inside"))).toBe("");
    expect(index(screen.getByText("after"))).toBe("0");
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

  it("renders a div by default", () => {
    render(
      <Stagger data-testid="s">
        <p>one</p>
      </Stagger>,
    );
    expect(screen.getByTestId("s").tagName).toBe("DIV");
  });

  it.each(["ul", "ol"] as const)("renders as a semantic %s with li children as direct children", (as) => {
    render(
      <Stagger as={as} limit={2} aria-label="Items">
        <li>one</li>
        <li>two</li>
        <li>three</li>
      </Stagger>,
    );
    const list = screen.getByRole("list", { name: "Items" });
    expect(list.tagName).toBe(as.toUpperCase());
    expect(Array.from(list.children).map((child) => child.tagName)).toEqual(["LI", "LI", "LI"]);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(["one", "two", "three"].map((text) => index(screen.getByText(text)))).toEqual(["0", "1", "1"]);
  });

  it("renders as a description list with div groups as direct children", async () => {
    const { container } = render(
      <Stagger as="dl" data-testid="s">
        <div>
          <dt>Name</dt>
          <dd>First</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>Open</dd>
        </div>
      </Stagger>,
    );
    const list = screen.getByTestId("s");
    expect(list.tagName).toBe("DL");
    expect(Array.from(list.children).map((child) => index(child as HTMLElement))).toEqual(["0", "1"]);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("passes ref to the root element", () => {
    let root: HTMLElement | null = null;
    render(
      <Stagger
        as="ul"
        ref={(node) => {
          root = node;
        }}
      >
        <li>one</li>
      </Stagger>,
    );
    expect(root).toBe(screen.getByRole("list"));
  });

  it("marks a list root under reduced motion", () => {
    mockReducedMotion(true);
    render(
      <Stagger as="ul" data-testid="s">
        <li>one</li>
      </Stagger>,
    );
    expect(screen.getByTestId("s")).toHaveAttribute("data-reduced");
  });

  it("has no axe violations as a list", async () => {
    const { container } = render(
      <Stagger as="ul">
        <li>one</li>
        <li>two</li>
      </Stagger>,
    );
    expect(await axe(container)).toHaveNoViolations();
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
