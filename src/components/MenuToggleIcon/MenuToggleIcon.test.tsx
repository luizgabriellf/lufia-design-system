import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { axe } from "../../test/axe";
import { IconButton } from "../IconButton";
import { MenuToggleIcon } from "./MenuToggleIcon";

const css = readFileSync("src/components/MenuToggleIcon/MenuToggleIcon.module.css", "utf8");
const svgOf = (container: HTMLElement) => container.querySelector("svg") as SVGSVGElement;

function Toggle() {
  const [open, setOpen] = useState(false);
  return (
    <IconButton
      aria-label="Menu"
      aria-expanded={open}
      onClick={() => setOpen(!open)}
      icon={<MenuToggleIcon open={open} />}
    />
  );
}

describe("MenuToggleIcon", () => {
  it("draws three bars and exposes the state it is in", () => {
    const { container, rerender } = render(<MenuToggleIcon open={false} />);
    expect(svgOf(container).querySelectorAll("path")).toHaveLength(3);
    expect(svgOf(container)).toHaveAttribute("data-state", "closed");
    rerender(<MenuToggleIcon open />);
    expect(svgOf(container)).toHaveAttribute("data-state", "open");
  });

  it("is decorative and cannot be given a name", () => {
    const { container } = render(<MenuToggleIcon open={false} />);
    const svg = svgOf(container);
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).not.toHaveAttribute("role");
    expect(svg.querySelector("title")).toBeNull();
  });

  it("is sized by the icon sizes and takes a class", () => {
    const { container } = render(<MenuToggleIcon open={false} size="lg" className="mine" />);
    expect(svgOf(container)).toHaveAttribute("data-size", "lg");
    expect(svgOf(container)).toHaveClass("mine");
  });

  it("follows the state of the button that holds it", async () => {
    const user = userEvent.setup();
    const { container } = render(<Toggle />);
    const button = screen.getByRole("button", { name: "Menu" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(svgOf(container)).toHaveAttribute("data-state", "closed");
    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(svgOf(container)).toHaveAttribute("data-state", "open");
  });

  it("morphs with transform and opacity only, from the motion tokens, and stops moving under reduced motion", () => {
    expect(css).toMatch(/transform var\(--lufia-motion-duration-fast\) var\(--lufia-motion-easing-in-out\)/);
    expect(css).toMatch(/opacity var\(--lufia-motion-duration-fast\)/);
    expect(css).toMatch(
      /\.root\[data-state="open"\] \.top \{\s*transform: translateY\(6px\) rotate\(45deg\)/,
    );
    expect(css).toMatch(
      /\.root\[data-state="open"\] \.bottom \{\s*transform: translateY\(-6px\) rotate\(-45deg\)/,
    );
    expect(css).toMatch(/\.root\[data-state="open"\] \.middle \{\s*opacity: 0/);
    expect(css).toMatch(/prefers-reduced-motion: reduce\) \{[^}]*\{\s*transition: none/);
  });

  it("has no axe violations inside a button, closed and open", async () => {
    const user = userEvent.setup();
    const { container } = render(<Toggle />);
    expect(await axe(container)).toHaveNoViolations();
    await user.click(screen.getByRole("button", { name: "Menu" }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
