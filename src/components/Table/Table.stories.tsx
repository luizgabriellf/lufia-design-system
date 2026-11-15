import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Badge, type BadgeTone } from "../Badge";
import { Button } from "../Button";
import { Pagination, type PaginationLabels } from "../Pagination";
import { SortableTh, type SortDirection } from "../SortableTh";
import { VisuallyHidden } from "../VisuallyHidden";
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
        <Th>
          <VisuallyHidden>Actions</VisuallyHidden>
        </Th>
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
