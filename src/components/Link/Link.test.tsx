import { render, screen } from "@testing-library/react";
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

  it("has no axe violations", async () => {
    const { container } = render(
      <p>
        <Link href="/a">A</Link>{" "}
        <Link href="https://example.com" externalLabel="(opens in new tab)">
          B
        </Link>
      </p>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
