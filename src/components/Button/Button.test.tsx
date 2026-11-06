import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { LufiaProvider, type LinkComponent } from "../LufiaProvider";
import { Button } from "./Button";

describe("Button", () => {
  it("renders a button of type button by default, with variant and size as data attributes", () => {
    render(
      <Button variant="danger" size="lg">
        Delete
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Delete" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("data-variant", "danger");
    expect(button).toHaveAttribute("data-size", "lg");
  });

  it("defaults to the secondary variant and the md size", () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", "secondary");
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "md");
  });

  it("calls onClick, and not when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = render(<Button onClick={onClick}>Go</Button>);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
    rerender(
      <Button onClick={onClick} disabled>
        Go
      </Button>,
    );
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("while loading: aria-busy, ignores activation, stays focusable and keeps its name", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).not.toBeDisabled();
    await user.click(button);
    await user.keyboard("{Enter}");
    expect(onClick).not.toHaveBeenCalled();
    button.focus();
    expect(button).toHaveFocus();
  });

  it("has no aria-busy when idle", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button")).not.toHaveAttribute("aria-busy");
  });

  it("hides decorative icons from assistive technology and keeps the label as the name", () => {
    render(
      <Button iconStart={<svg data-testid="start" />} iconEnd={<svg data-testid="end" />}>
        Next
      </Button>,
    );
    expect(screen.getByTestId("start").parentElement).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByTestId("end").parentElement).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
  });

  it("marks full width", () => {
    render(<Button fullWidth>Wide</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-full-width");
  });

  it("forwards ref, className and rest props", () => {
    const ref = vi.fn();
    render(
      <Button ref={ref} className="extra" data-testid="b" aria-haspopup="menu">
        X
      </Button>,
    );
    expect(ref).toHaveBeenCalledWith(screen.getByTestId("b"));
    expect(screen.getByTestId("b")).toHaveClass("extra");
    expect(screen.getByTestId("b")).toHaveAttribute("aria-haspopup", "menu");
  });

  describe("as a link", () => {
    it("renders an anchor through the configured link component", () => {
      const Custom: LinkComponent = ({ children, ...rest }) => (
        <a {...rest} data-custom="">
          {children}
        </a>
      );
      render(
        <LufiaProvider linkComponent={Custom}>
          <Button href="/reports" variant="primary">
            Reports
          </Button>
        </LufiaProvider>,
      );
      const link = screen.getByRole("link", { name: "Reports" });
      expect(link).toHaveAttribute("href", "/reports");
      expect(link).toHaveAttribute("data-custom");
      expect(link).toHaveAttribute("data-variant", "primary");
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("ignores activation when disabled or loading, and says so with aria-disabled", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const { rerender } = render(
        <Button href="/a" disabled onClick={onClick}>
          Go
        </Button>,
      );
      expect(screen.getByRole("link")).toHaveAttribute("aria-disabled", "true");
      await user.click(screen.getByRole("link"));
      rerender(
        <Button href="/a" loading onClick={onClick}>
          Go
        </Button>,
      );
      await user.click(screen.getByRole("link"));
      expect(onClick).not.toHaveBeenCalled();
      expect(screen.getByRole("link")).toHaveAttribute("aria-busy", "true");
    });

    it("calls onClick when active", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn((event) => event.preventDefault());
      render(
        <Button href="/a" onClick={onClick}>
          Go
        </Button>,
      );
      await user.click(screen.getByRole("link"));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  it("has no axe violations in every state", async () => {
    const { container } = render(
      <div>
        <Button variant="primary">A</Button>
        <Button variant="danger" loading>
          B
        </Button>
        <Button variant="ghost" disabled>
          C
        </Button>
        <Button href="/x">D</Button>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
