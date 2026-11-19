import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";

/** Stands in for a router link: an anchor that passes everything through. */
function DemoLink({ children, ...rest }: ComponentProps<"a">) {
  return <a {...rest}>{children}</a>;
}
import { OptionRow } from "./OptionRow";

describe("OptionRow", () => {
  it("is one button whose name is the title and the description", () => {
    render(
      <OptionRow
        title="Team plan"
        description="Up to 10 people"
        leading={<svg data-testid="lead" />}
        trailing="12 EUR"
        onClick={() => {}}
      />,
    );
    const row = screen.getByRole("button", { name: "Team plan Up to 10 people 12 EUR" });
    expect(row).toHaveAttribute("type", "button");
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.getByTestId("lead").parentElement).toHaveAttribute("aria-hidden", "true");
  });

  it("calls onClick from the pointer and from Enter and Space", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<OptionRow title="Team plan" onClick={onClick} />);
    await user.click(screen.getByRole("button"));
    screen.getByRole("button").focus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it("exposes selected as aria-pressed, and only when it is given", () => {
    const { rerender } = render(<OptionRow title="A" />);
    expect(screen.getByRole("button")).not.toHaveAttribute("aria-pressed");
    rerender(<OptionRow title="A" selected />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button")).toHaveAttribute("data-selected");
    rerender(<OptionRow title="A" selected={false} />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button")).not.toHaveAttribute("data-selected");
  });

  it("ignores activation and leaves the tab order when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<OptionRow title="A" disabled onClick={onClick} />);
    const row = screen.getByRole("button");
    expect(row).toBeDisabled();
    await user.click(row);
    await user.tab();
    expect(row).not.toHaveFocus();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders through render with aria-current, merges the class, and ignores activation when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = render(
      <OptionRow
        title="Profile"
        selected
        className="extra"
        onClick={onClick}
        render={<DemoLink href="#profile" className="own" />}
      />,
    );
    const link = screen.getByRole("link", { name: "Profile" });
    expect(link).toHaveAttribute("aria-current", "true");
    expect(link).not.toHaveAttribute("aria-pressed");
    expect(link).toHaveClass("extra", "own");
    await user.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
    rerender(<OptionRow title="Profile" disabled onClick={onClick} render={<DemoLink href="#profile" />} />);
    expect(screen.getByRole("link")).toHaveAttribute("aria-disabled", "true");
    await user.click(screen.getByRole("link"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("throws a clear error for a render that is not an element", () => {
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<OptionRow title="A" render={{} as never} />)).toThrow(/OptionRow: `render`/);
    quiet.mockRestore();
  });

  it("passes className, rest props through to the button", () => {
    render(<OptionRow title="A" className="extra" data-testid="row" aria-describedby="hint" />);
    expect(screen.getByTestId("row")).toHaveClass("extra");
    expect(screen.getByTestId("row")).toHaveAttribute("aria-describedby", "hint");
  });

  it("has no axe violations in a list of options", async () => {
    const { container } = render(
      <ul>
        <li>
          <OptionRow title="A" description="First" selected trailing="check" />
        </li>
        <li>
          <OptionRow title="B" disabled />
        </li>
        <li>
          <OptionRow title="C" render={<DemoLink href="#c" />} />
        </li>
      </ul>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
