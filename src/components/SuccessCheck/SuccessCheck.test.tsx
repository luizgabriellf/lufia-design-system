import { render } from "@testing-library/react";
import { axe } from "../../test/axe";
import { SuccessCheck } from "./SuccessCheck";

describe("SuccessCheck", () => {
  it("is decorative: hidden from assistive technology and not focusable", () => {
    const { container } = render(<SuccessCheck />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("focusable", "false");
  });

  it("sizes the mark and passes className and rest props to the svg", () => {
    const { container } = render(<SuccessCheck size={24} className="extra" data-testid="check" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "24");
    expect(svg).toHaveAttribute("height", "24");
    expect(svg).toHaveClass("root", "extra");
    expect(svg).toHaveAttribute("data-testid", "check");
  });

  it("normalises the path so the draw animation works at any size", () => {
    const { container } = render(<SuccessCheck />);
    expect(container.querySelector("path")).toHaveAttribute("pathLength", "1");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <p>
        <SuccessCheck /> Saved
      </p>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
