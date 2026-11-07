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

  it("describes a hinted action with a title and a hidden description", () => {
    render(
      <PageActions
        moreLabel="More"
        primary={{ key: "n", label: "New", hint: "Creates a report" }}
        secondary={[{ key: "s", label: "Share", hint: "Needs a saved report" }]}
      />,
    );
    const primary = screen.getByRole("button", { name: "New" });
    expect(primary).toHaveAttribute("title", "Creates a report");
    expect(primary).toHaveAccessibleDescription("Creates a report");
    expect(screen.getByRole("button", { name: "Share" })).toHaveAccessibleDescription("Needs a saved report");
  });

  it("keeps a hinted disabled button focusable, explained and inert", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <PageActions
        moreLabel="More"
        primary={{ key: "n", label: "New", disabled: true, hint: "Record is superseded", onSelect }}
      />,
    );
    const button = screen.getByRole("button", { name: "New" });
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).toHaveAccessibleDescription("Record is superseded");
    await user.tab();
    expect(button).toHaveFocus();
    await user.click(button);
    await user.keyboard("{Enter}");
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("keeps a disabled action without a hint natively disabled", () => {
    render(<PageActions moreLabel="More" primary={{ key: "n", label: "New", disabled: true }} />);
    expect(screen.getByRole("button", { name: "New" })).toBeDisabled();
  });

  it("marks a hinted disabled link aria-disabled", () => {
    render(
      <PageActions
        moreLabel="More"
        primary={{ key: "n", label: "New", href: "/n", disabled: true, hint: "No" }}
      />,
    );
    const link = screen.getByRole("link", { name: "New" });
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveAccessibleDescription("No");
  });

  it("describes a hinted menu item", async () => {
    withLayout();
    const user = userEvent.setup();
    render(
      <PageActions
        moreLabel="More"
        overflow={[{ key: "o", label: "Export", disabled: true, hint: "Nothing to export" }]}
      />,
    );
    await user.click(screen.getByRole("button", { name: "More" }));
    const item = screen.getByRole("menuitem", { name: "Export" });
    expect(item).toHaveAttribute("title", "Nothing to export");
    expect(item).toHaveAccessibleDescription("Nothing to export");
  });

  it("exposes a stable part, placement and hide markers on the root and passes data attributes through", () => {
    const { rerender } = render(<PageActions moreLabel="More" data-page-actions="" />);
    const root = document.querySelector("[data-lufia-part='page-actions']")!;
    expect(root).toHaveAttribute("data-page-actions");
    expect(root).toHaveAttribute("data-primary-placement", "inline");
    expect(root).not.toHaveAttribute("data-hide-below");
    rerender(<PageActions moreLabel="More" hideBelow="medium" primaryPlacement="external" />);
    expect(root).toHaveAttribute("data-hide-below", "medium");
    expect(root).toHaveAttribute("data-primary-placement", "external");
  });

  it("passes the size to the buttons and the menu button", () => {
    render(
      <PageActions
        moreLabel="More"
        size="sm"
        primary={{ key: "n", label: "New" }}
        secondary={[{ key: "s", label: "Share" }]}
      />,
    );
    expect(screen.getByRole("button", { name: "New" })).toHaveAttribute("data-size", "sm");
    expect(screen.getByRole("button", { name: "Share" })).toHaveAttribute("data-size", "sm");
    expect(screen.getByRole("button", { name: "More" })).toHaveAttribute("data-size", "sm");
  });

  it("defaults to the medium size", () => {
    render(<PageActions moreLabel="More" primary={{ key: "n", label: "New" }} />);
    expect(screen.getByRole("button", { name: "New" })).toHaveAttribute("data-size", "md");
  });

  it("has no axe violations with hints and a disabled hinted action", async () => {
    const { container } = render(
      <PageActions
        moreLabel="More"
        primary={{ key: "n", label: "New", disabled: true, hint: "Record is superseded" }}
        secondary={[{ key: "s", label: "Share", hint: "Shares the link" }]}
        overflow={[{ key: "o", label: "Export", hint: "As CSV" }]}
        hideBelow="medium"
        primaryPlacement="external"
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("keeps hint text out of the accessibility tree while still describing the control", async () => {
    withLayout();
    const user = userEvent.setup();
    render(
      <PageActions
        moreLabel="More"
        primary={{ key: "n", label: "New", hint: "Creates a report" }}
        overflow={[{ key: "o", label: "Export", hint: "As CSV" }]}
      />,
    );
    await user.click(screen.getByRole("button", { name: "More" }));
    for (const text of ["Creates a report", "As CSV"]) {
      const copy = screen.getByText(text, { selector: "[hidden]" });
      expect(copy).not.toBeVisible();
    }
    expect(screen.getByRole("button", { name: "New" })).toHaveAccessibleDescription("Creates a report");
    expect(screen.getByRole("menuitem", { name: "Export" })).toHaveAccessibleDescription("As CSV");
    expect(screen.getByRole("menu").children).toHaveLength(1);
  });

  it("gives hinted menu items distinct descriptions even with awkward or repeated keys", async () => {
    withLayout();
    const user = userEvent.setup();
    render(
      <PageActions
        moreLabel="More"
        overflow={[
          { key: "a b", label: "One", hint: "First hint" },
          { key: "a b", label: "Two", hint: "Second hint" },
        ]}
      />,
    );
    await user.click(screen.getByRole("button", { name: "More" }));
    expect(screen.getByRole("menuitem", { name: "One" })).toHaveAccessibleDescription("First hint");
    expect(screen.getByRole("menuitem", { name: "Two" })).toHaveAccessibleDescription("Second hint");
  });

  it("has no axe violations with the menu open and hinted items", async () => {
    withLayout();
    const user = userEvent.setup();
    const { container } = render(
      <PageActions
        moreLabel="More"
        secondary={[{ key: "s", label: "Share", hint: "Shares the link" }]}
        overflow={[{ key: "o", label: "Export", disabled: true, hint: "Nothing to export" }]}
      />,
    );
    await user.click(screen.getByRole("button", { name: "More" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
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
