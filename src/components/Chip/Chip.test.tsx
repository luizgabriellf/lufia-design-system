import { readFileSync } from "node:fs";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { Chip } from "./Chip";

describe("Chip", () => {
  it("is a plain span with the label when it has no action", () => {
    render(<Chip data-testid="c">Draft</Chip>);
    const chip = screen.getByTestId("c");
    expect(chip.tagName).toBe("SPAN");
    expect(chip).toHaveTextContent("Draft");
    expect(screen.queryByRole("button")).toBeNull();
  });

  describe("action chip", () => {
    it("is a button of type button that calls onClick", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<Chip onClick={onClick}>Summarise</Chip>);
      const chip = screen.getByRole("button", { name: "Summarise" });
      expect(chip).toHaveAttribute("type", "button");
      expect(chip).not.toHaveAttribute("aria-pressed");
      await user.click(chip);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("activates from the keyboard with Enter and Space", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<Chip onClick={onClick}>Summarise</Chip>);
      await user.tab();
      expect(screen.getByRole("button")).toHaveFocus();
      await user.keyboard("{Enter}");
      await user.keyboard(" ");
      expect(onClick).toHaveBeenCalledTimes(2);
    });

    it("ignores activation and leaves the tab order when disabled", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <Chip onClick={onClick} disabled>
          Summarise
        </Chip>,
      );
      const chip = screen.getByRole("button");
      expect(chip).toBeDisabled();
      expect(chip).toHaveAttribute("data-disabled");
      await user.click(chip);
      await user.tab();
      expect(chip).not.toHaveFocus();
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe("toggle chip", () => {
    it.each([true, false])("exposes selected=%s as aria-pressed", (selected) => {
      render(
        <Chip selected={selected} onClick={() => {}}>
          Open
        </Chip>,
      );
      const chip = screen.getByRole("button", { name: "Open" });
      expect(chip).toHaveAttribute("aria-pressed", String(selected));
      expect(chip.hasAttribute("data-selected")).toBe(selected);
    });

    it("is a button even without onClick, and toggles through the caller's state", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <Chip selected={false} onClick={onClick}>
          Open
        </Chip>,
      );
      await user.click(screen.getByRole("button", { name: "Open" }));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("renders a button for selected alone", () => {
      render(<Chip selected>Open</Chip>);
      expect(screen.getByRole("button", { name: "Open" })).toHaveAttribute("aria-pressed", "true");
    });
  });

  describe("removable chip", () => {
    it("keeps the label as static text and exposes one named remove button", async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();
      render(
        <Chip onRemove={onRemove} removeLabel="Remove Draft" data-testid="c">
          Draft
        </Chip>,
      );
      expect(screen.getByTestId("c").tagName).toBe("SPAN");
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(1);
      expect(buttons[0]).toHaveAccessibleName("Remove Draft");
      expect(buttons[0]).toHaveAttribute("type", "button");
      await user.click(buttons[0]!);
      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it("removes from the keyboard", async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();
      render(
        <Chip onRemove={onRemove} removeLabel="Remove Draft">
          Draft
        </Chip>,
      );
      await user.tab();
      expect(screen.getByRole("button", { name: "Remove Draft" })).toHaveFocus();
      await user.keyboard("{Enter}");
      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it("disables the remove button when disabled", async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();
      render(
        <Chip onRemove={onRemove} removeLabel="Remove Draft" disabled>
          Draft
        </Chip>,
      );
      const remove = screen.getByRole("button", { name: "Remove Draft" });
      expect(remove).toBeDisabled();
      await user.click(remove);
      expect(onRemove).not.toHaveBeenCalled();
    });
  });

  it("never nests a button in a button, whatever the mode", () => {
    const { container } = render(
      <div>
        <Chip>Plain</Chip>
        <Chip onClick={() => {}}>Action</Chip>
        <Chip selected>Toggle</Chip>
        <Chip onRemove={() => {}} removeLabel="Remove">
          Removable
        </Chip>
      </div>,
    );
    expect(container.querySelectorAll("button button")).toHaveLength(0);
    expect(container.querySelectorAll("button")).toHaveLength(3);
  });

  it("hides the start icon from assistive technology and keeps the name", () => {
    render(
      <Chip onClick={() => {}} iconStart={<svg data-testid="icon" />}>
        Summarise
      </Chip>,
    );
    expect(screen.getByTestId("icon").parentElement).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("button")).toHaveAccessibleName("Summarise");
  });

  it("forwards aria-expanded, aria-haspopup and aria-controls to the button", () => {
    render(
      <Chip aria-expanded={false} aria-haspopup="dialog" aria-controls="panel" onClick={() => {}}>
        Filters
      </Chip>,
    );
    const chip = screen.getByRole("button", { name: "Filters" });
    expect(chip).toHaveAttribute("aria-expanded", "false");
    expect(chip).toHaveAttribute("aria-haspopup", "dialog");
    expect(chip).toHaveAttribute("aria-controls", "panel");
  });

  it("forwards them on a toggle chip next to aria-pressed", () => {
    render(
      <Chip selected aria-expanded aria-haspopup="menu">
        Sort
      </Chip>,
    );
    const chip = screen.getByRole("button", { name: "Sort" });
    expect(chip).toHaveAttribute("aria-pressed", "true");
    expect(chip).toHaveAttribute("aria-expanded", "true");
    expect(chip).toHaveAttribute("aria-haspopup", "menu");
  });

  it("exposes the tone, with neutral as the default that adds nothing", () => {
    const { rerender } = render(<Chip data-testid="c">A</Chip>);
    expect(screen.getByTestId("c")).not.toHaveAttribute("data-tone");
    rerender(
      <Chip data-testid="c" tone="neutral">
        A
      </Chip>,
    );
    expect(screen.getByTestId("c")).not.toHaveAttribute("data-tone");
    for (const tone of ["accent", "success", "warning", "danger"] as const) {
      rerender(
        <Chip data-testid="c" tone={tone} onClick={() => {}}>
          A
        </Chip>,
      );
      expect(screen.getByTestId("c")).toHaveAttribute("data-tone", tone);
    }
  });

  it("colours every tone from semantic tokens only", () => {
    const css = readFileSync("src/components/Chip/Chip.module.css", "utf8");
    for (const tone of ["accent", "success", "warning", "danger"]) {
      expect(css).toMatch(new RegExp(`\\.root\\[data-tone="${tone}"\\] \\{[^}]*var\\(--lufia-color-`));
    }
    expect(css).not.toMatch(/--lufia-(primitive|color-(green|red|amber|blue))/);
  });

  it("defaults to md and exposes the size", () => {
    const { rerender } = render(<Chip data-testid="c">A</Chip>);
    expect(screen.getByTestId("c")).toHaveAttribute("data-size", "md");
    rerender(
      <Chip size="sm" data-testid="c">
        A
      </Chip>,
    );
    expect(screen.getByTestId("c")).toHaveAttribute("data-size", "sm");
  });

  it("passes className, rest props and ref to the root", () => {
    const ref = createRef<HTMLElement>();
    render(
      <Chip className="extra" data-testid="c" onClick={() => {}} ref={ref}>
        A
      </Chip>,
    );
    expect(screen.getByTestId("c")).toHaveClass("extra");
    expect(ref.current).toBe(screen.getByTestId("c"));
  });

  it("reads its theme hooks with the semantic tokens as fallback", () => {
    const css = readFileSync("src/components/Chip/Chip.module.css", "utf8").replace(/\s+/g, " ");
    for (const hook of [
      "bg",
      "fg",
      "border",
      "bg-hover",
      "selected-bg",
      "selected-fg",
      "selected-border",
      "radius",
    ]) {
      expect(css).toContain(`var(--lufia-chip-${hook}, var(--lufia-`);
    }
  });

  it("has no axe violations in any mode", async () => {
    const { container } = render(
      <div>
        <Chip>Plain</Chip>
        <Chip onClick={() => {}}>Action</Chip>
        <Chip selected>Toggle</Chip>
        <Chip tone="success">Paid</Chip>
        <Chip tone="warning" onClick={() => {}}>
          Pending
        </Chip>
        <Chip tone="danger">Overdue</Chip>
        <Chip tone="accent">New</Chip>
        <Chip aria-haspopup="dialog" aria-expanded={false} onClick={() => {}}>
          Filters
        </Chip>
        <Chip onClick={() => {}} disabled>
          Disabled
        </Chip>
        <Chip onRemove={() => {}} removeLabel="Remove Draft">
          Draft
        </Chip>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
