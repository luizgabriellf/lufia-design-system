"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";

/** The query parameters this hook owns. Rename them if they collide with the app's own. */
export type ModalStateKeys = {
  modal: string;
  id: string;
  returnModal: string;
  returnId: string;
};

const DEFAULT_KEYS: ModalStateKeys = {
  modal: "modal",
  id: "id",
  returnModal: "returnModal",
  returnId: "returnId",
};

/** The read side of a URL. `URLSearchParams` and Next's `ReadonlyURLSearchParams` both satisfy it. */
export type SearchParamsReader = {
  get(name: string): string | null;
  forEach(callback: (value: string, key: string) => void): void;
  toString(): string;
};

/**
 * How the hook talks to the URL, so it is tied to no router.
 *
 * - `get` returns the current search params. It is called during render and again at the moment of every `open`/`close`.
 * - `set` writes the next search params with `push` (a new history entry) or `replace`.
 * - `subscribe` (optional) tells the hook when the URL changed from outside the app's router, e.g. the back button.
 *   Routers that re-render their consumers on navigation (Next's `useSearchParams`) do not need it.
 */
export type ModalStateAdapter = {
  get: () => SearchParamsReader;
  set: (params: URLSearchParams, mode: "push" | "replace") => void;
  subscribe?: (onChange: () => void) => () => void;
};

export type ModalOpenOptions = {
  /** Query parameters to drop when opening, e.g. a one-shot deep-link flag that must not reopen the modal on refresh. */
  consumeKeys?: readonly string[];
};

export type UseModalStateOptions = {
  adapter?: ModalStateAdapter;
  keys?: Partial<ModalStateKeys>;
  /** Called right before the URL is written, e.g. to start a route progress bar. */
  onNavigate?: () => void;
};

/** An adapter over `window.location` and the History API, for apps without a router. Inert on the server. */
export const browserHistoryAdapter: ModalStateAdapter = {
  get: () => new URLSearchParams(typeof window === "undefined" ? "" : window.location.search),
  set: (params, mode) => {
    const query = params.toString();
    const url = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    if (mode === "push") window.history.pushState(null, "", url);
    else window.history.replaceState(null, "", url);
    // pushState and replaceState fire no event of their own.
    window.dispatchEvent(new PopStateEvent("popstate"));
  },
  subscribe: (onChange) => {
    window.addEventListener("popstate", onChange);
    return () => window.removeEventListener("popstate", onChange);
  },
};

const noSubscription = () => () => {};

/** Decodes a composite modal id (`item::42`) that was stored URI-encoded; malformed input is returned as is. */
export function decodeModalId(id: string | null): string | null {
  if (!id) return null;
  try {
    return decodeURIComponent(id);
  } catch {
    return id;
  }
}

/**
 * Keeps "which modal is open" in the URL, so a refresh or a shared link reopens it and the back button closes it.
 * When one modal opens from another (a detail view opening its history), the parent is remembered and shown again when
 * the child closes.
 *
 * It owns four query parameters (`modal`, `id`, `returnModal`, `returnId`) and keeps every other one untouched. Works with
 * any router through {@link ModalStateAdapter}; with none it uses the browser History API.
 */
export function useModalState({
  adapter = browserHistoryAdapter,
  keys,
  onNavigate,
}: UseModalStateOptions = {}) {
  const k: ModalStateKeys = { ...DEFAULT_KEYS, ...keys };

  // Subscribing re-renders on external URL changes; the snapshot is the serialised query so unrelated renders stay quiet.
  useSyncExternalStore(
    adapter.subscribe ?? noSubscription,
    () => adapter.get().toString(),
    () => adapter.get().toString(),
  );
  const params = adapter.get();
  const modal = params.get(k.modal);
  const id = params.get(k.id);
  const returnModal = params.get(k.returnModal);
  const returnId = params.get(k.returnId);

  // An async handler can hold an older `open`/`close` after the router changed other parameters (a filter) underneath it.
  // Reading everything through a ref at call time stops it from restoring the pre-navigation query.
  const latest = useRef({ adapter, k, onNavigate });
  useEffect(() => {
    latest.current = { adapter, k, onNavigate };
  });

  const read = useCallback(() => {
    const { adapter: current, k: keysNow } = latest.current;
    const source = current.get();
    const owned = new Set([keysNow.modal, keysNow.id, keysNow.returnModal, keysNow.returnId]);
    const other = new URLSearchParams();
    source.forEach((value, key) => {
      if (!owned.has(key)) other.append(key, value);
    });
    return {
      other,
      modal: source.get(keysNow.modal),
      id: source.get(keysNow.id),
      keys: keysNow,
    };
  }, []);

  const open = useCallback(
    (name: string, itemId?: string, options?: ModalOpenOptions) => {
      const now = read();
      const next = new URLSearchParams();
      const consumed = new Set(options?.consumeKeys);
      now.other.forEach((value, key) => {
        if (!consumed.has(key)) next.append(key, value);
      });
      next.set(now.keys.modal, name);
      if (itemId) next.set(now.keys.id, itemId);
      if (now.modal && now.modal !== name) {
        next.set(now.keys.returnModal, now.modal);
        if (now.id) next.set(now.keys.returnId, now.id);
      }
      latest.current.onNavigate?.();
      latest.current.adapter.set(next, "push");
    },
    [read],
  );

  const close = useCallback(() => {
    const now = read();
    const source = latest.current.adapter.get();
    const returnTo = source.get(now.keys.returnModal);
    const returnToId = source.get(now.keys.returnId);
    const next = new URLSearchParams(now.other);
    if (returnTo) next.set(now.keys.modal, returnTo);
    if (returnToId) next.set(now.keys.id, returnToId);
    latest.current.onNavigate?.();
    latest.current.adapter.set(next, "replace");
  }, [read]);

  return { modal, id, returnModal, returnId, open, close } as const;
}
