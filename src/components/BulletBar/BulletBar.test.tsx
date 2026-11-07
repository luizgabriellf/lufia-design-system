import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { axe } from "../../test/axe";
import { BulletBar } from "./BulletBar";

const css = readFileSync("src/components/BulletBar/BulletBar.module.css", "utf8");

describe("BulletBar", () => {
  it("is an image named by its label", () => {
    render(<BulletBar value={80} target={100} label="Delivered 80 of 100" />);
    expect(screen.getByRole("img", { name: "Delivered 80 of 100" })).toBeInTheDocument();
  });

  it("is hidden from assistive technology when the label is null", () => {
    const { container } = render(<BulletBar value={80} target={100} label={null} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("puts the tick at the same place for every row, whatever the value", () => {
    const { container } = render(
      <div>
        <BulletBar value={50} target={100} label="A" />
        <BulletBar value={300} target={100} label="B" />
      </div>,
    );
    const ticks = [...container.querySelectorAll<HTMLElement>("[class*=tick]")];
    expect(ticks.map((tick) => tick.style.insetInlineStart)).toEqual(["80%", "80%"]);
    const fills = [...container.querySelectorAll<HTMLElement>("[class*=fill]")];
    expect(fills[0]!.style.inlineSize).toBe("40%");
    expect(fills[1]!.style.inlineSize).toBe("100%");
  });

  it("omits the fill for zero and the tick without a target", () => {
    const { container } = render(<BulletBar value={0} target={0} label="Empty" />);
    expect(container.querySelector("[class*=fill]")).toBeNull();
    expect(container.querySelector("[class*=tick]")).toBeNull();
  });

  it("exposes the tone and passes className", () => {
    render(<BulletBar value={1} target={2} label="x" tone="success" className="extra" data-testid="b" />);
    expect(screen.getByTestId("b")).toHaveAttribute("data-tone", "success");
    expect(screen.getByTestId("b")).toHaveClass("extra");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <div>
        <BulletBar value={80} target={100} label="Delivered 80 of 100" />
        <BulletBar value={80} target={100} label={null} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("draws in with motion tokens and stops under reduced motion", () => {
    expect(css).toMatch(
      /animation:\s*bullet-grow var\(--lufia-motion-duration-medium\) var\(--lufia-motion-easing-out\)/,
    );
    const reduced = css.match(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/);
    expect(reduced?.[1]).toMatch(/animation:\s*none/);
  });
});
