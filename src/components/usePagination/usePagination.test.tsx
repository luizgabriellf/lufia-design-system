import { act, renderHook } from "@testing-library/react";
import { usePagination } from "./usePagination";

const items = Array.from({ length: 25 }, (_, index) => index + 1);

describe("usePagination", () => {
  it("slices the first page and reports the totals", () => {
    const { result } = renderHook(() => usePagination(items, 10));
    expect(result.current.slice).toEqual(items.slice(0, 10));
    expect(result.current).toMatchObject({
      page: 1,
      totalPages: 3,
      total: 25,
      hasPrev: false,
      hasNext: true,
      show: true,
    });
  });

  it("moves between pages and stops at the ends", () => {
    const { result } = renderHook(() => usePagination(items, 10));
    act(() => result.current.goNext());
    act(() => result.current.goNext());
    act(() => result.current.goNext());
    expect(result.current.page).toBe(3);
    expect(result.current.slice).toEqual(items.slice(20));
    act(() => result.current.goPrev());
    expect(result.current.page).toBe(2);
    act(() => result.current.setPage(1));
    act(() => result.current.goPrev());
    expect(result.current.page).toBe(1);
  });

  it("resets to page 1 when the reset key changes", () => {
    const { result, rerender } = renderHook(({ key }) => usePagination(items, 10, key), {
      initialProps: { key: "a" },
    });
    act(() => result.current.goNext());
    expect(result.current.page).toBe(2);
    rerender({ key: "b" });
    expect(result.current.page).toBe(1);
  });

  it("clamps when the list shrinks and the next click still moves", () => {
    const { result, rerender } = renderHook(({ list }) => usePagination(list, 10), {
      initialProps: { list: items },
    });
    act(() => result.current.setPage(3));
    rerender({ list: items.slice(0, 12) });
    expect(result.current.page).toBe(2);
    act(() => result.current.goPrev());
    expect(result.current.page).toBe(1);
  });

  it("hides the pager when everything fits on one page", () => {
    const { result } = renderHook(() => usePagination(items.slice(0, 5), 10));
    expect(result.current).toMatchObject({ show: false, totalPages: 1, hasNext: false });
  });

  it("copes with an empty list and an invalid page size", () => {
    const { result } = renderHook(() => usePagination([], 0));
    expect(result.current).toMatchObject({ page: 1, totalPages: 1, slice: [], pageSize: 1 });
  });
});
