"use client";

import { useSyncExternalStore } from "react";

/**
 * The topmost open modal `<dialog>` (the last one in the document), or `null`. Browsers without `:modal` see any open
 * dialog. Internal: lets overlays that are not native dialogs (a portal `Modal`, the toast region) render inside the top
 * layer, where they would otherwise be hidden or unusable.
 */
export function findTopModalDialog(): HTMLDialogElement | null {
  const open = document.querySelectorAll<HTMLDialogElement>("dialog[open]");
  for (let index = open.length - 1; index >= 0; index -= 1) {
    const dialog = open[index]!;
    try {
      if (dialog.matches(":modal")) return dialog;
    } catch {
      return dialog;
    }
  }
  return null;
}

// One observer for every consumer. It watches the `open` attribute of dialogs only (no child-list or subtree-wide work), and
// the cached answer is recomputed only when a dialog opens or closes.
const listeners = new Set<() => void>();
let observer: MutationObserver | null = null;
let cached: HTMLDialogElement | null = null;

function recompute() {
  if (!observer) return;
  const next = findTopModalDialog();
  if (next === cached) return;
  cached = next;
  listeners.forEach((listener) => listener());
}

function refresh(records: MutationRecord[]) {
  if (records.some((record) => (record.target as Element).localName === "dialog")) recompute();
}

/**
 * Tells the store a dialog was closed or removed by the package itself. A dialog React removes is detached before its
 * `open` attribute changes, so no observer sees it.
 */
export function notifyTopModalDialogChanged() {
  recompute();
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) {
    cached = findTopModalDialog();
    observer = new MutationObserver(refresh);
    observer.observe(document, { subtree: true, attributes: true, attributeFilter: ["open"] });
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      observer?.disconnect();
      observer = null;
    }
  };
}

const getSnapshot = () => (observer ? cached : findTopModalDialog());
const getServerSnapshot = () => null;
const never = () => () => {};

/** The topmost open modal dialog, kept current while `enabled`. Always `null` on the server and when disabled. */
export function useTopModalDialog(enabled = true): HTMLDialogElement | null {
  return useSyncExternalStore(
    enabled ? subscribe : never,
    enabled ? getSnapshot : getServerSnapshot,
    getServerSnapshot,
  );
}
