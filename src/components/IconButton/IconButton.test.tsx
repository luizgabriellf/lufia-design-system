import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { IconButton } from "./IconButton";

const icon = <svg data-testid="icon" />;

describe("IconButton", () => {
  it("is named by aria-label and uses it as the tooltip", () => {
    render(<IconButton icon={icon} aria-label="Open settings" />);
    const button = screen.getByRole("button", { name: "Open settings" });
    expect(button).toHaveAttribute("title", "Open settings");
    expect(button).toHaveAttribute("data-icon-only");
  });

  it("lets title differ from the name", () => {
    render(<IconButton icon={icon} aria-label="Settings" title="Settings (S)" />);
    expect(screen.getByRole("button", { name: "Settings" })).toHaveAttribute("title", "Settings (S)");
  });

  it("hides the icon from assistive technology and defaults to the ghost variant", () => {
    render(<IconButton icon={icon} aria-label="Go" />);
    expect(screen.getByTestId("icon").parentElement).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", "ghost");
  });

  it("supports the Button variants, loading and activation", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = render(
      <IconButton icon={icon} aria-label="Go" variant="danger" onClick={onClick} />,
    );
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", "danger");
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
    rerender(<IconButton icon={icon} aria-label="Go" loading onClick={onClick} />);
    expect(screen.getByRole("button", { name: "Go" })).toHaveAttribute("aria-busy", "true");
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders a link with href", () => {
    render(<IconButton icon={icon} aria-label="Settings" href="/settings" />);
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute("href", "/settings");
  });

  it("refuses a missing aria-label at the type level", () => {
    // @ts-expect-error aria-label is required
    const missing = <IconButton icon={icon} />;
    expect(missing).toBeTruthy();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <div>
        <IconButton icon={icon} aria-label="One" />
        <IconButton icon={icon} aria-label="Two" variant="primary" loading />
        <IconButton icon={icon} aria-label="Three" href="/x" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
