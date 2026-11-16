import { readFileSync } from "node:fs";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, type ReactNode } from "react";
import { axe } from "../../test/axe";
import { LufiaProvider, type LinkComponent } from "../LufiaProvider";
import { Pagination } from "../Pagination";
import { SortableTh } from "../SortableTh";
import { Table, TableBody, TableEmpty, TableFoot, TableHead, TableRow, Td, Th } from "./Table";

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

  it("marks a wrapping actions cell and lays its controls in a wrapping row, only with actions", () => {
    render(
      <Table caption="Projects">
        <TableBody>
          <TableRow>
            <Td actions wrap data-testid="wrapping">
              <button type="button">Edit</button>
              <button type="button">Archive</button>
            </Td>
            <Td actions data-testid="plain">
              <button type="button">Edit</button>
            </Td>
            <Td wrap data-testid="not-actions">
              Text
            </Td>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const wrapping = screen.getByTestId("wrapping");
    expect(wrapping).toHaveAttribute("data-wrap");
    expect(wrapping.firstElementChild?.tagName).toBe("DIV");
    expect(within(wrapping).getAllByRole("button")).toHaveLength(2);
    expect(screen.getByTestId("plain")).not.toHaveAttribute("data-wrap");
    expect(screen.getByTestId("plain").firstElementChild?.tagName).toBe("BUTTON");
    expect(screen.getByTestId("not-actions")).not.toHaveAttribute("data-wrap");
  });

  it("has no axe violations", async () => {
    const { container } = render(<Bare />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("row header", () => {
  function WithRowHeader({ rowHeaderProps }: { rowHeaderProps?: Partial<React.ComponentProps<typeof Td>> }) {
    return (
      <Table caption="Projects">
        <TableHead>
          <TableRow>
            <Th>Project</Th>
            <Th numeric>Budget</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow className="highlight" data-testid="row">
            <Td rowHeader primary label="Project" description="PRJ-100" {...rowHeaderProps}>
              Harbour redesign
            </Td>
            <Td label="Budget" numeric>
              <span data-testid="bar" />
            </Td>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  it("renders Td rowHeader as a th scope row that carries the card attributes", () => {
    render(<WithRowHeader />);
    const header = screen.getByRole("rowheader", { name: /Harbour redesign/ });
    expect(header.tagName).toBe("TH");
    expect(header).toHaveAttribute("scope", "row");
    expect(header).toHaveAttribute("data-primary");
    expect(header).toHaveAttribute("data-label", "Project");
    expect(screen.getAllByRole("columnheader")).toHaveLength(2);
    expect(screen.getAllByRole("cell")).toHaveLength(1);
  });

  it("keeps numeric, className, description and the row link working on a row header", () => {
    render(<WithRowHeader rowHeaderProps={{ numeric: true, className: "mine", href: "/p/1" }} />);
    const header = screen.getByRole("rowheader");
    expect(header).toHaveClass("mine");
    expect(header).toHaveAttribute("data-numeric");
    expect(within(header).getByRole("link")).toHaveAttribute("href", "/p/1");
    expect(within(header).getByText("PRJ-100")).toBeInTheDocument();
  });

  it("leaves a plain Td as a td without scope", () => {
    render(<WithRowHeader />);
    const cell = screen.getByRole("cell");
    expect(cell.tagName).toBe("TD");
    expect(cell).not.toHaveAttribute("scope");
  });

  it("hosts a row className and non-text cell content", () => {
    render(<WithRowHeader />);
    expect(screen.getByTestId("row")).toHaveClass("highlight");
    expect(screen.getByRole("cell")).toContainElement(screen.getByTestId("bar"));
  });

  it("has no axe violations", async () => {
    const { container } = render(<WithRowHeader />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("row ref and style", () => {
  it("hands the <tr> to ref and passes style and data attributes through", () => {
    const ref = createRef<HTMLTableRowElement>();
    render(
      <Table caption="Projects">
        <TableBody>
          <TableRow
            ref={ref}
            style={{ transform: "translateY(4px)", transition: "transform 150ms" }}
            data-id="7"
          >
            <Td>One</Td>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(ref.current).toBeInstanceOf(HTMLTableRowElement);
    expect(ref.current).toBe(screen.getByRole("row"));
    expect(ref.current).toHaveStyle({ transform: "translateY(4px)" });
    expect(ref.current).toHaveAttribute("data-id", "7");
  });

  it("hands the section and cell elements to ref", () => {
    const head = createRef<HTMLTableSectionElement>();
    const body = createRef<HTMLTableSectionElement>();
    const th = createRef<HTMLTableCellElement>();
    const td = createRef<HTMLTableCellElement>();
    render(
      <Table caption="Projects">
        <TableHead ref={head}>
          <TableRow>
            <Th ref={th}>Name</Th>
          </TableRow>
        </TableHead>
        <TableBody ref={body}>
          <TableRow>
            <Td ref={td}>One</Td>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(head.current?.tagName).toBe("THEAD");
    expect(body.current?.tagName).toBe("TBODY");
    expect(th.current?.tagName).toBe("TH");
    expect(td.current?.tagName).toBe("TD");
  });
});

describe("disabled row control", () => {
  function Disabled({ onActivate, href }: { onActivate?: () => void; href?: string }) {
    return (
      <Table caption="Projects">
        <TableBody>
          <TableRow>
            <Td
              primary
              activateDisabled
              href={href}
              onActivate={onActivate}
              activateLabel="Open Harbour redesign"
            >
              Harbour redesign
            </Td>
            <Td>Active</Td>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  it("keeps the button focusable, marks it aria-disabled and ignores activation", async () => {
    const onActivate = vi.fn();
    render(<Disabled onActivate={onActivate} />);
    const button = screen.getByRole("button", { name: "Open Harbour redesign" });
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).not.toBeDisabled();
    await userEvent.click(button);
    button.focus();
    await userEvent.keyboard("{Enter} ");
    expect(button).toHaveFocus();
    expect(onActivate).not.toHaveBeenCalled();
  });

  it("renders the link form without an href, so it cannot be followed", async () => {
    const onActivate = vi.fn();
    render(<Disabled href="/projects/1" onActivate={onActivate} />);
    const link = screen.getByRole("link", { name: "Open Harbour redesign" });
    expect(link).not.toHaveAttribute("href");
    expect(link).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(link);
    expect(onActivate).not.toHaveBeenCalled();
  });

  it("does nothing without href or onActivate", () => {
    render(
      <Table caption="Projects">
        <TableBody>
          <TableRow>
            <Td activateDisabled>Plain</Td>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it.each([
    ["button", { onActivate: () => {} }],
    ["link", { href: "/projects/1" }],
  ])("has no axe violations as a %s", async (_name, props) => {
    const { container } = render(<Disabled {...props} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("grouped bodies", () => {
  function Grouped({ responsive }: { responsive?: "cards" | "scroll" }) {
    return (
      <Table caption="Projects" responsive={responsive}>
        <TableHead>
          <TableRow>
            <Th>Project</Th>
            <Th>Status</Th>
          </TableRow>
        </TableHead>
        {["Active", "On hold"].map((group) => (
          <TableBody key={group}>
            <TableRow group>
              <Th scope="colgroup" colSpan={2}>
                {group}
              </Th>
            </TableRow>
            <TableRow>
              <Td primary>{group} project</Td>
              <Td label="Status">{group}</Td>
            </TableRow>
          </TableBody>
        ))}
      </Table>
    );
  }

  it.each(["cards", "scroll"] as const)(
    "holds several bodies and spanning group headers in %s mode",
    (mode) => {
      const { container } = render(<Grouped responsive={mode} />);
      expect(container.querySelectorAll("tbody")).toHaveLength(2);
      const groups = container.querySelectorAll("tr[data-group]");
      expect(groups).toHaveLength(2);
      const header = within(groups[0] as HTMLElement).getByRole("columnheader", { name: "Active" });
      expect(header).toHaveAttribute("scope", "colgroup");
      expect(header).toHaveAttribute("colspan", "2");
      expect(container.querySelector("[data-responsive]")).toHaveAttribute("data-responsive", mode);
    },
  );

  it("passes colSpan and rowSpan to cells and gives a rowgroup header the rowheader role", () => {
    render(
      <Table caption="Projects">
        <TableBody>
          <TableRow>
            <Th scope="rowgroup" rowSpan={2}>
              Group
            </Th>
            <Td colSpan={2}>Wide</Td>
          </TableRow>
          <TableRow>
            <Td>A</Td>
            <Td>B</Td>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const header = screen.getByRole("rowheader", { name: "Group" });
    expect(header).toHaveAttribute("rowspan", "2");
    expect(screen.getByRole("cell", { name: "Wide" })).toHaveAttribute("colspan", "2");
  });

  it.each(["cards", "scroll"] as const)("has no axe violations in %s mode", async (mode) => {
    const { container } = render(<Grouped responsive={mode} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("TableFoot", () => {
  function WithTotal({
    responsive,
    caption = "Budget",
  }: {
    responsive?: "cards" | "scroll";
    caption?: string;
  }) {
    return (
      <Table caption={caption} responsive={responsive}>
        <TableHead>
          <TableRow>
            <Th>Project</Th>
            <Th numeric>Budget</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <Td rowHeader primary label="Project">
              Harbour redesign
            </Td>
            <Td label="Budget" numeric>
              12,400
            </Td>
          </TableRow>
        </TableBody>
        <TableFoot data-testid="foot">
          <TableRow>
            <Td rowHeader label="Project">
              Total
            </Td>
            <Td label="Budget" numeric>
              12,400
            </Td>
          </TableRow>
        </TableFoot>
      </Table>
    );
  }

  it("renders a tfoot row group whose row header and numeric cells keep their semantics", () => {
    render(<WithTotal />);
    const foot = screen.getByTestId("foot");
    expect(foot.tagName).toBe("TFOOT");
    expect(foot).toHaveAttribute("role", "rowgroup");
    const total = within(foot).getByRole("rowheader", { name: "Total" });
    expect(total.tagName).toBe("TH");
    expect(total).toHaveAttribute("scope", "row");
    const cell = within(foot).getByRole("cell", { name: "12,400" });
    expect(cell).toHaveAttribute("data-numeric");
    expect(cell).toHaveAttribute("data-label", "Budget");
  });

  it("passes ref, style and className to the tfoot", () => {
    const ref = createRef<HTMLTableSectionElement>();
    render(
      <Table caption="Budget">
        <TableFoot ref={ref} className="extra" style={{ color: "red" }}>
          <TableRow>
            <Td rowHeader>Total</Td>
          </TableRow>
        </TableFoot>
      </Table>,
    );
    expect(ref.current?.tagName).toBe("TFOOT");
    expect(ref.current).toHaveClass("extra");
    expect(ref.current).toHaveStyle({ color: "rgb(255, 0, 0)" });
  });

  it("has no axe violations in cards and scroll mode", async () => {
    const { container } = render(
      <>
        <WithTotal />
        <WithTotal responsive="scroll" caption="Budget, scrolling" />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Table card layout controls", () => {
  function CardControls({ cardLayout }: { cardLayout?: "stack" | "grid" }) {
    return (
      <Table caption="Projects" cardLayout={cardLayout}>
        <TableHead>
          <TableRow>
            <Th hideInCards>Company</Th>
            <Th>Status</Th>
            <Th>Project</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <Td label="Company" hideInCards data-testid="company">
              Northwind
            </Td>
            <Td
              label="Status"
              stretch
              cardSpan="full"
              cardOrder={2.7}
              style={{ color: "red" }}
              data-testid="status"
            >
              Active
            </Td>
            <Td primary label="Project" data-testid="title">
              Harbour redesign
            </Td>
            <Td cardSlot="corner" data-testid="corner">
              <button type="button">More</button>
            </Td>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  it("marks the table with the card layout, stack by default", () => {
    const { rerender } = render(<CardControls />);
    expect(screen.getByRole("region").parentElement?.parentElement).toHaveAttribute(
      "data-card-layout",
      "stack",
    );
    rerender(<CardControls cardLayout="grid" />);
    expect(screen.getByRole("region").parentElement?.parentElement).toHaveAttribute(
      "data-card-layout",
      "grid",
    );
  });

  it("exposes the per-cell controls as data attributes and keeps them in the accessibility tree", () => {
    render(<CardControls />);
    const status = screen.getByTestId("status");
    expect(status).toHaveAttribute("data-stretch");
    expect(status).toHaveAttribute("data-card-span", "full");
    expect(screen.getByTestId("corner")).toHaveAttribute("data-card-slot", "corner");
    expect(screen.getByTestId("company")).toHaveAttribute("data-hide-in-cards");
    expect(screen.getByRole("columnheader", { name: "Company", hidden: true })).toHaveAttribute(
      "data-hide-in-cards",
    );
    expect(screen.getByTestId("company")).toBeInTheDocument();
  });

  it("maps cardOrder to a whole-number custom property and keeps the caller's style", () => {
    render(<CardControls />);
    const status = screen.getByTestId("status");
    expect(status.style.getPropertyValue("--table-card-order")).toBe("2");
    expect(status).toHaveStyle({ color: "rgb(255, 0, 0)" });
    expect(screen.getByTestId("title").style.getPropertyValue("--table-card-order")).toBe("");
  });

  it("leaves every control off by default", () => {
    render(<Sample />);
    const cell = screen.getByRole("cell", { name: "Active" });
    for (const name of ["data-stretch", "data-card-span", "data-card-slot", "data-hide-in-cards"]) {
      expect(cell).not.toHaveAttribute(name);
    }
  });

  it("has no axe violations", async () => {
    const { container } = render(<CardControls cardLayout="grid" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Th wrap and abbr", () => {
  function Headers() {
    return (
      <Table caption="Orders">
        <TableHead>
          <TableRow>
            <Th wrap>Quantity ordered</Th>
            <Th abbr="Qty" wrap numeric>
              Quantity ordered
            </Th>
            <SortableTh label="Delivery date" abbr="Due" wrap active dir="asc" onSort={() => {}} />
            <Th>Status</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <Td label="Quantity ordered">1</Td>
            <Td label="Quantity ordered">2</Td>
            <Td label="Delivery date">Today</Td>
            <Td label="Status">Open</Td>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  it("marks a wrapping header and leaves the others alone", () => {
    render(<Headers />);
    expect(screen.getAllByRole("columnheader")[0]).toHaveAttribute("data-wrap");
    expect(screen.getByRole("columnheader", { name: "Status" })).not.toHaveAttribute("data-wrap");
    expect(screen.getByRole("columnheader", { name: "Status" })).not.toHaveAttribute("abbr");
  });

  it("shows the short text, names the header by the full text and keeps the native abbr attribute", () => {
    render(<Headers />);
    const header = screen.getAllByRole("columnheader")[1]!;
    expect(header).toHaveAccessibleName("Quantity ordered");
    expect(header).toHaveAttribute("abbr", "Qty");
    const short = header.querySelector("[data-th-short]")!;
    expect(short).toHaveTextContent("Qty");
    expect(short).toHaveAttribute("aria-hidden", "true");
    expect(short).toHaveAttribute("title", "Quantity ordered");
    expect(header.querySelector("[data-th-full]")).toHaveTextContent("Quantity ordered");
  });

  it("does not touch a header without abbr", () => {
    render(<Headers />);
    expect(
      screen.getAllByRole("columnheader")[0]!.querySelector("[data-th-short], [data-th-full]"),
    ).toBeNull();
  });

  it("works on a sortable header: the button keeps the full name and still sorts", async () => {
    const onSort = vi.fn();
    render(
      <table>
        <thead>
          <tr>
            <SortableTh label="Delivery date" abbr="Due" wrap active={false} dir="asc" onSort={onSort} />
          </tr>
        </thead>
      </table>,
    );
    const button = screen.getByRole("button", { name: "Delivery date" });
    expect(button).toHaveTextContent("Due");
    expect(button.closest("th")).toHaveAttribute("data-wrap");
    expect(button.closest("th")).toHaveAttribute("abbr", "Due");
    await userEvent.click(button);
    expect(onSort).toHaveBeenCalledTimes(1);
  });

  it("has no axe violations", async () => {
    const { container } = render(<Headers />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Table style hooks", () => {
  const css = readFileSync("src/components/Table/Table.module.css", "utf8");

  it("sets the caption tone as data-tone, default first", () => {
    const { container, rerender } = render(
      <Table caption="Projects" showCaption>
        <TableBody />
      </Table>,
    );
    expect(container.querySelector("caption")).toHaveAttribute("data-tone", "default");
    rerender(
      <Table caption="Projects" showCaption captionTone="muted">
        <TableBody />
      </Table>,
    );
    expect(container.querySelector("caption")).toHaveAttribute("data-tone", "muted");
  });

  it.each([
    [
      "header typography",
      /th:not\(\[scope="row"\]\)\s*\{[^}]*font-family: var\(--lufia-table-header-font-family, var\(--lufia-font-family-mono\)\)[^}]*text-transform: var\(--lufia-table-header-text-transform, uppercase\)/,
    ],
    [
      "card label typography",
      /::before\s*\{[^}]*font-family: var\(--lufia-table-header-font-family[^}]*letter-spacing: var\(--lufia-table-header-letter-spacing, 0.06em\)/,
    ],
    [
      "caption colour",
      /\.caption\[data-visible\]\s*\{[^}]*color: var\(--lufia-table-caption-color, var\(--lufia-color-text-default\)\)/,
    ],
    ["cell vertical align", /vertical-align: var\(--lufia-table-cell-vertical-align, middle\)/],
    ["cell colour", /color: var\(--lufia-table-cell-color, inherit\)/],
    ["primary colour", /color: var\(--lufia-table-primary-color, var\(--lufia-color-text-default\)\)/],
  ])("reads the %s hook with today's value as the fallback", (_name, pattern) => {
    expect(css).toMatch(pattern);
  });

  it("keeps the scroll edges behind the scroll-timeline support query, off by default only there", () => {
    expect(css).toMatch(/--table-cover-size: 2rem;[^}]*--table-shadow-size: 0\.75rem;/);
    expect(css).toMatch(
      /@supports \(animation-timeline: scroll\(self inline\)\)\s*\{\s*\.scroller\s*\{[^}]*--table-cover-size: 0px;[^}]*animation-timeline: scroll\(self inline\)/,
    );
  });
});
