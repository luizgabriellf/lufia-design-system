import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { PageActions } from "./PageActions";

const withLayout = () =>
  vi
    .spyOn(Element.prototype, "getClientRects")
    .mockImplementation(() => [new DOMRect(0, 0, 10, 10)] as unknown as DOMRectList);

afterEach(() => vi.restoreAllMocks());

describe("PageActions", () => {
  it("renders the primary action as the primary variant and calls onSelect", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<PageActions moreLabel="More" primary={{ key: "n", label: "New", onSelect }} />);
    const button = screen.getByRole("button", { name: "New" });
    expect(button).toHaveAttribute("data-variant", "primary");
    await user.click(button);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("renders secondary actions as buttons and also lists them in the menu, flagged for narrow screens", async () => {
    withLayout();
    const user = userEvent.setup();
    render(
      <PageActions
        moreLabel="More"
        primary={{ key: "n", label: "New" }}
        secondary={[{ key: "s", label: "Share" }]}
        overflow={[{ key: "o", label: "Export" }]}
      />,
    );
    expect(screen.getByRole("button", { name: "Share" })).toHaveAttribute("data-variant", "secondary");
    await user.click(screen.getByRole("button", { name: "More" }));
    expect(screen.getByRole("menuitem", { name: "Share" }).closest("li")).toHaveAttribute("data-narrow-only");
    expect(screen.getByRole("menuitem", { name: "Export" }).closest("li")).not.toHaveAttribute(
      "data-narrow-only",
    );
  });

  it("shows no menu button when there is nothing to put in it", () => {
    render(<PageActions moreLabel="More" primary={{ key: "n", label: "New" }} />);
    expect(screen.queryByRole("button", { name: "More" })).not.toBeInTheDocument();
  });

  it("renders a link primary with href", () => {
    render(<PageActions moreLabel="More" primary={{ key: "n", label: "New", href: "/new" }} />);
    expect(screen.getByRole("link", { name: "New" })).toHaveAttribute("href", "/new");
  });

  it("selects a menu item and calls its handler", async () => {
    withLayout();
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<PageActions moreLabel="More" overflow={[{ key: "o", label: "Export", onSelect }]} />);
    await user.click(screen.getByRole("button", { name: "More" }));
    await user.click(screen.getByRole("menuitem", { name: "Export" }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("passes className and rest props to the root", () => {
    render(<PageActions moreLabel="More" className="extra" data-testid="p" />);
    expect(screen.getByTestId("p")).toHaveClass("extra");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <PageActions
        moreLabel="More"
        primary={{ key: "n", label: "New" }}
        secondary={[{ key: "s", label: "Share" }]}
        overflow={[{ key: "o", label: "Export" }]}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
