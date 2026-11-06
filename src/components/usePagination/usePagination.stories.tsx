import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button";
import { usePagination } from "./usePagination";

const items = Array.from({ length: 23 }, (_, index) => `Item ${index + 1}`);

function Demo({ pageSize }: { pageSize: number }) {
  const { slice, page, totalPages, hasPrev, hasNext, goPrev, goNext, show } = usePagination(items, pageSize);
  return (
    <div style={{ display: "grid", gap: "0.75rem", inlineSize: "min(100%, 20rem)" }}>
      <ul style={{ margin: 0, paddingInlineStart: "1.25rem" }}>
        {slice.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {show ? (
        <nav aria-label="Pagination" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <Button disabled={!hasPrev} onClick={goPrev}>
            Previous
          </Button>
          <span aria-live="polite">
            Page {page} of {totalPages}
          </span>
          <Button disabled={!hasNext} onClick={goNext}>
            Next
          </Button>
        </nav>
      ) : null}
    </div>
  );
}

const meta = {
  title: "Components/usePagination",
  component: Demo,
  parameters: { layout: "padded" },
  args: { pageSize: 5 },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const SinglePage: Story = { args: { pageSize: 50 } };
