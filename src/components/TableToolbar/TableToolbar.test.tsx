import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { TableToolbar } from "./TableToolbar";

const filters = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
];

describe("TableToolbar", () => {
  it("exposes filters as toggle buttons and reports changes", async () => {
    const onFilterChange = vi.fn();
    const user = userEvent.setup();
    render(<TableToolbar filters={filters} activeFilter="all" onFilterChange={onFilterChange} />);
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Open" })).toHaveAttribute("aria-pressed", "false");
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(onFilterChange).toHaveBeenCalledWith("open");
  });

  it("renders the search field only when a handler is provided", () => {
    const { rerender } = render(<TableToolbar filters={filters} />);
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    rerender(<TableToolbar onSearchChange={() => {}} searchPlaceholder="Search items" />);
    expect(screen.getByRole("searchbox", { name: "Search items" })).toBeInTheDocument();
  });

  it("reports typing and clears through a labelled button", async () => {
    const onSearchChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TableToolbar
        search="abc"
        onSearchChange={onSearchChange}
        searchPlaceholder="Search"
        clearSearchLabel="Clear"
      />,
    );
    await user.type(screen.getByRole("searchbox"), "d");
    expect(onSearchChange).toHaveBeenLastCalledWith("abcd");
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(onSearchChange).toHaveBeenLastCalledWith("");
  });

  it("hides the clear button while the field is empty", () => {
    render(<TableToolbar search="" onSearchChange={() => {}} searchPlaceholder="Search" />);
    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();
  });

  it("renders extra children between chips and search", () => {
    render(
      <TableToolbar filters={filters} onSearchChange={() => {}} searchPlaceholder="Search">
        <select aria-label="Owner" />
      </TableToolbar>,
    );
    expect(screen.getByRole("combobox", { name: "Owner" })).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <TableToolbar
        filters={filters}
        activeFilter="open"
        search="x"
        onSearchChange={() => {}}
        searchPlaceholder="Search"
        clearSearchLabel="Clear"
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
