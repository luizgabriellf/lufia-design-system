import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { SortableTh } from "./SortableTh";

function renderInTable(ui: React.ReactNode) {
  return render(
    <table>
      <thead>
        <tr>{ui}</tr>
      </thead>
      <tbody>
        <tr>
          <td>Row</td>
        </tr>
      </tbody>
    </table>,
  );
}

describe("SortableTh", () => {
  it("reports aria-sort on the th", () => {
    renderInTable(
      <>
        <SortableTh label="Name" active dir="asc" onSort={() => {}} />
        <SortableTh label="Date" active dir="desc" onSort={() => {}} />
        <SortableTh label="Role" active={false} dir="asc" onSort={() => {}} />
      </>,
    );
    const headers = screen.getAllByRole("columnheader");
    expect(headers.map((h) => h.getAttribute("aria-sort"))).toEqual(["ascending", "descending", "none"]);
  });

  it("activates with mouse, Enter and Space", async () => {
    const onSort = vi.fn();
    const user = userEvent.setup();
    renderInTable(<SortableTh label="Name" active={false} dir="asc" onSort={onSort} />);
    const button = screen.getByRole("button", { name: "Name" });
    await user.click(button);
    button.focus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onSort).toHaveBeenCalledTimes(3);
  });

  it("keeps the direction arrow out of the accessible name", () => {
    renderInTable(<SortableTh label="Name" active dir="desc" onSort={() => {}} />);
    expect(screen.getByRole("button", { name: "Name" })).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = renderInTable(<SortableTh label="Name" active dir="asc" onSort={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
