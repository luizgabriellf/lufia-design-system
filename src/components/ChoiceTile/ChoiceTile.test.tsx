import { readFileSync } from "node:fs";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { ChoiceTile } from "./ChoiceTile";

describe("ChoiceTile", () => {
  it("is a button of type button with the label as its name", () => {
    render(<ChoiceTile label="16:30" />);
    const tile = screen.getByRole("button", { name: "16:30" });
    expect(tile).toHaveAttribute("type", "button");
    expect(tile).not.toHaveAttribute("aria-pressed");
  });

  it("joins the eyebrow, label and description into one name, in reading order", () => {
    render(<ChoiceTile eyebrow="Thursday" label="19/11" description="2 free" />);
    expect(screen.getByRole("button")).toHaveAccessibleName("Thursday 19/11 2 free");
  });

  it("renders only the label when there is no eyebrow or description", () => {
    const { container } = render(<ChoiceTile label="16:30" />);
    expect(container.querySelectorAll("button > span")).toHaveLength(1);
  });

  it.each([true, false])("exposes selected=%s as aria-pressed", (selected) => {
    render(<ChoiceTile label="A" selected={selected} />);
    const tile = screen.getByRole("button");
    expect(tile).toHaveAttribute("aria-pressed", String(selected));
    expect(tile.hasAttribute("data-selected")).toBe(selected);
  });

  it("calls onClick from the pointer and from Enter and Space", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ChoiceTile label="A" onClick={onClick} />);
    await user.click(screen.getByRole("button"));
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it("ignores activation and leaves the tab order when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ChoiceTile label="A" onClick={onClick} disabled />);
    const tile = screen.getByRole("button");
    expect(tile).toBeDisabled();
    expect(tile).toHaveAttribute("data-disabled");
    await user.click(tile);
    await user.tab();
    expect(tile).not.toHaveFocus();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("defaults to solid and md and exposes both", () => {
    const { rerender } = render(<ChoiceTile label="A" data-testid="t" />);
    expect(screen.getByTestId("t")).toHaveAttribute("data-emphasis", "solid");
    expect(screen.getByTestId("t")).toHaveAttribute("data-size", "md");
    rerender(<ChoiceTile label="A" data-testid="t" emphasis="subtle" size="sm" fullWidth />);
    expect(screen.getByTestId("t")).toHaveAttribute("data-emphasis", "subtle");
    expect(screen.getByTestId("t")).toHaveAttribute("data-size", "sm");
    expect(screen.getByTestId("t")).toHaveAttribute("data-full-width");
  });

  it("passes className, rest props and ref to the button", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<ChoiceTile label="A" className="extra" data-testid="t" aria-controls="panel" ref={ref} />);
    const tile = screen.getByTestId("t");
    expect(tile).toHaveClass("extra");
    expect(tile).toHaveAttribute("aria-controls", "panel");
    expect(ref.current).toBe(tile);
  });

  it("lets a caller override the default type", () => {
    render(<ChoiceTile label="A" type="submit" />);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  describe("styles", () => {
    const css = readFileSync("src/components/ChoiceTile/ChoiceTile.module.css", "utf8");

    it("paints the solid selected tile with the accent fill and on-accent text", () => {
      expect(css).toMatch(
        /\[data-selected\]\[data-emphasis="solid"\] \{[^}]*background: var\(--lufia-color-accent-default\)[^}]*color: var\(--lufia-color-text-on-accent\)/,
      );
    });

    it("keeps the touch floor on md and restores it on sm under a coarse pointer", () => {
      expect(css).toMatch(/--choice-tile-height: var\(--lufia-target-touch/);
      expect(css).toMatch(/@media \(pointer: coarse\) \{[^}]*data-size="sm"\][^}]*--lufia-target-touch/);
    });

    it("applies hover only where hover exists and never to a selected tile", () => {
      expect(css).toMatch(/@media \(hover: hover\) \{\s*\.root:hover:not\(:disabled, \[data-selected\]\)/);
    });

    it("marks the selected tile with Highlight under forced colors", () => {
      expect(css).toMatch(/forced-colors: active[\s\S]*\[data-selected\] \{[^}]*border-color: Highlight/);
    });

    it("keeps the border width constant and marks selection with an inset outline under forced colors", () => {
      const forced = css.slice(css.indexOf("forced-colors: active"));
      expect(forced).not.toMatch(/\bborder-width:/);
      expect(forced).toMatch(
        /\[data-selected\] \{[^}]*outline: [^;]*Highlight;[^}]*outline-offset: calc\(-1/,
      );
    });

    it("keeps a disabled selected tile distinguishable under forced colors", () => {
      const forced = css.slice(css.indexOf("forced-colors: active"));
      expect(forced.indexOf("[data-disabled][data-selected]")).toBeGreaterThan(
        forced.indexOf("[data-disabled] {"),
      );
      expect(forced).toMatch(/\[data-disabled\]\[data-selected\] \{[^}]*border-color: Highlight/);
    });

    it("transitions color with the fill", () => {
      expect(css).toMatch(/transition:[^;]*\n\s*color var\(--lufia-motion-duration-fast\)/);
    });

    it("lets the focus ring win over the selection outline", () => {
      const forced = css.slice(css.indexOf("forced-colors: active"));
      expect(forced).toMatch(/\[data-selected\] \{[\s\S]*\.root:focus-visible \{[^}]*outline-offset: 2px/);
    });

    it("reads tokens only", () => {
      expect(css).not.toMatch(/--lufia-(primitive|color-(green|red|amber|blue))/);
    });
  });

  it("does not advise a radiogroup, which is invalid for aria-pressed buttons", () => {
    for (const file of ["ChoiceTile.tsx", "ChoiceTile.mdx"]) {
      expect(readFileSync(`src/components/ChoiceTile/${file}`, "utf8")).not.toMatch(/radiogroup/i);
    }
  });

  it("has no axe violations in any state", async () => {
    const { container } = render(
      <div role="group" aria-label="Day">
        <ChoiceTile label="16:30" />
        <ChoiceTile label="16:30" selected />
        <ChoiceTile eyebrow="Thursday" label="19/11" description="2 free" selected emphasis="subtle" />
        <ChoiceTile label="16:30" size="sm" fullWidth />
        <ChoiceTile label="16:30" disabled />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
