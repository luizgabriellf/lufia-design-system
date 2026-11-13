import { render, screen, within } from "@testing-library/react";
import { axe } from "../../test/axe";
import { LufiaProvider, type LinkComponent } from "../LufiaProvider";
import { CitationList, type CitationItem } from "./CitationList";

const items: CitationItem[] = [
  { key: "a", label: "Standard", reference: "Standard 123, clause 4", href: "/standard" },
  { key: "b", reference: "Regulation 45, article 7" },
];

describe("CitationList", () => {
  it("renders a list item per entry, named by the title", () => {
    render(<CitationList items={items} title="Sources" />);
    const list = screen.getByRole("list", { name: "Sources" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
  });

  it("links only the items with an href", () => {
    render(<CitationList items={items} title="Sources" />);
    const link = screen.getByRole("link", { name: "Standard 123, clause 4" });
    expect(link).toHaveAttribute("href", "/standard");
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getByText("Regulation 45, article 7")).toBeInTheDocument();
  });

  it("shows the label beside the reference", () => {
    render(<CitationList items={items} />);
    expect(screen.getAllByRole("listitem")[0]).toHaveTextContent("StandardStandard 123, clause 4");
  });

  it("renders links through the configured link component", () => {
    const RouterLink: LinkComponent = ({ children, ...rest }) => (
      <a {...rest} data-routed="">
        {children}
      </a>
    );
    render(
      <LufiaProvider linkComponent={RouterLink}>
        <CitationList items={items} />
      </LufiaProvider>,
    );
    expect(screen.getByRole("link")).toHaveAttribute("data-routed");
  });

  it("names the list with aria-label when there is no title", () => {
    render(<CitationList items={items} aria-label="Sources" />);
    expect(screen.getByRole("list", { name: "Sources" })).toBeInTheDocument();
  });

  it("renders nothing when there are no items", () => {
    const { container } = render(<CitationList items={[]} title="Sources" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("passes className and rest props to the root", () => {
    render(<CitationList items={items} className="extra" data-testid="c" />);
    expect(screen.getByTestId("c")).toHaveClass("extra");
  });

  it("has no axe violations", async () => {
    const { container } = render(<CitationList items={items} title="Sources" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
