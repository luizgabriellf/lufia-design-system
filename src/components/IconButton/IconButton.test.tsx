import { readFileSync } from "node:fs";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { IconButton } from "./IconButton";

const icon = <svg data-testid="icon" />;

describe("IconButton", () => {
  it("is named by aria-label and renders no native title", () => {
    render(<IconButton icon={icon} aria-label="Open settings" />);
    const button = screen.getByRole("button", { name: "Open settings" });
    expect(button).not.toHaveAttribute("title");
    expect(button).toHaveAttribute("data-icon-only");
  });

  it("shows the package tooltip on keyboard focus, aria-hidden, with the label", async () => {
    const user = userEvent.setup();
    render(<IconButton icon={icon} aria-label="Open settings" />);
    expect(screen.queryByText("Open settings")).toBeNull();
    await user.tab();
    const tip = await screen.findByText("Open settings");
    expect(tip).toHaveAttribute("role", "tooltip");
    expect(tip).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("button", { name: "Open settings" })).not.toHaveAttribute("aria-describedby");
    await user.keyboard("{Escape}");
    await act(async () => {});
    expect(screen.getByRole("button")).toHaveFocus();
  });

  it("shows the tooltip on hover", async () => {
    const user = userEvent.setup();
    render(<IconButton icon={icon} aria-label="Open settings" />);
    await user.hover(screen.getByRole("button"));
    expect(await screen.findByRole("tooltip", { hidden: true })).toHaveTextContent("Open settings");
  });

  it("lets title override the tooltip text without changing the name", async () => {
    const user = userEvent.setup();
    render(<IconButton icon={icon} aria-label="Settings" title="Settings (S)" />);
    await user.tab();
    expect(await screen.findByText("Settings (S)")).toHaveAttribute("role", "tooltip");
    expect(screen.getByRole("button", { name: "Settings" })).not.toHaveAttribute("title");
  });

  it("renders no tooltip with tooltip={false}, when disabled or when loading", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<IconButton icon={icon} aria-label="Go" tooltip={false} />);
    await user.tab();
    expect(screen.queryByRole("tooltip", { hidden: true })).toBeNull();
    rerender(<IconButton icon={icon} aria-label="Go" loading />);
    await user.tab();
    await user.hover(screen.getByRole("button"));
    expect(screen.queryByRole("tooltip", { hidden: true })).toBeNull();
  });

  it("still runs the consumer's focus, blur and key handlers beside the tooltip's", async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const onKeyDown = vi.fn();
    render(
      <IconButton icon={icon} aria-label="Go" onFocus={onFocus} onBlur={onBlur} onKeyDown={onKeyDown} />,
    );
    await user.tab();
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole("tooltip", { hidden: true })).toBeInTheDocument();
    await user.keyboard("a");
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    await user.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("shows the tooltip on a link too and forwards the ref", async () => {
    const user = userEvent.setup();
    const ref = { current: null as HTMLAnchorElement | null };
    render(<IconButton icon={icon} aria-label="Settings" href="/settings" ref={ref} />);
    await user.tab();
    expect(await screen.findByRole("tooltip", { hidden: true })).toHaveTextContent("Settings");
    expect(ref.current).toBe(screen.getByRole("link"));
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
