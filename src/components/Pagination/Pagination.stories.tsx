import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { usePagination } from "../usePagination";
import { Pagination, type PaginationLabels, type PaginationProps } from "./Pagination";

const labels: PaginationLabels = {
  nav: "Results pagination",
  previous: "Previous",
  next: "Next",
  page: (page) => `Page ${page}`,
  summary: (page, totalPages, total) => `Page ${page} of ${totalPages}${total ? ` · ${total} results` : ""}`,
};

function Stateful(props: PaginationProps) {
  const [page, setPage] = useState(props.page);
  return (
    <Pagination
      {...props}
      page={page}
      onPageChange={(next) => {
        setPage(next);
        props.onPageChange(next);
      }}
    />
  );
}

const meta = {
  title: "Components/Navigation/Pagination",
  component: Pagination,
  parameters: { layout: "padded" },
  args: { page: 3, totalPages: 12, total: 118, labels, onPageChange: () => {} },
  render: (args) => <Stateful {...args} />,
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 48rem)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const FirstPage: Story = { args: { page: 1 } };
export const LastPage: Story = { args: { page: 12 } };
export const FewPages: Story = { args: { page: 2, totalPages: 4, total: 36 } };
export const ManyPages: Story = { args: { page: 250, totalPages: 500, total: 4990 } };
export const WithoutTotal: Story = { args: { total: undefined } };
export const MoreSiblings: Story = { args: { page: 10, totalPages: 30, siblingCount: 2 } };
/** Real links: pages can be opened in a new tab. `onPageChange` still fires on a plain click. */
export const AsLinks: Story = {
  args: { hrefFor: (page) => `#page-${page}` },
};
/** Below 40rem the numbers give way to the status line plus previous and next. */
export const Phone320: Story = { globals: { viewport: { value: "w320", isRotated: false } } };
export const Phone390: Story = { globals: { viewport: { value: "w390", isRotated: false } } };

const rows = Array.from({ length: 47 }, (_, i) => `Record ${i + 1}`);

function WithHook() {
  const { slice, page, totalPages, total, setPage } = usePagination(rows, 8);
  return (
    <div
      style={{
        border: "1px solid var(--lufia-color-border-subtle)",
        borderRadius: "var(--lufia-radius-card)",
      }}
    >
      <ul style={{ margin: 0, padding: "1rem 2rem", minBlockSize: "13rem" }}>
        {slice.map((row) => (
          <li key={row}>{row}</li>
        ))}
      </ul>
      <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} labels={labels} />
    </div>
  );
}

/** `usePagination` supplies `page`, `totalPages`, `total` and `setPage`. */
export const WithUsePagination: Story = { render: () => <WithHook /> };
export const AllThemes: Story = {
  render: (args) => (
    <ThemeMatrix>
      <Stateful {...args} />
    </ThemeMatrix>
  ),
};
