import { render } from "@testing-library/react";
import { axe } from "../../test/axe";
import { STATUS_TONES, StatusIcon } from "./StatusIcon";

const shapeOf = (root: Element) => root.querySelector("svg")?.innerHTML ?? "";

describe("StatusIcon", () => {
  it("draws a distinct shape for every tone in every variant, so tones differ without colour", () => {
    for (const variant of ["bare", "ring", "mark"] as const) {
      const { container, unmount } = render(
        <>
          {STATUS_TONES.map((tone) => (
            <StatusIcon key={tone} tone={tone} variant={variant} />
          ))}
        </>,
      );
      const shapes = Array.from(container.children).map(shapeOf);
      expect(new Set(shapes).size, variant).toBe(STATUS_TONES.length);
      unmount();
    }
  });

  it("draws a single simple mark, never an outline shape, in the ring and mark variants", () => {
    for (const variant of ["ring", "mark"] as const) {
      for (const tone of STATUS_TONES) {
        const { container, unmount } = render(<StatusIcon tone={tone} variant={variant} />);
        const svg = container.querySelector("svg")!;
        expect(svg.children, `${variant} ${tone}`).toHaveLength(1);
        expect(svg.querySelector("circle, rect, polygon"), `${variant} ${tone}`).toBeNull();
        unmount();
      }
    }
  });

  it("keeps the outlined shapes in the bare variant", () => {
    const { container } = render(<StatusIcon tone="warning" />);
    expect(container.querySelectorAll("svg path").length).toBeGreaterThan(1);
  });

  it("is decorative without a label and a named image with one", () => {
    const { container, getByRole } = render(
      <>
        <StatusIcon tone="warning" />
        <StatusIcon tone="danger" label="Overdue" />
      </>,
    );
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    const named = getByRole("img", { name: "Overdue" });
    expect(named).not.toHaveAttribute("aria-hidden");
    expect(named.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("exposes tone, variant and size as data attributes and keeps className and rest props", () => {
    const { container } = render(
      <StatusIcon tone="info" variant="ring" size="lg" className="mine" data-testid="status" />,
    );
    const root = container.firstElementChild;
    expect(root).toHaveAttribute("data-tone", "info");
    expect(root).toHaveAttribute("data-variant", "ring");
    expect(root).toHaveAttribute("data-size", "lg");
    expect(root).toHaveClass("mine");
    expect(root).toHaveAttribute("data-testid", "status");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <div>
        {STATUS_TONES.map((tone) => (
          <span key={tone}>
            <StatusIcon tone={tone} />
            <StatusIcon tone={tone} variant="ring" label={tone} />
            <StatusIcon tone={tone} variant="mark" />
          </span>
        ))}
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("StatusIcon drawOn", () => {
  it("measures every stroke so it can draw in, and marks the root", () => {
    const { container } = render(<StatusIcon tone="success" variant="ring" drawOn />);
    const root = container.firstElementChild;
    expect(root).toHaveAttribute("data-draw-on");
    const paths = root!.querySelectorAll("svg path");
    expect(paths.length).toBeGreaterThan(0);
    paths.forEach((path) => expect(path).toHaveAttribute("pathLength", "1"));
  });

  it("draws nothing in by default", () => {
    const { container } = render(<StatusIcon tone="success" variant="ring" />);
    expect(container.firstElementChild).not.toHaveAttribute("data-draw-on");
    expect(container.querySelector("path")).not.toHaveAttribute("pathLength");
  });
});
