import { readFileSync } from "node:fs";
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

  it("exposes a toggle through aria-pressed and styles the pressed state apart from rest and hover", () => {
    const { rerender } = render(<IconButton icon={icon} aria-label="Bold" aria-pressed={false} />);
    expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute("aria-pressed", "false");
    rerender(<IconButton icon={icon} aria-label="Bold" aria-pressed />);
    expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute("aria-pressed", "true");
    const css = readFileSync("src/components/Button/Button.module.css", "utf8").replace(/\s+/g, " ");
    expect(css).toMatch(
      /\[aria-pressed="true"\][^{}]*\{ border-color: var\(--lufia-color-accent-border\); background: var\(--lufia-color-accent-subtle\); color: var\(--lufia-color-text-accent\)/,
    );
    expect(css).toContain('.root[aria-pressed="true"] { border-color: Highlight');
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

  it("supports the xl size and the circle shape without changing the default", () => {
    const { rerender } = render(<IconButton icon={icon} aria-label="Go" />);
    expect(screen.getByRole("button")).not.toHaveAttribute("data-shape");
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "md");
    rerender(<IconButton icon={icon} aria-label="Go" size="xl" shape="circle" />);
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "xl");
    expect(screen.getByRole("button")).toHaveAttribute("data-shape", "circle");
    rerender(<IconButton icon={icon} aria-label="Go" shape="default" href="/x" />);
    expect(screen.getByRole("link")).not.toHaveAttribute("data-shape");
  });

  it("sizes xl at 4rem, makes a circle round, and reads the size hook with today's sizes as fallbacks", () => {
    const css = readFileSync("src/components/Button/Button.module.css", "utf8").replace(/\s+/g, " ");
    expect(css).toMatch(
      /\[data-size="xl"\] \{ inline-size: var\(--lufia-icon-button-size, 4rem\); min-block-size: var\(--lufia-icon-button-size, 4rem\)/,
    );
    expect(css).toMatch(/\[data-shape="circle"\] \{ border-radius: var\(--lufia-radius-full\)/);
    expect(css).toContain("inline-size: var(--lufia-icon-button-size, 2.5rem)");
    expect(css).toContain("inline-size: var(--lufia-icon-button-size, 2rem)");
    expect(css).toContain("inline-size: var(--lufia-icon-button-size, 3rem)");
    expect(css).toMatch(/max\(var\(--lufia-icon-button-size, 0px\), var\(--lufia-target-touch, 2\.75rem\)\)/);
  });

  it("refuses an unknown size at the type level", () => {
    // @ts-expect-error xl exists on IconButton only; 2xl does not exist
    const bad = <IconButton icon={icon} aria-label="Go" size="2xl" />;
    expect(bad).toBeTruthy();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <div>
        <IconButton icon={icon} aria-label="One" />
        <IconButton icon={icon} aria-label="Two" variant="primary" loading />
        <IconButton icon={icon} aria-label="Three" href="/x" />
        <IconButton icon={icon} aria-label="Four" aria-pressed />
        <IconButton icon={icon} aria-label="Five" size="xl" shape="circle" variant="primary" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
