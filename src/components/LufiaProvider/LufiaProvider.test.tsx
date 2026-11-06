import { render, screen } from "@testing-library/react";
import { axe } from "../../test/axe";
import { LufiaLink, LufiaProvider, useLufia, type LinkComponent } from "./LufiaProvider";

function Labels() {
  const { labels } = useLufia();
  return <p>{`${labels.close}|${labels.dismiss}|${labels.notifications}`}</p>;
}

describe("LufiaProvider", () => {
  it("works without a provider, with English aria-only defaults", () => {
    render(<Labels />);
    expect(screen.getByText("Close|Dismiss|Notifications")).toBeInTheDocument();
  });

  it("renders a plain anchor by default", () => {
    render(<LufiaLink href="/reports">Reports</LufiaLink>);
    expect(screen.getByRole("link", { name: "Reports" })).toHaveAttribute("href", "/reports");
  });

  it("renders links through the supplied link component", () => {
    const RouterLink: LinkComponent = ({ children, ...rest }) => (
      <a {...rest} data-router="true">
        {children}
      </a>
    );
    render(
      <LufiaProvider linkComponent={RouterLink}>
        <LufiaLink href="/reports">Reports</LufiaLink>
      </LufiaProvider>,
    );
    expect(screen.getByRole("link", { name: "Reports" })).toHaveAttribute("data-router", "true");
  });

  it("merges partial labels over the defaults and over an outer provider", () => {
    render(
      <LufiaProvider labels={{ close: "Fechar", dismiss: "Dispensar" }}>
        <LufiaProvider labels={{ dismiss: "Ignorar" }}>
          <Labels />
        </LufiaProvider>
      </LufiaProvider>,
    );
    expect(screen.getByText("Fechar|Ignorar|Notifications")).toBeInTheDocument();
  });

  it("inherits the link component of an outer provider", () => {
    const RouterLink: LinkComponent = ({ children, ...rest }) => (
      <a {...rest} data-router="true">
        {children}
      </a>
    );
    render(
      <LufiaProvider linkComponent={RouterLink}>
        <LufiaProvider labels={{ close: "X" }}>
          <LufiaLink href="/a">A</LufiaLink>
        </LufiaProvider>
      </LufiaProvider>,
    );
    expect(screen.getByRole("link")).toHaveAttribute("data-router", "true");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <LufiaProvider>
        <LufiaLink href="/a">A</LufiaLink>
      </LufiaProvider>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
