import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { BANNER_VARIANTS, Banner, type BannerVariant } from "./Banner";

describe("Banner", () => {
  it("renders title, description and action", () => {
    render(
      <Banner title="Access expires" action={<a href="/renew">Renew</a>}>
        Your access ends on Friday.
      </Banner>,
    );
    const region = screen.getByRole("status");
    expect(region).toHaveTextContent("Access expires");
    expect(region).toHaveTextContent("Your access ends on Friday.");
    expect(screen.getByRole("link", { name: "Renew" })).toBeInTheDocument();
  });

  it("omits the optional parts", () => {
    const { container } = render(<Banner>Only text</Banner>);
    expect(container.querySelector("button")).toBeNull();
    expect(container.textContent).toBe("Only text");
  });

  it.each([
    ["info", "status"],
    ["success", "status"],
    ["neutral", "status"],
    ["warning", "alert"],
    ["danger", "alert"],
  ] as [BannerVariant, string][])("announces %s as %s", (variant, role) => {
    render(<Banner variant={variant}>Message</Banner>);
    expect(screen.getByRole(role)).toHaveAttribute("data-variant", variant);
  });

  it("lets the consumer override the announcement with `live`", () => {
    const { rerender } = render(
      <Banner variant="danger" live="polite">
        Message
      </Banner>,
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
    rerender(
      <Banner variant="info" live="assertive">
        Message
      </Banner>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    rerender(
      <Banner variant="danger" live="off">
        Message
      </Banner>,
    );
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("draws a default icon per variant, each a distinct shape, hidden from assistive technology", () => {
    const shapes = BANNER_VARIANTS.map((variant) => {
      const { container, unmount } = render(<Banner variant={variant}>Message</Banner>);
      const icon = container.querySelector("[aria-hidden='true'] [data-lufia-icon]");
      expect(icon).not.toBeNull();
      const shape = icon!.getAttribute("data-lufia-icon");
      unmount();
      return shape;
    });
    expect(new Set(shapes).size).toBe(BANNER_VARIANTS.length);
  });

  it("replaces the icon, or removes it with null", () => {
    const { container, rerender } = render(<Banner icon={<i data-testid="own" />}>Message</Banner>);
    expect(screen.getByTestId("own").parentElement).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector("[data-lufia-icon]")).toBeNull();
    rerender(<Banner icon={null}>Message</Banner>);
    expect(container.querySelector("[aria-hidden='true']")).toBeNull();
  });

  it("shows a dismiss button only with onDismiss, named by dismissLabel", () => {
    const { rerender } = render(<Banner>Message</Banner>);
    expect(screen.queryByRole("button")).toBeNull();
    rerender(
      <Banner onDismiss={() => {}} dismissLabel="Dispensar">
        Message
      </Banner>,
    );
    expect(screen.getByRole("button", { name: "Dispensar" })).toBeInTheDocument();
  });

  it("dismisses with the keyboard (Enter and Space) and the pointer", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(
      <Banner onDismiss={onDismiss} dismissLabel="Dismiss">
        Message
      </Banner>,
    );
    await user.tab();
    const button = screen.getByRole("button", { name: "Dismiss" });
    expect(button).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onDismiss).toHaveBeenCalledTimes(2);
    await user.click(button);
    expect(onDismiss).toHaveBeenCalledTimes(3);
  });

  it("puts className and rest props on the root and exposes state as data attributes", () => {
    render(
      <Banner className="mine" id="b" size="compact" animateIn data-testid="root">
        Message
      </Banner>,
    );
    const root = screen.getByTestId("root");
    expect(root).toHaveClass("mine");
    expect(root).toHaveAttribute("id", "b");
    expect(root).toHaveAttribute("data-size", "compact");
    expect(root).toHaveAttribute("data-animate-in", "true");
  });

  it("has no axe violations in any variant, with every part", async () => {
    for (const variant of BANNER_VARIANTS) {
      const { container, unmount } = render(
        <Banner
          variant={variant}
          title="Title"
          action={<button type="button">Act</button>}
          onDismiss={() => {}}
          dismissLabel="Dismiss"
        >
          Description
        </Banner>,
      );
      expect(await axe(container)).toHaveNoViolations();
      unmount();
    }
  });
});
