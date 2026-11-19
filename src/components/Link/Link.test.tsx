import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { LufiaProvider, type LinkComponent } from "../LufiaProvider";
import { Link } from "./Link";

describe("Link", () => {
  it("renders an anchor with the href and the text", () => {
    render(<Link href="/guide">Guide</Link>);
    const link = screen.getByRole("link", { name: "Guide" });
    expect(link).toHaveAttribute("href", "/guide");
    expect(link).not.toHaveAttribute("target");
  });

  it("renders through the configured link component", () => {
    const Custom: LinkComponent = ({ children, ...rest }) => (
      <a {...rest} data-custom="">
        {children}
      </a>
    );
    render(
      <LufiaProvider linkComponent={Custom}>
        <Link href="/a">A</Link>
      </LufiaProvider>,
    );
    expect(screen.getByRole("link")).toHaveAttribute("data-custom");
  });

  it("external: opens a new tab safely and announces it", () => {
    render(
      <Link href="https://example.com" externalLabel="(opens in new tab)">
        Spec
      </Link>,
    );
    const link = screen.getByRole("link", { name: "Spec (opens in new tab)" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("adds noopener noreferrer to any target=_blank link and merges the caller's rel", () => {
    render(
      <>
        <Link href="/a" target="_blank">
          Plain
        </Link>
        <Link href="/b" target="_blank" rel="author noopener">
          Merged
        </Link>
        <Link href="/c" rel="author">
          Same tab
        </Link>
      </>,
    );
    expect(screen.getByRole("link", { name: "Plain" })).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("link", { name: "Merged" })).toHaveAttribute("rel", "author noopener noreferrer");
    expect(screen.getByRole("link", { name: "Same tab" })).toHaveAttribute("rel", "author");
  });

  it("internal: no indicator and no hidden label", () => {
    render(<Link href="/a">A</Link>);
    expect(screen.getByRole("link").querySelector("svg")).toBeNull();
    expect(screen.getByRole("link")).toHaveAccessibleName("A");
  });

  it("passes className and rest props", () => {
    render(
      <Link href="/a" className="extra" data-testid="l">
        A
      </Link>,
    );
    expect(screen.getByTestId("l")).toHaveClass("extra");
  });

  it("is inline by default and exposes the variant", () => {
    const { rerender } = render(<Link href="/a">A</Link>);
    expect(screen.getByRole("link")).toHaveAttribute("data-variant", "inline");
    rerender(
      <Link href="/a" variant="standalone">
        A
      </Link>,
    );
    expect(screen.getByRole("link")).toHaveAttribute("data-variant", "standalone");
  });

  it("renders iconEnd after the text, hidden from assistive technology and out of the name", () => {
    render(
      <Link href="/a" iconEnd={<svg data-testid="icon" />}>
        Open
      </Link>,
    );
    const link = screen.getByRole("link", { name: "Open" });
    const icon = screen.getByTestId("icon");
    expect(icon.parentElement).toHaveAttribute("aria-hidden", "true");
    expect(link.lastElementChild).toBe(icon.parentElement);
  });

  it("keeps the external indicator and its label with an iconEnd", () => {
    render(
      <Link
        href="https://example.com"
        externalLabel="(opens in new tab)"
        iconEnd={<svg data-testid="icon" />}
      >
        Spec
      </Link>,
    );
    const link = screen.getByRole("link", { name: "Spec (opens in new tab)" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("data-external");
  });

  it("is reachable and followed from the keyboard", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    render(
      <Link href="/a" variant="standalone" iconEnd={<svg />} onClick={onClick}>
        Open
      </Link>,
    );
    await user.tab();
    expect(screen.getByRole("link")).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("underlines a standalone link only on hover and focus, and moves the icon only without reduced motion", () => {
    const css = readFileSync("src/components/Link/Link.module.css", "utf8");
    expect(css).toMatch(/\.root\[data-variant="standalone"\] \{[^}]*text-decoration-line: none/);
    expect(css).toMatch(
      /\.root\[data-variant="standalone"\]:focus-visible \{\s*text-decoration-line: underline/,
    );
    expect(css).toMatch(
      /@media \(hover: hover\) and \(prefers-reduced-motion: no-preference\) \{[^@]*translate: 0\.125rem/,
    );
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <p>
        <Link href="/a">A</Link>{" "}
        <Link href="https://example.com" externalLabel="(opens in new tab)">
          B
        </Link>{" "}
        <Link href="/c" variant="standalone" iconEnd={<svg />}>
          C
        </Link>
      </p>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
