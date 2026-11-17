import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { axe } from "../../test/axe";
import { LufiaProvider, type LinkComponent } from "../LufiaProvider";
import { FilterLinks, type FilterLinksItem } from "./FilterLinks";

const items: FilterLinksItem[] = [
  { key: "all", label: "All", href: "?status=all", count: 24 },
  { key: "open", label: "Open", href: "?status=open", count: 0 },
  { key: "closed", label: "Closed", href: "?status=closed" },
];

describe("FilterLinks", () => {
  it("renders a labelled nav with one real link per item", () => {
    render(<FilterLinks label="Filter by status" items={items} value="all" />);
    const nav = screen.getByRole("navigation", { name: "Filter by status" });
    expect(nav).toBeInTheDocument();
    expect(screen.getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual([
      "?status=all",
      "?status=open",
      "?status=closed",
    ]);
  });

  it("marks only the current link with aria-current true", () => {
    render(<FilterLinks label="Filter" items={items} value="open" />);
    const current = screen.getAllByRole("link").filter((link) => link.hasAttribute("aria-current"));
    expect(current).toHaveLength(1);
    expect(current[0]!).toHaveTextContent("Open");
    expect(current[0]!).toHaveAttribute("aria-current", "true");
  });

  it("marks none when value matches nothing or is left out", () => {
    const { rerender } = render(<FilterLinks label="Filter" items={items} />);
    expect(document.querySelector("[aria-current]")).toBeNull();
    rerender(<FilterLinks label="Filter" items={items} value="missing" />);
    expect(document.querySelector("[aria-current]")).toBeNull();
  });

  it("shows a count, including zero, and nothing when it is undefined", () => {
    render(<FilterLinks label="Filter" items={items} value="all" />);
    expect(screen.getByRole("link", { name: "All 24" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open 0" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Closed" })).toBeInTheDocument();
  });

  it("renders a native item as a plain anchor and leaves the others on the adapter", () => {
    const Custom: LinkComponent = ({ children, ...rest }) => (
      <a {...rest} data-custom="">
        {children}
      </a>
    );
    render(
      <LufiaProvider linkComponent={Custom}>
        <FilterLinks
          label="Filter"
          value="open"
          items={[
            { key: "all", label: "All", href: "/all", count: 3 },
            { key: "open", label: "Open", href: "/open", native: true, count: 2 },
          ]}
        />
      </LufiaProvider>,
    );
    const native = screen.getByRole("link", { name: "Open 2" });
    expect(native).not.toHaveAttribute("data-custom");
    expect(native).toHaveAttribute("href", "/open");
    expect(native).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("link", { name: "All 3" })).toHaveAttribute("data-custom");
  });

  it("renders through the configured link component", () => {
    const Custom: LinkComponent = ({ children, ...rest }) => (
      <a {...rest} data-custom="">
        {children}
      </a>
    );
    render(
      <LufiaProvider linkComponent={Custom}>
        <FilterLinks label="Filter" items={items} value="all" />
      </LufiaProvider>,
    );
    for (const link of screen.getAllByRole("link")) expect(link).toHaveAttribute("data-custom");
  });

  it("forwards ref, className and rest props to the nav", () => {
    const ref = createRef<HTMLElement>();
    render(<FilterLinks ref={ref} label="Filter" items={items} className="mine" data-testid="row" />);
    expect(ref.current).toBe(screen.getByTestId("row"));
    expect(ref.current).toHaveClass("mine");
    expect(ref.current?.tagName).toBe("NAV");
  });

  it("has no axe violations", async () => {
    const { container } = render(<FilterLinks label="Filter by status" items={items} value="open" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
