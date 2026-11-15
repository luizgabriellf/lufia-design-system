import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { axe } from "../../test/axe";
import { LufiaProvider, type LinkComponent } from "../LufiaProvider";
import { Pagination } from "../Pagination";
import { SortableTh } from "../SortableTh";
import { Table, TableBody, TableEmpty, TableHead, TableRow, Td, Th } from "./Table";

function Sample({
  rowProps,
  onEdit = () => {},
  caption = "Projects",
  children,
}: {
  caption?: string;
  rowProps?: Partial<React.ComponentProps<typeof Td>>;
  onEdit?: () => void;
  children?: ReactNode;
}) {
  return (
    <Table caption={caption} footer={children}>
      <TableHead>
        <TableRow>
          <Th>Project</Th>
          <Th>Status</Th>
          <Th numeric>Budget</Th>
          <Th>
            <span className="sr-only">Actions</span>
          </Th>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <Td primary label="Project" {...rowProps}>
            Harbour redesign
          </Td>
          <Td label="Status">Active</Td>
          <Td label="Budget" numeric>
            12,400
          </Td>
          <Td actions>
            <button type="button" onClick={onEdit}>
              Edit
            </button>
            <a href="#archive">Archive</a>
          </Td>
        </TableRow>
      </TableBody>
    </Table>
  );
}

