import { render } from "@testing-library/react";
import { axe } from "../../test/axe";
import { ACTION_ICONS, DeleteIcon } from "./ActionIcons";

describe("ActionIcons", () => {
  it("is decorative by default", () => {
    const { container } = render(<DeleteIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).not.toHaveAttribute("role");
  });

  it("becomes a labelled image when aria-label is given", () => {
    const { getByRole } = render(<DeleteIcon aria-label="Delete" />);
    expect(getByRole("img", { name: "Delete" })).not.toHaveAttribute("aria-hidden");
  });

  it("applies size and passes rest props through", () => {
    const { container } = render(<DeleteIcon size={24} data-testid="icon" className="x" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "24");
    expect(svg).toHaveAttribute("height", "24");
    expect(svg).toHaveClass("x");
  });

  it("has no axe violations for every icon, decorative or labelled", async () => {
    const { container } = render(
      <div>
        {Object.entries(ACTION_ICONS).map(([name, Icon]) => (
          <span key={name}>
            <Icon />
            <Icon aria-label={name} />
          </span>
        ))}
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
