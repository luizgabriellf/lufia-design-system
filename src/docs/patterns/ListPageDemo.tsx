import { useMemo, useState } from "react";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { NavRow } from "../../components/NavRow";
import { PageHeader } from "../../components/PageHeader";
import { Pagination } from "../../components/Pagination";
import { PeerNav } from "../../components/PeerNav";
import { TableToolbar } from "../../components/TableToolbar";
import { DocumentIcon, PlusIcon } from "../demo";
import styles from "./patterns.module.css";

type Status = "open" | "closed";
const ROWS = Array.from({ length: 23 }, (_, index) => ({
  id: index + 1,
  title:
    ["Quarterly overview", "Onboarding checklist", "Vendor review", "Release notes", "Budget draft"][
      index % 5
    ] + ` ${index + 1}`,
  status: (index % 3 === 0 ? "closed" : "open") as Status,
  updated: `${(index % 27) + 1} Oct 2026`,
}));
const PAGE_SIZE = 5;

const labels = {
  nav: "Pagination",
  previous: "Previous",
  next: "Next",
  page: (page: number) => `Page ${page}`,
  summary: (page: number, total: number, count?: number) =>
    `Page ${page} of ${total}${count === undefined ? "" : `, ${count} results`}`,
};

/** A list page: header, peer navigation, toolbar, rows, pagination, and an empty state when a search matches nothing. */
export function ListPageDemo() {
  const [view, setView] = useState("all");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const matches = useMemo(
    () =>
      ROWS.filter(
        (row) =>
          (filter === "all" || row.status === filter) &&
          row.title.toLowerCase().includes(search.trim().toLowerCase()) &&
          (view === "all" || (view === "mine" && row.id % 2 === 0)),
      ),
    [filter, search, view],
  );
  const totalPages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const visible = matches.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const reset = () => setPage(1);

  return (
    <div className={styles.listPage}>
      <PageHeader
        eyebrow="Workspace"
        title="Reports"
        headingLevel={2}
        description="Everything your team has written, newest first."
        actions={
          <Button variant="primary" iconStart={<PlusIcon size={16} />}>
            New report
          </Button>
        }
      />
      <PeerNav
        label="Report views"
        value={view}
        onValueChange={(key) => {
          setView(key);
          reset();
        }}
        items={[
          { key: "all", label: "All reports" },
          { key: "mine", label: "Assigned to me" },
        ]}
      />
      <TableToolbar
        filters={[
          { key: "all", label: "All" },
          { key: "open", label: "Open" },
          { key: "closed", label: "Closed" },
        ]}
        activeFilter={filter}
        onFilterChange={(key) => {
          setFilter(key);
          reset();
        }}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          reset();
        }}
        searchPlaceholder="Search reports"
        clearSearchLabel="Clear search"
      />
      {visible.length === 0 ? (
        <EmptyState
          icon={<DocumentIcon size={32} />}
          title="No reports match"
          body="Try another filter, or clear the search."
          action={
            <Button
              size="sm"
              onClick={() => {
                setSearch("");
                setFilter("all");
                setView("all");
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          <ul className={styles.rows}>
            {visible.map((row) => (
              <li key={row.id}>
                <NavRow
                  href="#"
                  title={row.title}
                  description={`Updated ${row.updated}`}
                  badge={
                    <Badge tone={row.status === "open" ? "info" : "neutral"} dot>
                      {row.status === "open" ? "Open" : "Closed"}
                    </Badge>
                  }
                  onClick={(event) => event.preventDefault()}
                />
              </li>
            ))}
          </ul>
          <Pagination
            page={current}
            totalPages={totalPages}
            total={matches.length}
            onPageChange={setPage}
            labels={labels}
          />
        </>
      )}
    </div>
  );
}
