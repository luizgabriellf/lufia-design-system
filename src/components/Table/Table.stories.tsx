import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Badge, type BadgeTone } from "../Badge";
import { Button } from "../Button";
import { Pagination, type PaginationLabels } from "../Pagination";
import { SortableTh, type SortDirection } from "../SortableTh";
import { Table, TableBody, TableEmpty, TableHead, TableRow, Td, Th } from "./Table";

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

const isoRows = [
  { id: 1, name: "Harbour redesign programme", due: "2026-04-01", stamp: "2026-04-01 09:30" },
  { id: 2, name: "Billing migration", due: "2026-11-15", stamp: "2026-11-15 17:45" },
];

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
