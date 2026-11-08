import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { LufiaProvider } from "../LufiaProvider";
import { Sidebar } from "./Sidebar";
import { ShellFooter, ShellFooterItem } from "./ShellFooter";

const icon = <svg data-testid="icon" />;

function inSidebar(node: React.ReactNode, collapsed = false) {
  return (
    <Sidebar label="Main" collapsed={collapsed} footer={node}>
      {null}
    </Sidebar>
  );
}

describe("ShellFooterItem", () => {
  it("is a link with an href and a button without one", () => {
    render(
      <ShellFooter aria-label="Account">
        <ShellFooterItem label="Settings" href="/settings" icon={icon} />
        <ShellFooterItem label="Sign out" onClick={() => {}} />
      </ShellFooter>,
    );
    expect(screen.getByRole("group", { name: "Account" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute("href", "/settings");
    expect(screen.getByRole("button", { name: "Sign out" })).toHaveAttribute("type", "button");
  });

  it("renders the link through the configured link component, and an external one as a plain anchor", () => {
    const Custom = vi.fn(({ children, href, ...rest }: React.ComponentProps<"a"> & { href: string }) => (
      <a {...rest} href={href} data-custom="">
        {children}
      </a>
    ));
    render(
      <LufiaProvider linkComponent={Custom}>
        <ShellFooterItem label="Settings" href="/settings" />
        <ShellFooterItem label="Site" href="https://example.com" external target="_blank" />
      </LufiaProvider>,
    );
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute("data-custom");
    const site = screen.getByRole("link", { name: "Site" });
    expect(site).not.toHaveAttribute("data-custom");
    expect(site).toHaveAttribute("target", "_blank");
    expect(site).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("marks the current page", () => {
    render(<ShellFooterItem label="Settings" href="/settings" active />);
    const link = screen.getByRole("link", { name: "Settings" });
    expect(link).toHaveAttribute("aria-current", "page");
    expect(link).toHaveAttribute("data-active");
  });

  it("submits a form with type submit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <ShellFooterItem label="Sign out" type="submit" />
      </form>,
    );
    await user.click(screen.getByRole("button", { name: "Sign out" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("while pending is busy, keeps focus, and ignores clicks (a link does not navigate either)", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <ShellFooterItem label="Sign out" type="submit" pending onClick={onClick} />
        <ShellFooterItem label="Go" href="/go" pending onClick={onClick} />
      </form>,
    );
    const button = screen.getByRole("button", { name: "Sign out" });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toBeEnabled();
    await user.click(button);
    await user.click(screen.getByRole("link", { name: "Go" }));
    expect(onClick).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("renders a disabled item with an href as a disabled button", () => {
    render(<ShellFooterItem label="Locked" href="/locked" disabled />);
    expect(screen.getByRole("button", { name: "Locked" })).toBeDisabled();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("is a toggle with pressed, and takes tone, class and data-*", () => {
    render(<ShellFooterItem label="Dark theme" pressed className="hook" tone="warning" data-tour="theme" />);
    const toggle = screen.getByRole("button", { name: "Dark theme" });
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(toggle).toHaveClass("hook");
    expect(toggle).toHaveAttribute("data-tone", "warning");
    expect(toggle).toHaveAttribute("data-tour", "theme");
  });

  it("shows a count that is capped and hidden at zero", () => {
    render(
      <>
        <ShellFooterItem label="Help" href="/help" count={120} countTone="danger" />
        <ShellFooterItem label="Quiet" href="/q" count={0} />
      </>,
    );
    expect(screen.getByText("99+")).toHaveAttribute("data-tone", "danger");
    expect(screen.getByRole("link", { name: "Quiet" })).toHaveTextContent(/^Quiet$/);
  });

  it("follows the surface: a tooltip and no native title in the rail, none when open", async () => {
    const user = userEvent.setup();
    const footer = (
      <ShellFooter aria-label="Account">
        <ShellFooterItem label="Settings" href="/settings" icon={icon} />
      </ShellFooter>
    );
    const { rerender } = render(inSidebar(footer, true));
    const link = screen.getByRole("link", { name: "Settings" });
    expect(screen.getByRole("group", { name: "Account" })).toHaveAttribute("data-collapsed");
    expect(link).not.toHaveAttribute("title");
    await user.tab();
    expect(link).toHaveFocus();
    expect(screen.getByRole("tooltip", { hidden: true })).toHaveTextContent("Settings");
    await user.keyboard("{Escape}");
    rerender(inSidebar(footer, false));
    expect(screen.getByRole("group", { name: "Account" })).not.toHaveAttribute("data-collapsed");
    link.focus();
    expect(screen.queryByRole("tooltip", { hidden: true })).not.toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      inSidebar(
        <ShellFooter aria-label="Account">
          <ShellFooterItem label="Settings" href="/settings" icon={icon} active />
          <ShellFooterItem label="Sign out" icon={icon} pending count={2} />
        </ShellFooter>,
        true,
      ),
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
