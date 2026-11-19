import { readFileSync } from "node:fs";
import type { ComponentProps, Ref } from "react";
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

  it("defaults to comfortable and exposes the density on the button and on a rendered element", () => {
    const { rerender } = render(<OptionRow title="A" />);
    expect(screen.getByRole("button")).toHaveAttribute("data-density", "comfortable");
    rerender(<OptionRow title="A" density="compact" />);
    expect(screen.getByRole("button")).toHaveAttribute("data-density", "compact");
    rerender(<OptionRow title="A" density="compact" render={<DemoLink href="#a" />} />);
    expect(screen.getByRole("link")).toHaveAttribute("data-density", "compact");
  });

  it("keeps the compact slots, selected state and disabled behaviour", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = render(
      <OptionRow
        density="compact"
        title="Lisbon"
        description="GMT"
        leading={<svg data-testid="lead" />}
        trailing="check"
        selected
        onClick={onClick}
      />,
    );
    const row = screen.getByRole("button", { name: "Lisbon GMT check" });
    expect(row).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("lead").parentElement).toHaveAttribute("aria-hidden", "true");
    await user.click(row);
    expect(onClick).toHaveBeenCalledTimes(1);
    rerender(<OptionRow density="compact" title="Lisbon" disabled onClick={onClick} />);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("styles compact without card chrome and with a touch-sized floor on coarse pointers", () => {
    const css = readFileSync("src/components/OptionRow/OptionRow.module.css", "utf8").replace(/\s+/g, " ");
    expect(css).toMatch(/\.root\[data-density="compact"\] \{[^}]*box-shadow: none/);
    expect(css).toMatch(/\.root\[data-density="compact"\] \{[^}]*border-color: transparent/);
    expect(css).toMatch(
      /@media \(pointer: coarse\) \{ \.root\[data-density="compact"\] \{ min-block-size: max\(var\(--lufia-option-row-min-block-size, 0px\), var\(--lufia-target-touch, 2\.75rem\)\)/,
    );
  });

  it("has no axe violations in a compact list", async () => {
    const { container } = render(
      <ul>
        <li>
          <OptionRow density="compact" title="A" description="First" selected trailing="check" />
        </li>
        <li>
          <OptionRow density="compact" title="B" disabled />
        </li>
        <li>
          <OptionRow density="compact" title="C" selected render={<DemoLink href="#c" />} />
        </li>
      </ul>,
    );
    expect(await axe(container)).toHaveNoViolations();
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

  it("renders the eyebrow before the title and the meta after the description, all in the name", () => {
    render(<OptionRow title="Guide" eyebrow="Step 1" description="Read first" meta="5 min" />);
    expect(screen.getByRole("button", { name: "Step 1 Guide Read first 5 min" })).toBeInTheDocument();
  });

  it("truncates only when asked", () => {
    const { rerender } = render(<OptionRow title="A" truncate />);
    expect(screen.getByRole("button")).toHaveAttribute("data-truncate");
    rerender(<OptionRow title="A" />);
    expect(screen.getByRole("button")).not.toHaveAttribute("data-truncate");
    const css = readFileSync("src/components/OptionRow/OptionRow.module.css", "utf8").replace(/\s+/g, " ");
    expect(css).toMatch(
      /\.root\[data-truncate\] :is\([^)]*\) \{[^}]*text-overflow: ellipsis[^}]*white-space: nowrap/,
    );
    expect(css).toMatch(/\.copy \{[^}]*min-inline-size: 0/);
  });

  it("highlights without exposing a state to assistive technology", () => {
    const { rerender } = render(<OptionRow title="A" highlighted />);
    const row = screen.getByRole("button");
    expect(row).toHaveAttribute("data-highlighted");
    expect(row).not.toHaveAttribute("aria-pressed");
    expect(row).not.toHaveAttribute("aria-current");
    rerender(<OptionRow title="A" highlighted render={<DemoLink href="#a" />} />);
    expect(screen.getByRole("link")).toHaveAttribute("data-highlighted");
    expect(screen.getByRole("link")).not.toHaveAttribute("aria-current");
  });

  it("passes a menu trigger's spread props through to the button and styles the open state", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onKeyDown = vi.fn();
    const ref = vi.fn();
    // A ref typed for a button, as a menu trigger's spread provides, must still be accepted.
    const buttonRef: Ref<HTMLButtonElement> = ref;
    function Trigger() {
      const triggerProps = {
        ref: buttonRef,
        id: "trigger",
        "aria-haspopup": "menu" as const,
        "aria-controls": "menu-1",
        "aria-expanded": true,
        "aria-label": "Choose a place",
        onClick,
        onKeyDown,
      };
      return <OptionRow title="Place" {...triggerProps} />;
    }
    render(<Trigger />);
    const row = screen.getByRole("button", { name: "Choose a place" });
    expect(row).toHaveAttribute("id", "trigger");
    expect(row).toHaveAttribute("aria-haspopup", "menu");
    expect(row).toHaveAttribute("aria-controls", "menu-1");
    expect(row).toHaveAttribute("aria-expanded", "true");
    expect(ref).toHaveBeenCalledWith(row);
    await user.click(row);
    row.focus();
    await user.keyboard("{ArrowDown}");
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    const css = readFileSync("src/components/OptionRow/OptionRow.module.css", "utf8").replace(/\s+/g, " ");
    expect(css).toMatch(
      /\.root\[aria-expanded="true"\]:not\([^)]*\) \{ border-color: var\(--lufia-color-border-strong\); background: var\(--lufia-color-bg-surface-raised\)/,
    );
  });

  it("renders a static row with no button semantics and no activation", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { container, rerender } = render(
      <OptionRow title="Fact" description="Detail" interactive={false} selected onClick={onClick} />,
    );
    const row = container.firstElementChild as HTMLElement;
    expect(row.tagName).toBe("DIV");
    expect(screen.queryByRole("button")).toBeNull();
    expect(row).toHaveAttribute("data-static");
    expect(row).toHaveAttribute("data-selected");
    expect(row).not.toHaveAttribute("aria-pressed");
    expect(row).not.toHaveAttribute("type");
    await user.click(row);
    expect(onClick).not.toHaveBeenCalled();
    rerender(<OptionRow title="Fact" interactive={false} render={<section aria-label="Fact" />} />);
    expect(container.firstElementChild?.tagName).toBe("SECTION");
  });

  it("ignores disabled on a static row, so it is not dimmed", () => {
    const { container } = render(<OptionRow title="Fact" interactive={false} disabled />);
    const row = container.firstElementChild as HTMLElement;
    expect(row).not.toHaveAttribute("data-disabled");
    expect(row).not.toHaveAttribute("aria-disabled");
  });

  it("exposes the size hooks with today's values as fallbacks and keeps the touch floor", () => {
    const css = readFileSync("src/components/OptionRow/OptionRow.module.css", "utf8").replace(/\s+/g, " ");
    for (const [hook, value] of [
      ["min-block-size", "3.5rem"],
      ["padding-block", "0.75rem"],
      ["padding-inline", "0.85rem"],
      ["description-size", "var\\(--lufia-font-size-sm\\)"],
    ]) {
      expect(css).toMatch(new RegExp(`--lufia-option-row-${hook}, ${value}\\)`));
    }
    expect(css).toContain("--lufia-option-row-title-size, inherit");
    expect(css).toMatch(
      /@media \(pointer: coarse\) \{ \.root \{ min-block-size: max\(var\(--lufia-option-row-min-block-size, 3\.5rem\), var\(--lufia-target-touch/,
    );
  });

  it("has no axe violations with every slot, highlighted, expanded and static", async () => {
    const { container } = render(
      <ul>
        <li>
          <OptionRow title="A" eyebrow="E" description="D" meta="M" trailing="Go" highlighted truncate />
        </li>
        <li>
          <OptionRow title="B" aria-haspopup="menu" aria-expanded aria-controls="m" />
        </li>
        <li>
          <OptionRow title="C" description="D" interactive={false} />
        </li>
      </ul>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
