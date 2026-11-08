import { render } from "@testing-library/react";
import { axe } from "../../test/axe";
import { Icon, createIcon } from "./Icon";
import { CheckIcon, CloseIcon, ICONS } from "./icons";
import { DeleteIcon, PendingIcon } from "../ActionIcons";

const svgOf = (container: HTMLElement) => container.querySelector("svg") as SVGSVGElement;

describe("Icon", () => {
  it("draws on the shared grid: 24 viewBox, no fill, currentColor stroke, round caps and joins", () => {
    const svg = svgOf(render(<CloseIcon />).container);
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    expect(svg).toHaveAttribute("fill", "none");
    expect(svg).toHaveAttribute("stroke", "currentColor");
    expect(svg).toHaveAttribute("stroke-linecap", "round");
    expect(svg).toHaveAttribute("stroke-linejoin", "round");
    expect(svg).toHaveAttribute("data-lufia-icon", "close");
  });

  it("is decorative by default", () => {
    const svg = svgOf(render(<CheckIcon />).container);
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("focusable", "false");
    expect(svg).not.toHaveAttribute("role");
  });

  it("becomes a named image with a title or an aria-label", () => {
    const { getByRole } = render(
      <>
        <CheckIcon title="Done" />
        <CloseIcon aria-label="Failed" />
      </>,
    );
    expect(getByRole("img", { name: "Done" })).not.toHaveAttribute("aria-hidden");
    expect(getByRole("img", { name: "Failed" })).not.toHaveAttribute("aria-hidden");
  });

  it("maps the size tokens, 1em and numbers, and takes the small stroke at small sizes", () => {
    const { container } = render(
      <>
        <CheckIcon size="sm" />
        <CheckIcon />
        <CheckIcon size="lg" />
        <CheckIcon size="1em" />
        <CheckIcon size={14} />
        <CheckIcon size={32} />
      </>,
    );
    const svgs = Array.from(container.querySelectorAll("svg"));
    expect(svgs.map((s) => s.getAttribute("data-size"))).toEqual([
      "sm",
      "md",
      "lg",
      "em",
      "custom",
      "custom",
    ]);
    expect(svgs.map((s) => s.getAttribute("width"))).toEqual(["16", "20", "24", "1em", "14", "32"]);
    expect(svgs.map((s) => s.getAttribute("data-stroke"))).toEqual(["sm", null, null, null, "sm", null]);
  });

  it("passes className, ref and rest props to the svg", () => {
    let node: SVGSVGElement | null = null;
    const { container } = render(
      <CheckIcon
        className="mine"
        data-testid="check"
        ref={(el) => {
          node = el;
        }}
      />,
    );
    const svg = svgOf(container);
    expect(svg).toHaveClass("mine");
    expect(svg).toHaveAttribute("data-testid", "check");
    expect(node).toBe(svg);
  });

  it("createIcon accepts children, a path string or a list of paths, and names the component", () => {
    const One = createIcon("one-path", "M4 12h16");
    const Many = createIcon("many-paths", ["M4 12h16", "M12 4v16"]);
    const Nodes = createIcon("nodes", <circle cx="12" cy="12" r="4" />);
    expect(One.displayName).toBe("OnePathIcon");
    expect(Many.iconName).toBe("many-paths");
    const { container } = render(
      <>
        <One />
        <Many />
        <Nodes />
      </>,
    );
    const svgs = container.querySelectorAll("svg");
    expect(svgs[0]!.querySelectorAll("path")).toHaveLength(1);
    expect(svgs[1]!.querySelectorAll("path")).toHaveLength(2);
    expect(svgs[2]!.querySelector("circle")).not.toBeNull();
    expect(svgs[2]).toHaveAttribute("data-lufia-icon", "nodes");
  });

  it("keeps the deprecated action icons working as aliases of the set", () => {
    const { container } = render(
      <>
        <DeleteIcon />
        <PendingIcon />
      </>,
    );
    const svgs = container.querySelectorAll("svg");
    expect(svgs[0]).toHaveAttribute("data-lufia-icon", "trash");
    expect(svgs[1]).toHaveAttribute("data-lufia-icon", "clock");
  });

  it("draws every icon of the set inside the grid, with strokes only", () => {
    for (const [name, Component] of Object.entries(ICONS)) {
      const svg = svgOf(render(<Component />).container);
      expect(svg.children.length, name).toBeGreaterThan(0);
      for (const child of Array.from(svg.querySelectorAll("*"))) {
        expect(child.getAttribute("stroke-width"), name).toBeNull();
        expect(child.getAttribute("fill"), name).toBeNull();
        // Every shape carries its geometry: an attribute-less `<line />` draws nothing.
        const required = {
          path: ["d"],
          line: ["x1", "y1", "x2", "y2"],
          polyline: ["points"],
          circle: ["r"],
          rect: ["width", "height"],
        }[child.tagName.toLowerCase()];
        for (const attribute of required ?? [])
          expect(child.hasAttribute(attribute), `${name} ${attribute}`).toBe(true);
      }
    }
  });

  it("has no axe violations, decorative or named", async () => {
    const { container } = render(
      <div>
        {Object.entries(ICONS).map(([name, Component]) => (
          <span key={name}>
            <Component />
            <Component title={name} />
          </span>
        ))}
        <Icon aria-label="Custom">
          <path d="M4 12h16" />
        </Icon>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
