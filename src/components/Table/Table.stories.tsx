import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Badge, type BadgeTone } from "../Badge";
import { Button } from "../Button";
import { PlusIcon } from "../Icon/icons";
import { ProgressBar } from "../ProgressBar";
import { Pagination, type PaginationLabels } from "../Pagination";
import { SortableTh, type SortDirection } from "../SortableTh";
import { Table, TableBody, TableEmpty, TableFoot, TableHead, TableRow, Td, Th } from "./Table";

type Project = { id: number; name: string; owner: string; status: string; tone: BadgeTone; budget: number };

const projects: Project[] = [
  {
    id: 1,
    name: "Harbour redesign",
    owner: "Amira Okafor",
    status: "Active",
    tone: "success",
    budget: 12400,
  },
  { id: 2, name: "Mobile onboarding", owner: "Jonas Weber", status: "In review", tone: "info", budget: 8800 },
  { id: 3, name: "Billing migration", owner: "Priya Nair", status: "Blocked", tone: "danger", budget: 31250 },
  { id: 4, name: "Quarterly report", owner: "Lena Fischer", status: "Draft", tone: "neutral", budget: 1900 },
  { id: 5, name: "Partner portal", owner: "Mateo Silva", status: "Active", tone: "success", budget: 20500 },
];

const money = new Intl.NumberFormat("en", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const labels: PaginationLabels = {
  nav: "Projects pagination",
  previous: "Previous",
  next: "Next",
  page: (page) => `Page ${page}`,
  summary: (page, totalPages, total) => `Page ${page} of ${totalPages}${total ? ` · ${total} projects` : ""}`,
};

type Row = Partial<{ href: (project: Project) => string; onActivate: (project: Project) => void }>;

function Rows({ rows = projects, href, onActivate }: Row & { rows?: Project[] }) {
  return (
    <TableBody>
      {rows.map((project) => (
        <TableRow key={project.id}>
          <Td
            primary
            label="Project"
            href={href?.(project)}
            onActivate={onActivate ? () => onActivate(project) : undefined}
          >
            {project.name}
          </Td>
          <Td label="Owner">{project.owner}</Td>
          <Td label="Status">
            <Badge tone={project.tone} dot wrap>
              {project.status}
            </Badge>
          </Td>
          <Td label="Budget" numeric>
            {money.format(project.budget)}
          </Td>
          <Td actions>
            <Button size="sm" variant="secondary">
              Edit
            </Button>
            <Button size="sm" variant="secondary">
              Archive
            </Button>
          </Td>
        </TableRow>
      ))}
    </TableBody>
  );
}

function Header() {
  return (
    <TableHead>
      <TableRow>
        <Th>Project</Th>
        <Th>Owner</Th>
        <Th>Status</Th>
        <Th numeric>Budget</Th>
        <Th actions label="Actions" />
      </TableRow>
    </TableHead>
  );
}

const meta = {
  title: "Components/Data display/Table",
  component: Table,
  parameters: { layout: "padded" },
  args: { caption: "Projects", children: null },
  argTypes: {
    responsive: { control: "inline-radio", options: ["cards", "scroll"] },
    cardLayout: { control: "inline-radio", options: ["stack", "grid"] },
    density: { control: "inline-radio", options: ["comfortable", "compact"] },
    frame: { control: "inline-radio", options: ["framed", "flush"] },
  },
  render: (args) => (
    <Table {...args}>
      <Header />
      <Rows />
    </Table>
  ),
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Compact: Story = { args: { density: "compact" } };

export const VisibleCaption: Story = { args: { showCaption: true } };

/** Below 40rem of its own width each row is a card: the first cell is the title and the other cells show their label. */
export const PhoneCards: Story = {
  globals: { viewport: { value: "w390", isRotated: false } },
};

export const SmallestPhone: Story = {
  globals: { viewport: { value: "w320", isRotated: false } },
};

/** `responsive="scroll"` keeps the table at every width and scrolls it sideways, with a shadow on the side with more to see. */
export const ScrollOnPhone: Story = {
  args: { responsive: "scroll" },
  globals: { viewport: { value: "w390", isRotated: false } },
};

function Sortable({ responsive }: { responsive?: "cards" | "scroll" }) {
  const [sort, setSort] = useState<{ key: keyof Project; dir: SortDirection }>({ key: "name", dir: "asc" });
  const toggle = (key: keyof Project) =>
    setSort((current) => ({ key, dir: current.key === key && current.dir === "asc" ? "desc" : "asc" }));
  const rows = [...projects].sort((a, b) => {
    const order = a[sort.key] < b[sort.key] ? -1 : a[sort.key] > b[sort.key] ? 1 : 0;
    return sort.dir === "asc" ? order : -order;
  });
  return (
    <Table caption="Projects" responsive={responsive}>
      <TableHead>
        <TableRow>
          <SortableTh
            label="Project"
            active={sort.key === "name"}
            dir={sort.dir}
            onSort={() => toggle("name")}
          />
          <SortableTh
            label="Owner"
            active={sort.key === "owner"}
            dir={sort.dir}
            onSort={() => toggle("owner")}
          />
          <Th>Status</Th>
          <SortableTh
            label="Budget"
            data-numeric=""
            active={sort.key === "budget"}
            dir={sort.dir}
            onSort={() => toggle("budget")}
          />
          <Th />
        </TableRow>
      </TableHead>
      <Rows rows={rows} />
    </Table>
  );
}

/** `SortableTh` sits in the header row beside `Th` and takes the same look. The table only shows rows; the sort is the app's. */
export const SortableHeaders: Story = { render: () => <Sortable /> };

/** In card mode the sort buttons stay in the accessibility tree. When one takes keyboard focus the header row shows. */
export const SortableOnPhone: Story = {
  render: () => <Sortable />,
  globals: { viewport: { value: "w390", isRotated: false } },
};

/** A cell with `href` becomes a real link stretched over the row. The buttons of the actions cell stay separate controls. */
export const ClickableRowsAsLinks: Story = {
  render: (args) => (
    <Table {...args}>
      <Header />
      <Rows href={(project) => `#project-${project.id}`} />
    </Table>
  ),
};

/** Without `href`, `onActivate` makes the cell a real button: Enter and Space both open the row. */
export const ClickableRowsAsButtons: Story = {
  render: (args) => {
    function Demo() {
      const [opened, setOpened] = useState<string>("nothing yet");
      return (
        <>
          <p>Opened: {opened}</p>
          <Table {...args}>
            <Header />
            <Rows onActivate={(project) => setOpened(project.name)} />
          </Table>
        </>
      );
    }
    return <Demo />;
  },
};

export const ClickableRowsOnPhone: Story = {
  ...ClickableRowsAsLinks,
  globals: { viewport: { value: "w390", isRotated: false } },
};

export const Empty: Story = {
  render: (args) => (
    <Table {...args}>
      <Header />
      <TableBody>
        <TableEmpty
          colSpan={5}
          title="No projects yet"
          body="Create a project and it will show up here."
          action={<Button size="sm">New project</Button>}
        />
      </TableBody>
    </Table>
  ),
};

export const EmptyOnPhone: Story = {
  ...Empty,
  globals: { viewport: { value: "w390", isRotated: false } },
};

function WithPagination() {
  const [page, setPage] = useState(2);
  return (
    <Table
      caption="Projects"
      footer={
        <Pagination
          page={page}
          totalPages={8}
          total={78}
          onPageChange={setPage}
          hrefFor={(target) => `#page-${target}`}
          labels={labels}
        />
      }
    >
      <Header />
      <Rows />
    </Table>
  );
}

/** The footer sits under the rows, outside the scrolling area. Pagination state stays with the app. */
export const FooterWithPagination: Story = { render: () => <WithPagination /> };

export const FooterOnPhone: Story = {
  render: () => <WithPagination />,
  globals: { viewport: { value: "w390", isRotated: false } },
};

const longProjects: Project[] = [
  {
    id: 11,
    name: "Replatforming the customer-facing documentation site, including search, versioning and redirects",
    owner: "Anna-Maria Konstantinopoulou-Papadakis",
    status: "In review, waiting for the legal team",
    tone: "info",
    budget: 1234567,
  },
  {
    id: 12,
    name: "https://example.com/a/very/long/unbroken/address/that/does/not/wrap/anywhere/at-all-ever",
    owner: "Jonas Weber",
    status: "Active",
    tone: "success",
    budget: 20,
  },
];

export const LongContent: Story = {
  render: (args) => (
    <Table {...args}>
      <Header />
      <Rows rows={longProjects} href={(project) => `#project-${project.id}`} />
    </Table>
  ),
};

export const LongContentOnPhone: Story = {
  ...LongContent,
  globals: { viewport: { value: "w390", isRotated: false } },
};

/** The table answers to its own width, so one in a narrow column is a list of cards on a wide page. */
export const NarrowContainer: Story = {
  render: (args) => (
    <div style={{ inlineSize: "24rem" }}>
      <Table {...args}>
        <Header />
        <Rows />
      </Table>
    </div>
  ),
};

export const AllThemes: Story = {
  render: (args) => (
    <ThemeMatrix>
      <Table {...args} responsive="scroll">
        <Header />
        <Rows rows={projects.slice(0, 3)} href={(project) => `#project-${project.id}`} />
      </Table>
    </ThemeMatrix>
  ),
};

const panelStyle = {
  border: "1px solid var(--lufia-color-border-default)",
  borderRadius: "var(--lufia-radius-card)",
  background: "var(--lufia-color-bg-surface)",
  overflow: "hidden",
} as const;

/** `frame="flush"` drops the table's own border, radius and background so it sits edge to edge in a panel that already has a frame. */
export const FlushInPanel: Story = {
  render: (args) => (
    <div style={panelStyle}>
      <h3 style={{ margin: 0, padding: "var(--lufia-space-4)", fontSize: "var(--lufia-font-size-md)" }}>
        Projects
      </h3>
      <Table {...args} frame="flush">
        <Header />
        <Rows />
      </Table>
    </div>
  ),
};

/** In card mode each card keeps its own border; the panel supplies the rest. */
export const FlushInPanelOnPhone: Story = {
  ...FlushInPanel,
  globals: { viewport: { value: "w390", isRotated: false } },
};

/** The same table framed, for comparison. */
export const Framed: Story = { args: { frame: "framed" } };

/** `activateLabel` names the row control and `after` holds links outside it. */
export const NamedRowControl: Story = {
  render: (args) => (
    <Table {...args}>
      <Header />
      <TableBody>
        {projects.slice(0, 4).map((project) => (
          <TableRow key={project.id}>
            <Td
              primary
              label="Project"
              href={`#project-${project.id}`}
              activateLabel={`Open details of ${project.name}`}
              after={<a href={`mailto:owner${project.id}@example.com`}>Email the owner</a>}
            >
              {project.name}
            </Td>
            <Td label="Owner">{project.owner}</Td>
            <Td label="Status">
              <Badge tone={project.tone} dot wrap>
                {project.status}
              </Badge>
            </Td>
            <Td label="Budget" numeric>
              {money.format(project.budget)}
            </Td>
            <Td actions>
              <Button size="sm" variant="secondary">
                Edit
              </Button>
            </Td>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const NamedRowControlOnPhone: Story = {
  ...NamedRowControl,
  globals: { viewport: { value: "w390", isRotated: false } },
};

/** A description under a `primary` name keeps the regular weight and the muted colour. Inside a row control it is part of the control. */
export const DescriptionLine: Story = {
  render: (args) => (
    <Table {...args}>
      <Header />
      <TableBody>
        {projects.slice(0, 3).map((project) => (
          <TableRow key={project.id}>
            <Td
              primary
              label="Project"
              href={`#project-${project.id}`}
              description={`Reference PRJ-${project.id}00`}
            >
              {project.name}
            </Td>
            <Td label="Owner">{project.owner}</Td>
            <Td label="Status">{project.status}</Td>
            <Td label="Budget" numeric>
              {money.format(project.budget)}
            </Td>
            <Td actions>
              <Button size="sm" variant="secondary">
                Edit
              </Button>
            </Td>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/**
 * `rowHeader` renders the cell as `<th scope="row">`, so assistive technology announces it as the name of the row. It
 * keeps the body-cell look; with `primary` it is the card's title. The column header stays a `Th`.
 */
export const RowHeader: Story = {
  render: (args) => (
    <Table {...args}>
      <Header />
      <TableBody>
        {projects.slice(0, 3).map((project) => (
          <TableRow key={project.id}>
            <Td rowHeader primary label="Project" description={`Reference PRJ-${project.id}00`}>
              {project.name}
            </Td>
            <Td label="Owner">{project.owner}</Td>
            <Td label="Status">{project.status}</Td>
            <Td label="Budget" numeric>
              {money.format(project.budget)}
            </Td>
            <Td actions>
              <Button size="sm" variant="secondary">
                Edit
              </Button>
            </Td>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const RowHeaderOnPhone: Story = {
  ...RowHeader,
  globals: { viewport: { value: "w390", isRotated: false } },
};

/**
 * `TableFoot` holds a total row: a `Td rowHeader` ("Total") and `Td numeric` cells, stronger than the body rows with a rule
 * above. In card mode (try the phone story) it is one last summary card with label and value pairs.
 */
export const TotalRow: Story = {
  render: (args) => (
    <Table {...args}>
      <Header />
      <TableBody>
        {projects.slice(0, 3).map((project) => (
          <TableRow key={project.id}>
            <Td rowHeader primary label="Project">
              {project.name}
            </Td>
            <Td label="Owner">{project.owner}</Td>
            <Td label="Status">{project.status}</Td>
            <Td label="Budget" numeric>
              {money.format(project.budget)}
            </Td>
            <Td actions>
              <Button size="sm" variant="secondary">
                Edit
              </Button>
            </Td>
          </TableRow>
        ))}
      </TableBody>
      <TableFoot>
        <TableRow>
          <Td rowHeader label="Project">
            Total
          </Td>
          <Td />
          <Td />
          <Td label="Budget" numeric>
            {money.format(projects.slice(0, 3).reduce((sum, project) => sum + project.budget, 0))}
          </Td>
          <Td actions />
        </TableRow>
      </TableFoot>
    </Table>
  ),
};

export const TotalRowOnPhone: Story = {
  ...TotalRow,
  globals: { viewport: { value: "w390", isRotated: false } },
};

/**
 * A plain highlighted row is a `className` or `style` on `TableRow`, and a cell can hold any inline content, such as a
 * bar that shows a share of a total. The table adds nothing for either.
 */
export const HighlightedRowAndInlineBar: Story = {
  render: (args) => (
    <Table {...args}>
      <TableHead>
        <TableRow>
          <Th>Project</Th>
          <Th>Share of budget</Th>
        </TableRow>
      </TableHead>
      <TableBody>
        {projects.slice(0, 3).map((project, index) => (
          <TableRow
            key={project.id}
            style={index === 1 ? { background: "var(--lufia-color-accent-subtle)" } : undefined}
          >
            <Td rowHeader primary label="Project">
              {project.name}
            </Td>
            <Td label="Share of budget">
              <span
                role="img"
                aria-label={`${Math.round(project.budget / 520)}%`}
                style={{
                  display: "inline-block",
                  blockSize: "0.5rem",
                  inlineSize: `${Math.round(project.budget / 520)}%`,
                  borderRadius: "var(--lufia-radius-sm)",
                  background: "var(--lufia-color-accent-default)",
                }}
              />
            </Td>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/** `selected` and `current` only mark state: the app owns the selection and the detail pane. */
export const RowState: Story = {
  render: (args) => (
    <Table {...args}>
      <Header />
      <TableBody>
        {projects.slice(0, 4).map((project) => (
          <TableRow key={project.id} selected={project.id === 2} current={project.id === 3}>
            <Td primary label="Project" href={`#project-${project.id}`}>
              {project.name}
            </Td>
            <Td label="Owner">{project.owner}</Td>
            <Td label="Status">{project.status}</Td>
            <Td label="Budget" numeric>
              {money.format(project.budget)}
            </Td>
            <Td actions>
              <Button size="sm" variant="secondary">
                Edit
              </Button>
            </Td>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const RowStateOnPhone: Story = {
  ...RowState,
  globals: { viewport: { value: "w390", isRotated: false } },
};

/** Without a `title`, `TableEmpty` is a single muted line. */
export const PlainEmpty: Story = {
  render: (args) => (
    <Table {...args}>
      <Header />
      <TableBody>
        <TableEmpty colSpan={5}>No projects match the filter.</TableEmpty>
      </TableBody>
    </Table>
  ),
};

/**
 * `--lufia-table-row-scroll-margin` keeps room above and below a focused row control, here the height of the sticky bar,
 * so focus never lands under it. Focus a row and scroll: the control stops below the bar.
 */
export const ScrollMargin: Story = {
  render: (args) => (
    <div style={{ "--lufia-table-row-scroll-margin": "4rem" } as React.CSSProperties}>
      <div
        data-testid="sticky-bar"
        style={{
          position: "sticky",
          insetBlockStart: 0,
          zIndex: 2,
          blockSize: "3.5rem",
          background: "var(--lufia-color-bg-surface-raised)",
          display: "flex",
          alignItems: "center",
          paddingInline: "var(--lufia-space-4)",
        }}
      >
        Sticky bar
      </div>
      <Table {...args}>
        <Header />
        <Rows
          rows={Array.from({ length: 24 }, (_, index) => ({ ...projects[index % 5]!, id: 100 + index }))}
          href={(project) => `#project-${project.id}`}
        />
      </Table>
    </div>
  ),
};

export const ScrollMarginOnPhone: Story = {
  ...ScrollMargin,
  globals: { viewport: { value: "w390", isRotated: false } },
};

const longLabelRows = [
  { id: 1, name: "Harbour redesign", status: "Awaiting manager approval", tone: "warning" as const },
  { id: 2, name: "Billing migration", status: "Blocked by a supplier dependency", tone: "danger" as const },
];

/**
 * Narrow cards stack the label above the value, so a long label word is not split inside a word and a badge with a long
 * status wraps instead of being clipped. Open it at 320 and 390 px.
 */
export const CardLongLabelsAndBadges: Story = {
  render: (args) => (
    <Table {...args}>
      <TableHead>
        <TableRow>
          <Th>Project</Th>
          <Th>Contributions</Th>
          <Th>Status</Th>
        </TableRow>
      </TableHead>
      <TableBody>
        {longLabelRows.map((row) => (
          <TableRow key={row.id}>
            <Td primary label="Project">
              {row.name}
            </Td>
            <Td label="Contributions">12 reviewers</Td>
            <Td label="Status">
              <Badge tone={row.tone} dot>
                {row.status}
              </Badge>
            </Td>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/** A wide table with few columns: the actions column is as wide as its buttons and sits at the end edge. */
export const FewColumnsActions: Story = {
  render: (args) => (
    <Table {...args}>
      <TableHead>
        <TableRow>
          <Th>Project</Th>
          <Th>Owner</Th>
          <Th actions label="Actions" />
        </TableRow>
      </TableHead>
      <TableBody>
        {projects.slice(0, 3).map((project) => (
          <TableRow key={project.id}>
            <Td primary label="Project">
              {project.name}
            </Td>
            <Td label="Owner">{project.owner}</Td>
            <Td actions>
              <Button size="sm" variant="secondary">
                Edit
              </Button>
            </Td>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/**
 * `frame="flush"` on a translucent surface. `--lufia-table-cover-bg` is opaque and equal to the colour behind the table, so
 * the covers hide the scroll shadows when there is nothing to scroll while the surface itself stays translucent.
 */
export const FlushTranslucentSurface: Story = {
  render: (args) => (
    <div style={{ ...panelStyle, background: "var(--lufia-color-bg-surface)" }}>
      <div
        style={
          {
            "--lufia-table-bg": "color-mix(in srgb, var(--lufia-color-bg-surface) 40%, transparent)",
            "--lufia-table-cover-bg": "var(--lufia-color-bg-surface)",
          } as React.CSSProperties
        }
      >
        <Table {...args} frame="flush" responsive="scroll">
          <TableHead>
            <TableRow>
              <Th>Project</Th>
              <Th>Owner</Th>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.slice(0, 3).map((project) => (
              <TableRow key={project.id}>
                <Td primary>{project.name}</Td>
                <Td>{project.owner}</Td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  ),
};

/** A tight table: numeric cells keep an ISO date or date-time on one line, and the actions cell wraps on request. */
export const NumericAndWrappingActions: Story = {
  render: (args) => (
    <div style={{ inlineSize: "41rem" }}>
      <Table {...args}>
        <TableHead>
          <TableRow>
            <Th>Project</Th>
            <Th numeric>Due</Th>
            <Th numeric>Updated</Th>
            <Th actions label="Actions" />
          </TableRow>
        </TableHead>
        <TableBody>
          {isoRows.map((row) => (
            <TableRow key={row.id}>
              <Td primary label="Project">
                {row.name}
              </Td>
              <Td numeric label="Due">
                {row.due}
              </Td>
              <Td numeric label="Updated">
                {row.stamp}
              </Td>
              <Td actions wrap>
                <Button size="sm" variant="secondary">
                  Edit
                </Button>
                <Button size="sm" variant="secondary">
                  Duplicate
                </Button>
                <Button size="sm" variant="secondary">
                  Archive
                </Button>
                <Button size="sm" variant="secondary">
                  Delete
                </Button>
              </Td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
};

const isoRows = [
  { id: 1, name: "Harbour redesign programme", due: "2026-04-01", stamp: "2026-04-01 09:30" },
  { id: 2, name: "Billing migration", due: "2026-11-15", stamp: "2026-11-15 17:45" },
];

const rowActions = ["Edit", "Duplicate", "Archive", "Delete"];

/**
 * `wrap` with room: the four controls share one line and the column is as wide as them. When the container is too narrow
 * for that, they flow onto a second line, end-aligned. The plain table below is the reference without `wrap`.
 */
export const WrappingActionsWithRoom: Story = {
  render: (args) => (
    <div data-testid="room" style={{ inlineSize: "72rem" }}>
      {[true, false].map((wrap) => (
        <div
          key={String(wrap)}
          data-testid={wrap ? "wrapping" : "plain"}
          style={{ marginBlockEnd: "1.5rem" }}
        >
          <Table {...args} caption={wrap ? "Projects with wrapping actions" : "Projects without wrapping"}>
            <TableHead>
              <TableRow>
                <Th>Project</Th>
                <Th numeric>Due</Th>
                <Th numeric>Updated</Th>
                <Th actions label="Actions" />
              </TableRow>
            </TableHead>
            <TableBody>
              {isoRows.map((row) => (
                <TableRow key={row.id}>
                  <Td primary label="Project">
                    {row.name}
                  </Td>
                  <Td numeric label="Due">
                    {row.due}
                  </Td>
                  <Td numeric label="Updated">
                    {row.stamp}
                  </Td>
                  <Td actions wrap={wrap} label="Actions">
                    {rowActions.map((action) => (
                      <Button key={action} size="sm" variant="secondary">
                        {action}
                      </Button>
                    ))}
                  </Td>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  ),
};

/** A tight table with several date columns: an ISO date or date-time stays on one line (the table scrolls instead). */
export const TightNumericColumns: Story = {
  render: (args) => (
    <div style={{ inlineSize: "41rem" }}>
      <Table {...args}>
        <TableHead>
          <TableRow>
            <Th>Project</Th>
            <Th numeric>Start</Th>
            <Th numeric>Due</Th>
            <Th numeric>Created</Th>
            <Th numeric>Updated</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {isoRows.map((row) => (
            <TableRow key={row.id}>
              <Td primary label="Project">
                {row.name}
              </Td>
              <Td numeric label="Start">
                {row.due}
              </Td>
              <Td numeric label="Due">
                {row.due}
              </Td>
              <Td numeric label="Created">
                {row.stamp}
              </Td>
              <Td numeric label="Updated">
                {row.stamp}
              </Td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
};

/**
 * `TableRow` takes `ref` and `style` like a `<tr>`, plus any `data-*` or `aria-*` attribute, so a sortable-list library
 * that needs the row element and an inline `transform` and `transition` can drive it. Here the second row carries a
 * transform by hand; no library is involved.
 */
export const RowWithRefAndStyle: Story = {
  render: (args) => (
    <Table {...args}>
      <Header />
      <TableBody>
        {projects.slice(0, 3).map((project, index) => (
          <TableRow
            key={project.id}
            ref={(node) => {
              if (node) node.dataset.measured = "true";
            }}
            data-row-id={project.id}
            style={
              index === 1
                ? {
                    transform: "translateY(0.25rem)",
                    transition: "transform var(--lufia-motion-duration-fast) var(--lufia-motion-easing-out)",
                    position: "relative",
                  }
                : undefined
            }
          >
            <Td primary label="Project">
              {project.name}
            </Td>
            <Td label="Owner">{project.owner}</Td>
            <Td label="Status">{project.status}</Td>
            <Td label="Budget" numeric>
              {money.format(project.budget)}
            </Td>
            <Td actions>
              <Button size="sm" variant="secondary">
                Edit
              </Button>
            </Td>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/**
 * `activateDisabled` turns the row control off for a row that cannot be opened now. The button form keeps focus
 * (`aria-disabled`, as `Button` and `Pagination` do) and ignores activation; the link form has no `href`. Both read muted.
 */
export const DisabledRowControl: Story = {
  render: (args) => (
    <Table {...args}>
      <Header />
      <TableBody>
        {projects.slice(0, 3).map((project, index) => (
          <TableRow key={project.id}>
            <Td
              primary
              label="Project"
              {...(index === 0 ? { href: `#project-${project.id}` } : { onActivate: () => {} })}
              activateDisabled={index > 0}
              description={index > 0 ? "Archived, cannot be opened" : undefined}
            >
              {project.name}
            </Td>
            <Td label="Owner">{project.owner}</Td>
            <Td label="Status">{project.status}</Td>
            <Td label="Budget" numeric>
              {money.format(project.budget)}
            </Td>
            <Td actions>
              <Button size="sm" variant="secondary">
                Edit
              </Button>
            </Td>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const DisabledRowControlOnPhone: Story = {
  ...DisabledRowControl,
  globals: { viewport: { value: "w390", isRotated: false } },
};

/**
 * Grouped rows: several `TableBody`s in one `Table`, each starting with a `<TableRow group>` whose one
 * `<Th scope="colgroup" colSpan>` spans every column. In card mode the group header is a full-width heading above its cards.
 */
export const GroupedBodies: Story = {
  render: (args) => (
    <Table {...args}>
      <Header />
      {["Active", "On hold"].map((group, groupIndex) => (
        <TableBody key={group}>
          <TableRow group>
            <Th scope="colgroup" colSpan={5}>
              {group}
            </Th>
          </TableRow>
          {projects.slice(groupIndex * 2, groupIndex * 2 + 2).map((project) => (
            <TableRow key={project.id}>
              <Td primary label="Project">
                {project.name}
              </Td>
              <Td label="Owner">{project.owner}</Td>
              <Td label="Status">{project.status}</Td>
              <Td label="Budget" numeric>
                {money.format(project.budget)}
              </Td>
              <Td actions>
                <Button size="sm" variant="secondary">
                  Edit
                </Button>
              </Td>
            </TableRow>
          ))}
        </TableBody>
      ))}
    </Table>
  ),
};

export const GroupedBodiesOnPhone: Story = {
  ...GroupedBodies,
  globals: { viewport: { value: "w390", isRotated: false } },
};

export const GroupedBodiesScroll: Story = {
  ...GroupedBodies,
  args: { responsive: "scroll" },
};

type Task = {
  id: number;
  title: string;
  team: string;
  owner: string;
  status: string;
  tone: BadgeTone;
  done: number;
};

const tasks: Task[] = [
  {
    id: 1,
    title: "Prepare the release notes",
    team: "Docs",
    owner: "Amira Okafor",
    status: "Active",
    tone: "success",
    done: 70,
  },
  {
    id: 2,
    title: "Review the onboarding flow",
    team: "Design",
    owner: "Jonas Weber",
    status: "In review",
    tone: "info",
    done: 35,
  },
  {
    id: 3,
    title: "Migrate the billing service",
    team: "Platform",
    owner: "Priya Nair",
    status: "Blocked",
    tone: "danger",
    done: 10,
  },
];

/**
 * Card controls on one table: `Td` order is deliberately awkward. The title is the third column, a repeated team column
 * is hidden in cards, the progress cell stretches, the menu cell is pinned to the card corner and the actions cell is
 * moved right after the title with `cardOrder`. Open it at 390 px; at 320 px the grid falls back to one column.
 */
function CardControlsTable({ args }: { args: React.ComponentProps<typeof Table> }) {
  return (
    <Table {...args}>
      <TableHead>
        <TableRow>
          <Th actions label="Row menu" />
          <Th hideInCards>Team</Th>
          <Th>Task</Th>
          <Th>Owner</Th>
          <Th>Status</Th>
          <Th>Progress</Th>
          <Th actions label="Actions" />
        </TableRow>
      </TableHead>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id}>
            <Td cardSlot="corner">
              <Button size="sm" variant="ghost" aria-label={`More for ${task.title}`}>
                More
              </Button>
            </Td>
            <Td label="Team" hideInCards>
              {task.team}
            </Td>
            <Td primary label="Task">
              {task.title}
            </Td>
            <Td label="Owner">{task.owner}</Td>
            <Td label="Status">
              <Badge tone={task.tone} dot wrap>
                {task.status}
              </Badge>
            </Td>
            <Td label="Progress" stretch cardSpan="full">
              <div>
                <ProgressBar value={task.done} label={`${task.title} progress`} />
              </div>
            </Td>
            <Td actions cardOrder={-1}>
              <Button size="sm" variant="secondary">
                Open
              </Button>
              <Button size="sm" variant="secondary">
                Archive
              </Button>
            </Td>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export const CardControls: Story = {
  render: (args) => <CardControlsTable args={args} />,
  globals: { viewport: { value: "w390", isRotated: false } },
};

export const CardControlsGrid: Story = {
  args: { cardLayout: "grid" },
  render: (args) => <CardControlsTable args={args} />,
  globals: { viewport: { value: "w390", isRotated: false } },
};

export const CardControlsGridSmallestPhone: Story = {
  args: { cardLayout: "grid" },
  render: (args) => <CardControlsTable args={args} />,
  globals: { viewport: { value: "w320", isRotated: false } },
};

/** In table layout the controls of an actions cell share one centre line, an icon button beside a text-only one. */
export const ActionsAlignment: Story = {
  render: (args) => (
    <Table {...args}>
      <TableHead>
        <TableRow>
          <Th>Project</Th>
          <Th actions label="Actions" />
        </TableRow>
      </TableHead>
      <TableBody>
        {projects.slice(0, 2).map((project) => (
          <TableRow key={project.id}>
            <Td primary label="Project">
              {project.name}
            </Td>
            <Td actions>
              <Button size="sm" variant="secondary" iconStart={<PlusIcon />}>
                Add
              </Button>
              <Button size="sm" variant="secondary">
                Archive
              </Button>
            </Td>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

const wideColumns = [
  "Planned start date",
  "Delivery due date",
  "Budget owner name",
  "Overall risk level",
  "Open issue count",
  "Current review state",
  "Approved budget total",
  "Spent to date",
  "Remaining budget left",
];

/**
 * Nine long uppercase headers. With `wrap` a header takes two balanced lines, aligned to the bottom of the header row, so
 * the table fits at 1440 px without a sideways scroll. `abbr` shows a short text and keeps the full name for assistive
 * technology and as a tooltip. Both work on `SortableTh`. The top story has neither, for comparison.
 */
function WideHeaders({
  mode,
  responsive = "scroll",
}: {
  mode: "plain" | "wrap" | "abbr";
  responsive?: "cards" | "scroll";
}) {
  const [sort, setSort] = useState(0);
  const short = ["Start", "Due", "Owner", "Risk", "Issues", "Review", "Approved", "Spent", "Left"];
  return (
    <Table caption="Wide table" responsive={responsive}>
      <TableHead>
        <TableRow>
          {wideColumns.map((name, index) =>
            index === 1 ? (
              <SortableTh
                key={name}
                label={name}
                wrap={mode === "wrap"}
                abbr={mode === "abbr" ? short[index] : undefined}
                active={sort === index}
                dir="asc"
                onSort={() => setSort(index)}
              />
            ) : (
              <Th
                key={name}
                numeric={index > 3}
                wrap={mode === "wrap"}
                abbr={mode === "abbr" ? short[index] : undefined}
              >
                {name}
              </Th>
            ),
          )}
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          {wideColumns.map((name, index) => (
            <Td key={name} label={name} numeric={index > 3}>
              {index > 3 ? "12,400" : "2026-03-14"}
            </Td>
          ))}
        </TableRow>
      </TableBody>
    </Table>
  );
}

export const WideHeadersPlain: Story = {
  render: () => <WideHeaders mode="plain" />,
  globals: { viewport: { value: "w1440", isRotated: false } },
};

export const WideHeadersWrap: Story = {
  render: () => <WideHeaders mode="wrap" />,
  globals: { viewport: { value: "w1440", isRotated: false } },
};

export const WideHeadersAbbr: Story = {
  render: () => <WideHeaders mode="abbr" />,
  globals: { viewport: { value: "w1440", isRotated: false } },
};

/** The abbreviated headers in card mode: the header row is hidden, and a sortable header revealed by focus shows full names. */
export const WideHeadersAbbrOnPhone: Story = {
  render: () => <WideHeaders mode="abbr" responsive="cards" />,
  globals: { viewport: { value: "w390", isRotated: false } },
};

/**
 * A corner cell whose column has an inline `width` for the desktop table (`1%` keeps the column narrow). In card mode the
 * corner ignores that width and keeps the size of its content. Open it at 390 px.
 */
export const CornerWithInlineWidth: Story = {
  render: (args) => (
    <Table {...args}>
      <TableHead>
        <TableRow>
          <Th>Project</Th>
          <Th actions label="Row menu" />
        </TableRow>
      </TableHead>
      <TableBody>
        {projects.slice(0, 2).map((project) => (
          <TableRow key={project.id}>
            <Td primary label="Project">
              {project.name}
            </Td>
            <Td cardSlot="corner" style={{ width: "1%" }}>
              <Button size="sm" variant="ghost" aria-label={`More for ${project.name}`}>
                More
              </Button>
            </Td>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  globals: { viewport: { value: "w390", isRotated: false } },
};

/**
 * Half-width cells of a grid card. A long pill (a date, a status) does not wrap onto two lines: its pair takes a line of
 * its own, while short pills and text still share a line. Open it at 390 px.
 */
export const GridWithLongPills: Story = {
  args: { cardLayout: "grid" },
  render: (args) => (
    <Table {...args}>
      <TableHead>
        <TableRow>
          <Th>Project</Th>
          <Th>Owner</Th>
          <Th>Status</Th>
          <Th>Delivery</Th>
          <Th>Review</Th>
        </TableRow>
      </TableHead>
      <TableBody>
        {projects.slice(0, 2).map((project) => (
          <TableRow key={project.id}>
            <Td primary label="Project">
              {project.name}
            </Td>
            <Td label="Owner">{project.owner}</Td>
            <Td label="Status">
              <Badge tone={project.tone} dot>
                {project.status}
              </Badge>
            </Td>
            <Td label="Delivery">
              <Badge tone="info">Delivered 14 March 2026</Badge>
            </Td>
            <Td label="Review">
              <Badge tone="neutral">Due soon</Badge>
            </Td>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  globals: { viewport: { value: "w390", isRotated: false } },
};

const proseRows = [
  {
    term: "Retention",
    note: "How long a record is kept before it is archived. The default covers the legal minimum and can be extended per project, which also moves the date of the next review.",
  },
  {
    term: "Ownership",
    note: "The person answerable for the record. It changes hands when the owner leaves, and the previous owner stays in the history.",
  },
  {
    term: "Review",
    note: "A yearly check that the record is still needed.",
  },
];

function ProseTable({ responsive, withActions }: { responsive?: "cards" | "scroll"; withActions?: boolean }) {
  return (
    <Table caption="Record rules" showCaption responsive={responsive}>
      <TableHead>
        <TableRow>
          <Th>Rule</Th>
          <Th>What it means</Th>
          {withActions ? <Th actions label="Actions" /> : null}
        </TableRow>
      </TableHead>
      <TableBody>
        {proseRows.map((row) => (
          <TableRow key={row.term}>
            <Td primary label="Rule">
              {row.term}
            </Td>
            <Td label="What it means">{row.note}</Td>
            {withActions ? (
              <Td actions>
                <Button size="sm" variant="secondary">
                  Edit
                </Button>
                <Button size="sm" variant="secondary">
                  Archive
                </Button>
              </Td>
            ) : null}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/**
 * Header typography hooks. A container sets `--lufia-table-header-font-family`, `-font-size`, `-font-weight`,
 * `-letter-spacing` and `-text-transform` and both the column headers and the card-mode labels follow, without redefining
 * a global token. Here the headers read as sentence-case body text.
 */
export const HeaderTypographyHooks: Story = {
  render: () => (
    <div
      style={
        {
          "--lufia-table-header-font-family": "var(--lufia-font-family-body)",
          "--lufia-table-header-font-size": "var(--lufia-font-size-sm)",
          "--lufia-table-header-font-weight": "var(--lufia-font-weight-semibold)",
          "--lufia-table-header-letter-spacing": "normal",
          "--lufia-table-header-text-transform": "none",
        } as React.CSSProperties
      }
    >
      <ProseTable />
    </div>
  ),
};

/** The same hooks on a phone: the card labels take the header look. */
export const HeaderTypographyHooksOnPhone: Story = {
  ...HeaderTypographyHooks,
  globals: { viewport: { value: "w390", isRotated: false } },
};

/** `captionTone="muted"` for the visible caption, and the `--lufia-table-caption-*` hooks for colour, size and weight. */
export const CaptionTone: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--lufia-space-6)" }}>
      <Table caption="Muted caption" showCaption captionTone="muted">
        <Header />
        <Rows rows={projects.slice(0, 1)} />
      </Table>
      <div
        style={
          {
            "--lufia-table-caption-color": "var(--lufia-color-text-muted)",
            "--lufia-table-caption-font-size": "var(--lufia-font-size-xs)",
            "--lufia-table-caption-font-weight": "var(--lufia-font-weight-regular)",
          } as React.CSSProperties
        }
      >
        <Table caption="Caption set by hooks" showCaption>
          <Header />
          <Rows rows={projects.slice(0, 1)} />
        </Table>
      </div>
    </div>
  ),
};

/** `--lufia-table-cell-vertical-align: top` for rows of several lines of prose. The actions cell keeps its controls on one centre line. */
export const TopAlignedCells: Story = {
  render: () => (
    <div style={{ "--lufia-table-cell-vertical-align": "top" } as React.CSSProperties}>
      <ProseTable responsive="scroll" withActions />
    </div>
  ),
  globals: { viewport: { value: "w1440", isRotated: false } },
};

/** `--lufia-table-cell-color` dims the body cells; `--lufia-table-primary-color` keeps the primary cell at full strength. Card mode follows. */
export const DimmerCells: Story = {
  render: () => (
    <div
      style={
        {
          "--lufia-table-cell-color": "var(--lufia-color-text-muted)",
          "--lufia-table-primary-color": "var(--lufia-color-text-default)",
        } as React.CSSProperties
      }
    >
      <ProseTable />
    </div>
  ),
};

/** The same on a phone. */
export const DimmerCellsOnPhone: Story = {
  ...DimmerCells,
  globals: { viewport: { value: "w390", isRotated: false } },
};

/**
 * `frame="flush"` on a translucent surface with no cover token set. Where the browser supports scroll-driven animations the
 * covers and shadows are painted only while the table overflows, so nothing shows at the edges here.
 */
export const FlushTranslucentIdle: Story = {
  render: (args) => (
    <div style={{ ...panelStyle, background: "var(--lufia-color-bg-surface)" }}>
      <div
        style={
          {
            "--lufia-table-bg": "color-mix(in srgb, var(--lufia-color-bg-surface) 40%, transparent)",
          } as React.CSSProperties
        }
      >
        <Table {...args} frame="flush" responsive="scroll">
          <TableHead>
            <TableRow>
              <Th>Project</Th>
              <Th>Owner</Th>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.slice(0, 3).map((project) => (
              <TableRow key={project.id}>
                <Td primary>{project.name}</Td>
                <Td>{project.owner}</Td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  ),
  globals: { viewport: { value: "w1440", isRotated: false } },
};
