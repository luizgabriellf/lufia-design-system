import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { usePagination } from "../usePagination";
import { Pagination, type PaginationLabels } from "./Pagination";

const labels: PaginationLabels = {
  nav: "Results",
  previous: "Previous",
  next: "Next",
  page: (page) => `Page ${page}`,
  summary: (page, totalPages, total) => `Page ${page} of ${totalPages}${total ? `, ${total} results` : ""}`,
};

const numbers = () =>
  Array.from(screen.getByRole("navigation").querySelectorAll("li"), (li) => li.textContent);

describe("Pagination", () => {
  it("is a labelled navigation with a polite status line", () => {
    render(<Pagination page={2} totalPages={5} total={43} onPageChange={() => {}} labels={labels} />);
    expect(screen.getByRole("navigation", { name: "Results" })).toBeInTheDocument();
    const status = screen.getByText("Page 2 of 5, 43 results");
    expect(status).toHaveAttribute("aria-live", "polite");
  });

  it("marks only the current page with aria-current", () => {
    render(<Pagination page={3} totalPages={5} onPageChange={() => {}} labels={labels} />);
    const current = screen.getAllByRole("button").filter((b) => b.hasAttribute("aria-current"));
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveAccessibleName("Page 3");
  });

  it("shows every page when they fit and collapses the rest into ellipses", () => {
    const { rerender } = render(
      <Pagination page={1} totalPages={5} onPageChange={() => {}} labels={labels} />,
    );
    expect(numbers()).toEqual(["Previous", "1", "2", "3", "4", "5", "Next"]);
    rerender(<Pagination page={1} totalPages={20} onPageChange={() => {}} labels={labels} />);
    expect(numbers()).toEqual(["Previous", "1", "2", "3", "4", "5", "…", "20", "Next"]);
    rerender(<Pagination page={10} totalPages={20} onPageChange={() => {}} labels={labels} />);
    expect(numbers()).toEqual(["Previous", "1", "…", "9", "10", "11", "…", "20", "Next"]);
    rerender(<Pagination page={20} totalPages={20} onPageChange={() => {}} labels={labels} />);
    expect(numbers()).toEqual(["Previous", "1", "…", "16", "17", "18", "19", "20", "Next"]);
  });

  it("goes to the chosen, previous and next page", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination page={3} totalPages={5} onPageChange={onPageChange} labels={labels} />);
    await user.click(screen.getByRole("button", { name: "Page 5" }));
    await user.click(screen.getByRole("button", { name: "Previous" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(onPageChange.mock.calls).toEqual([[5], [2], [4]]);
  });

  it("does not report the page it is already on", async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={3} totalPages={5} onPageChange={onPageChange} labels={labels} />);
    await userEvent.setup().click(screen.getByRole("button", { name: "Page 3" }));
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("keeps the boundary controls focusable but inert, so focus is not lost on the last page", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination page={1} totalPages={2} onPageChange={onPageChange} labels={labels} />);
    const previous = screen.getByRole("button", { name: "Previous" });
    expect(previous).toHaveAttribute("aria-disabled", "true");
    expect(previous).not.toBeDisabled();
    await user.click(previous);
    expect(onPageChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("is operable from the keyboard", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination page={1} totalPages={3} onPageChange={onPageChange} labels={labels} />);
    await user.tab(); // the inert previous stays in the tab order, so focus is never lost
    await user.tab(); // page 1, the current one
    await user.tab(); // page 2
    expect(screen.getByRole("button", { name: "Page 2" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("renders links when hrefFor is given, and leaves modified clicks to the browser", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <Pagination
        page={2}
        totalPages={3}
        onPageChange={onPageChange}
        hrefFor={(n) => `/list?page=${n}`}
        labels={labels}
      />,
    );
    expect(screen.getByRole("link", { name: "Page 3" })).toHaveAttribute("href", "/list?page=3");
    expect(screen.getByRole("link", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
    await user.keyboard("{Control>}");
    await user.click(screen.getByRole("link", { name: "Page 3" }));
    await user.keyboard("{/Control}");
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("works on top of usePagination", async () => {
    const items = Array.from({ length: 25 }, (_, i) => i);
    function Demo() {
      const p = usePagination(items, 10);
      return (
        <>
          <output>{p.slice.length}</output>
          <Pagination
            page={p.page}
            totalPages={p.totalPages}
            total={p.total}
            onPageChange={p.setPage}
            labels={labels}
          />
        </>
      );
    }
    render(<Demo />);
    await userEvent.setup().click(screen.getByRole("button", { name: "Page 3" }));
    expect(screen.getByText("5", { selector: "output" })).toBeInTheDocument();
    expect(screen.getByText("Page 3 of 3, 25 results")).toBeInTheDocument();
  });

  it("clamps an out-of-range page", () => {
    render(<Pagination page={9} totalPages={3} onPageChange={() => {}} labels={labels} />);
    expect(screen.getByText("Page 3 of 3")).toBeInTheDocument();
  });

  it("has no axe violations as buttons or links", async () => {
    const { container, rerender } = render(
      <Pagination page={10} totalPages={20} onPageChange={() => {}} labels={labels} />,
    );
    expect(await axe(container)).toHaveNoViolations();
    rerender(
      <Pagination
        page={10}
        totalPages={20}
        onPageChange={() => {}}
        hrefFor={(n) => `/p/${n}`}
        labels={labels}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  describe("compact variant", () => {
    it("shows the status line with previous and next only", () => {
      render(
        <Pagination
          page={3}
          totalPages={9}
          total={87}
          variant="compact"
          onPageChange={() => {}}
          labels={labels}
        />,
      );
      expect(numbers()).toEqual(["Previous", "Next"]);
      expect(screen.getByText("Page 3 of 9, 87 results")).toHaveAttribute("aria-live", "polite");
      expect(screen.getByRole("navigation")).toHaveAttribute("data-variant", "compact");
    });

    it("steps through the pages and keeps the boundary controls inert", async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      const { rerender } = render(
        <Pagination page={2} totalPages={3} variant="compact" onPageChange={onPageChange} labels={labels} />,
      );
      await user.click(screen.getByRole("button", { name: "Previous" }));
      await user.click(screen.getByRole("button", { name: "Next" }));
      expect(onPageChange.mock.calls).toEqual([[1], [3]]);
      rerender(
        <Pagination page={3} totalPages={3} variant="compact" onPageChange={onPageChange} labels={labels} />,
      );
      expect(screen.getByRole("button", { name: "Next" })).toHaveAttribute("aria-disabled", "true");
      await user.click(screen.getByRole("button", { name: "Next" }));
      expect(onPageChange).toHaveBeenCalledTimes(2);
    });

    it("renders links through hrefFor", () => {
      render(
        <Pagination
          page={2}
          totalPages={3}
          variant="compact"
          hrefFor={(n) => `/list?page=${n}`}
          onPageChange={() => {}}
          labels={labels}
        />,
      );
      expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute("href", "/list?page=3");
    });

    it("has no axe violations", async () => {
      const { container } = render(
        <Pagination page={2} totalPages={3} variant="compact" onPageChange={() => {}} labels={labels} />,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe("buttonClassName", () => {
    it("puts the class on every control and drops the built-in look", () => {
      render(
        <Pagination
          page={2}
          totalPages={4}
          buttonClassName="app-btn"
          onPageChange={() => {}}
          labels={labels}
        />,
      );
      for (const button of screen.getAllByRole("button")) {
        expect(button).toHaveClass("app-btn", "bare");
        expect(button).not.toHaveClass("control");
      }
    });

    it("applies to links as well", () => {
      render(
        <Pagination
          page={1}
          totalPages={2}
          variant="compact"
          buttonClassName="app-btn"
          hrefFor={(n) => `#${n}`}
          onPageChange={() => {}}
          labels={labels}
        />,
      );
      for (const link of screen.getAllByRole("link")) expect(link).toHaveClass("app-btn");
    });

    it("keeps the built-in look without it", () => {
      render(<Pagination page={1} totalPages={2} onPageChange={() => {}} labels={labels} />);
      expect(screen.getByRole("button", { name: "Next" })).toHaveClass("control");
    });
  });
});
