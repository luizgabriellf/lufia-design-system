"use client";

import { useMemo, useState } from "react";

export const DEFAULT_PAGE_SIZE = 10;

/**
 * Client-side pagination of an in-memory list. Page numbers start at 1. Resets to page 1 when `resetKey` changes (pass the
 * active filter or query), and stays inside the valid range when the list shrinks.
 */
export function usePagination<T>(items: readonly T[], pageSize: number = DEFAULT_PAGE_SIZE, resetKey = "") {
  const [page, setPage] = useState(1);
  const [seenKey, setSeenKey] = useState(resetKey);
  if (seenKey !== resetKey) {
    setSeenKey(resetKey);
    setPage(1);
  }

  const size = Math.max(1, Math.floor(pageSize));
  const totalPages = Math.max(1, Math.ceil(items.length / size));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const slice = useMemo(() => items.slice((safePage - 1) * size, safePage * size), [items, safePage, size]);

  return {
    page: safePage,
    pageSize: size,
    total: items.length,
    totalPages,
    slice,
    setPage,
    hasPrev: safePage > 1,
    hasNext: safePage < totalPages,
    // Relative to the clamped page actually shown, not the raw state: after the list shrinks the raw state can be stale,
    // and the first click would silently do nothing.
    goPrev: () => setPage(Math.max(1, safePage - 1)),
    goNext: () => setPage(Math.min(totalPages, safePage + 1)),
    /** False when everything fits on one page, so a pager can be left out. */
    show: items.length > size,
  };
}