describe("Table", () => {
  it("is a table named by its caption, inside a named, focusable scroll region", () => {
    render(<Sample />);
    expect(screen.getByRole("table", { name: "Projects" })).toBeInTheDocument();
    const region = screen.getByRole("region", { name: "Projects" });
    expect(region).toHaveAttribute("tabindex", "0");
    expect(within(region).getByRole("table")).toBeInTheDocument();
  });

  it("keeps the table semantics explicit for card mode", () => {
    render(<Sample />);
    expect(screen.getAllByRole("rowgroup")).toHaveLength(2);
    expect(screen.getAllByRole("row")).toHaveLength(2);
    expect(screen.getAllByRole("columnheader")).toHaveLength(4);
    expect(screen.getAllByRole("cell")).toHaveLength(4);
  });

  it("hides the caption visually unless asked, and shows it with showCaption", () => {
    const { rerender, container } = render(<Sample />);
    expect(container.querySelector("caption")).not.toHaveAttribute("data-visible");
    rerender(
      <Table caption="Projects" showCaption>
        <TableBody />
      </Table>,
    );
    expect(container.querySelector("caption")).toHaveAttribute("data-visible");
  });

  it("defaults to cards and comfortable, and reports the chosen mode and density", () => {
    const { container, rerender } = render(<Sample />);
    expect(container.firstElementChild).toHaveAttribute("data-responsive", "cards");
    expect(container.firstElementChild).toHaveAttribute("data-density", "comfortable");
    rerender(
      <Table caption="Projects" responsive="scroll" density="compact">
        <TableBody />
      </Table>,
    );
    expect(container.firstElementChild).toHaveAttribute("data-responsive", "scroll");
    expect(container.firstElementChild).toHaveAttribute("data-density", "compact");
  });

  it("passes className and rest props to the wrapper and tableClassName to the table", () => {
    const { container } = render(
      <Table caption="Projects" className="outer" tableClassName="inner" data-testid="t">
        <TableBody />
      </Table>,
    );
    expect(container.firstElementChild).toHaveClass("outer");
    expect(container.firstElementChild).toHaveAttribute("data-testid", "t");
    expect(screen.getByRole("table")).toHaveClass("inner");
  });

  it("gives every labelled cell its column label for card mode", () => {
    render(<Sample />);
    const cells = screen.getAllByRole("cell");
    expect(cells.map((cell) => cell.getAttribute("data-label"))).toEqual([
      "Project",
      "Status",
      "Budget",
      null,
    ]);
    expect(cells[0]).toHaveAttribute("data-primary");
    expect(cells[2]).toHaveAttribute("data-numeric");
    expect(cells[3]).toHaveAttribute("data-actions");
  });

  it("marks numeric headers and defaults a header to scope col", () => {
    render(<Sample />);
    const headers = screen.getAllByRole("columnheader");
    expect(headers.every((header) => header.getAttribute("scope") === "col")).toBe(true);
    expect(headers[2]).toHaveAttribute("data-numeric");
  });

  it("makes a scope=row header a row header", () => {
    render(
      <Table caption="Projects">
        <TableBody>
          <TableRow>
            <Th scope="row">Harbour</Th>
            <Td>1</Td>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByRole("rowheader", { name: "Harbour" })).toBeInTheDocument();
  });

  it("hosts the footer outside the scrolling region", () => {
    render(
      <Sample>
        <Pagination
          page={1}
          totalPages={3}
          onPageChange={() => {}}
          variant="compact"
          labels={{
            nav: "Pages",
            previous: "Previous",
            next: "Next",
            page: (page) => `Page ${page}`,
            summary: (page, total) => `Page ${page} of ${total}`,
          }}
        />
      </Sample>,
    );
    const nav = screen.getByRole("navigation", { name: "Pages" });
    expect(screen.getByRole("region", { name: "Projects" })).not.toContainElement(nav);
  });

  it("renders SortableTh in the header row and keeps aria-sort", async () => {
    const onSort = vi.fn();
    const user = userEvent.setup();
    render(
      <Table caption="Projects">
        <TableHead>
          <TableRow>
            <SortableTh label="Project" active dir="asc" onSort={onSort} />
            <Th>Status</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <Td>A</Td>
            <Td>B</Td>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getAllByRole("columnheader")[0]).toHaveAttribute("aria-sort", "ascending");
    await user.click(screen.getByRole("button", { name: "Project" }));
    expect(onSort).toHaveBeenCalledTimes(1);
  });

  it("has no axe violations in cards and scroll mode, compact, with a visible caption and a footer", async () => {
    const { container } = render(
      <div>
        <Sample />
        <Table caption="Invoices" responsive="scroll" density="compact" showCaption footer={<p>Footer</p>}>
          <TableHead>
            <TableRow>
              <SortableTh label="Number" active dir="desc" onSort={() => {}} />
              <Th numeric>Total</Th>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <Td href="/invoices/1" primary>
                INV-0001
              </Td>
              <Td numeric>90.00</Td>
            </TableRow>
          </TableBody>
        </Table>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Table row activation", () => {
  it("makes the primary cell a real link and gives the row no handler of its own", () => {
    render(<Sample rowProps={{ href: "/projects/1" }} />);
    const link = screen.getByRole("link", { name: "Harbour redesign" });
    expect(link).toHaveAttribute("href", "/projects/1");
    expect(link.closest("td")).toHaveAttribute("data-primary");
    const row = link.closest("tr")!;
    expect(row).not.toHaveAttribute("tabindex");
    expect(row).not.toHaveAttribute("onclick");
  });

  it("renders the link through the linkComponent of LufiaProvider", () => {
    const Routed: LinkComponent = ({ children, ...props }) => (
      <a data-routed="" {...props}>
        {children}
      </a>
    );
    render(
      <LufiaProvider linkComponent={Routed}>
        <Sample rowProps={{ href: "/projects/1" }} />
      </LufiaProvider>,
    );
    expect(screen.getByRole("link", { name: "Harbour redesign" })).toHaveAttribute("data-routed");
  });

  it("calls onActivate from the link click, with Enter, and not from a button in the actions cell", async () => {
    const onActivate = vi.fn((event: React.MouseEvent) => event.preventDefault());
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(<Sample rowProps={{ href: "/projects/1", onActivate }} onEdit={onEdit} />);

    await user.click(screen.getByRole("link", { name: "Harbour redesign" }));
    expect(onActivate).toHaveBeenCalledTimes(1);

    screen.getByRole("link", { name: "Harbour redesign" }).focus();
    await user.keyboard("{Enter}");
    expect(onActivate).toHaveBeenCalledTimes(2);

    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.click(screen.getByRole("link", { name: "Archive" }));
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onActivate).toHaveBeenCalledTimes(2);
  });

  it("makes the cell a real button with onActivate alone, and Enter and Space both activate it", async () => {
    const onActivate = vi.fn();
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(<Sample rowProps={{ onActivate }} onEdit={onEdit} />);
    const button = screen.getByRole("button", { name: "Harbour redesign" });
    expect(button).toHaveAttribute("type", "button");

    button.focus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onActivate).toHaveBeenCalledTimes(2);

    await user.click(screen.getByRole("button", { name: "Edit" }));
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onActivate).toHaveBeenCalledTimes(2);
  });

  it("puts one stop for the row and one for each control of the actions cell in the tab order", async () => {
    const user = userEvent.setup();
    render(<Sample rowProps={{ href: "/projects/1" }} />);
    await user.tab(); // the scroll region
    expect(screen.getByRole("region", { name: "Projects" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: "Harbour redesign" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Edit" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: "Archive" })).toHaveFocus();
  });

  it("leaves a cell without href or onActivate as plain content", () => {
    render(<Sample />);
    expect(screen.queryByRole("link", { name: "Harbour redesign" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("cell")[0]).toHaveTextContent("Harbour redesign");
  });

  it("has no axe violations for a link row and a button row", async () => {
    const { container } = render(
      <div>
        <Sample rowProps={{ href: "/projects/1" }} />
        <Sample caption="Archived projects" rowProps={{ onActivate: () => {} }} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("TableEmpty", () => {
  function Empty() {
    return (
      <Table caption="Projects">
        <TableHead>
          <TableRow>
            <Th>Project</Th>
            <Th>Status</Th>
            <Th>Budget</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableEmpty
            colSpan={3}
            title="No projects yet"
            body="Create a project to see it here."
            action={<button type="button">New project</button>}
          />
        </TableBody>
      </Table>
    );
  }

  it("is one full-width row hosting an EmptyState", () => {
    render(<Empty />);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("No projects yet");
    const cell = status.closest("td")!;
    expect(cell).toHaveAttribute("colspan", "3");
    expect(cell.closest("tbody")).not.toBeNull();
    expect(cell.closest("tr")!.children).toHaveLength(1);
    expect(screen.getByRole("button", { name: "New project" })).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<Empty />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Table frame", () => {
  it("defaults to framed and reports flush on the wrapper", () => {
    const { container, rerender } = render(<Sample />);
    expect(container.firstElementChild).toHaveAttribute("data-frame", "framed");
    rerender(
      <Table caption="Projects" frame="flush">
        <TableBody />
      </Table>,
    );
    expect(container.firstElementChild).toHaveAttribute("data-frame", "flush");
  });

  it("has no axe violations when flush", async () => {
    const { container } = render(
      <Table caption="Projects" frame="flush">
        <TableBody>
          <TableRow>
            <Td>One</Td>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Td row control extras", () => {
  it("names the link and the button with activateLabel and describes them with activateDescribedBy", () => {
    const { rerender } = render(
      <div>
        <p id="hint">Opens the detail page</p>
        <Sample
          rowProps={{ href: "/p/1", activateLabel: "Open details of Harbour", activateDescribedBy: "hint" }}
        />
      </div>,
    );
    const link = screen.getByRole("link", { name: "Open details of Harbour" });
    expect(link).toHaveAccessibleDescription("Opens the detail page");
    rerender(
      <div>
        <p id="hint">Opens the detail page</p>
        <Sample
          rowProps={{
            onActivate: () => {},
            activateLabel: "Open details of Harbour",
            activateDescribedBy: "hint",
          }}
        />
      </div>,
    );
    const button = screen.getByRole("button", { name: "Open details of Harbour" });
    expect(button).toHaveAccessibleDescription("Opens the detail page");
  });

  it("puts the after slot in the same cell but outside the control, in DOM order", async () => {
    const user = userEvent.setup();
    render(
      <Sample
        rowProps={{
          href: "/p/1",
          after: <a href="mailto:owner@example.com">Email the owner</a>,
        }}
      />,
    );
    const control = screen.getByRole("link", { name: "Harbour redesign" });
    const secondary = screen.getByRole("link", { name: "Email the owner" });
    expect(control).not.toContainElement(secondary);
    expect(secondary.closest("td")).toBe(control.closest("td"));
    expect(control.compareDocumentPosition(secondary) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(secondary.closest("a:has(a), button:has(a)")).toBeNull();
    await user.tab(); // the scroll region
    await user.tab();
    expect(control).toHaveFocus();
    await user.tab();
    expect(secondary).toHaveFocus();
  });

  it("renders the description inside the control, so it is part of the name without activateLabel", () => {
    render(<Sample rowProps={{ href: "/p/1", description: "Branding and web" }} />);
    const link = screen.getByRole("link", { name: /^Harbour redesign\s*Branding and web$/ });
    expect(link).toContainElement(screen.getByText("Branding and web"));
  });

  it("keeps the description out of the name when activateLabel is set", () => {
    render(
      <Sample rowProps={{ href: "/p/1", description: "Branding and web", activateLabel: "Open Harbour" }} />,
    );
    expect(screen.getByRole("link", { name: "Open Harbour" })).toBeInTheDocument();
  });

  it("renders the description in a plain cell", () => {
    render(<Sample rowProps={{ description: "Branding and web" }} />);
    expect(screen.getAllByRole("cell")[0]).toHaveTextContent("Harbour redesignBranding and web");
  });

  it("has no axe violations with a label, a description and an after slot", async () => {
    const { container } = render(
      <div>
        <Sample
          rowProps={{
            href: "/p/1",
            activateLabel: "Open details of Harbour redesign",
            after: <a href="mailto:owner@example.com">Email the owner</a>,
          }}
        />
        <Sample
          caption="Archived projects"
          rowProps={{ onActivate: () => {}, description: "Branding", after: <a href="#x">More</a> }}
        />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Th actions", () => {
  it("renders a header named by its hidden label and marks it as the actions column", () => {
    render(
      <Table caption="Projects">
        <TableHead>
          <TableRow>
            <Th>Project</Th>
            <Th actions label="Actions" />
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <Td>One</Td>
            <Td actions>
              <button type="button">Edit</button>
            </Td>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const header = screen.getByRole("columnheader", { name: "Actions" });
    expect(header).toHaveAttribute("data-actions");
    expect(header).not.toHaveAttribute("aria-label");
    expect(header).toHaveTextContent("Actions");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <Table caption="Projects">
        <TableHead>
          <TableRow>
            <Th>Project</Th>
            <Th actions label="Actions" />
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <Td>One</Td>
            <Td actions>
              <button type="button">Edit</button>
            </Td>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("requires label when actions is set", () => {
    // @ts-expect-error label is required with actions
    const missing = <Th actions />;
    expect(missing).toBeTruthy();
  });
});

describe("TableRow state", () => {
  function Rows() {
    return (
      <Table caption="Projects">
        <TableBody>
          <TableRow selected current>
            <Td>Selected and current</Td>
          </TableRow>
          <TableRow selected={false}>
            <Td>Unselected</Td>
          </TableRow>
          <TableRow>
            <Td>Plain</Td>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  it("sets aria-selected and aria-current and the matching data attributes", () => {
    render(<Rows />);
    const [first, second, third] = screen.getAllByRole("row");
    expect(first).toHaveAttribute("aria-selected", "true");
    expect(first).toHaveAttribute("aria-current", "true");
    expect(first).toHaveAttribute("data-selected");
    expect(first).toHaveAttribute("data-current");
    expect(second).toHaveAttribute("aria-selected", "false");
    expect(second).not.toHaveAttribute("data-selected");
    expect(third).not.toHaveAttribute("aria-selected");
    expect(third).not.toHaveAttribute("aria-current");
  });

  it("has no axe violations", async () => {
    const { container } = render(<Rows />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("TableEmpty without a title", () => {
  function Bare() {
    return (
      <Table caption="Projects">
        <TableBody>
          <TableEmpty colSpan={3}>Nothing matches the filter.</TableEmpty>
        </TableBody>
      </Table>
    );
  }

  it("renders one full-width cell with a single message line and no EmptyState", () => {
    render(<Bare />);
    const message = screen.getByText("Nothing matches the filter.");
    expect(message.tagName).toBe("P");
    const cell = message.closest("td")!;
    expect(cell).toHaveAttribute("colspan", "3");
    expect(cell.closest("tr")!.children).toHaveLength(1);
    expect(cell.querySelector("p")).toBe(message);
    expect(cell.querySelectorAll("p")).toHaveLength(1);
  });

  it("keeps the titled form unchanged", () => {
    render(
      <Table caption="Projects">
        <TableBody>
          <TableEmpty colSpan={3} title="No projects" body="Create one." />
        </TableBody>
      </Table>,
    );
    expect(screen.getByText("No projects")).toBeInTheDocument();
    expect(screen.getByText("Create one.")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<Bare />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
