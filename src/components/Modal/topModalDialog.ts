"use client";

import { useSyncExternalStore } from "react";

/**
 * The open modal `<dialog>` elements, in document order (the last is the topmost). Browsers without `:modal` see every open
 * dialog. Internal: lets overlays that are not native dialogs (a portal `Modal`, the toast region) render inside the top
 * layer, where they would otherwise be hidden or unusable.
 */
export function findModalDialogs(): HTMLDialogElement[] {
  const found: HTMLDialogElement[] = [];
  for (const dialog of document.querySelectorAll<HTMLDialogElement>("dialog[open]")) {
    try {
      if (dialog.matches(":modal")) found.push(dialog);
    } catch {
      found.push(dialog);
    }
  }
  return found;
}

const NONE: readonly HTMLDialogElement[] = [];

// One pair of observers for every consumer. One watches the `open` attribute of dialogs, the other the direct children of
// `body` for a removed dialog (portals live there); neither walks the tree. The answer is recomputed only when one fires.
const listeners = new Set<() => void>();
let observers: MutationObserver[] = [];
let cached: readonly HTMLDialogElement[] = NONE;

const same = (a: readonly unknown[], b: readonly unknown[]) =>
  a.length === b.length && a.every((item, index) => item === b[index]);

function recompute() {
  if (observers.length === 0) return;
  const next = findModalDialogs();
  if (same(next, cached)) return;
  cached = next.length === 0 ? NONE : next;
  listeners.forEach((listener) => listener());
}

const isDialogNode = (node: Node) =>
  node.nodeType === 1 &&
  ((node as Element).localName === "dialog" || !!(node as Element).querySelector("dialog"));

/**
 * Tells the store a dialog was closed or removed by the package itself. A dialog React removes is detached before its
 * `open` attribute changes, so the attribute observer cannot see it.
 */
export function notifyTopModalDialogChanged() {
  recompute();
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) {
    cached = findModalDialogs();
    const attributes = new MutationObserver((records) => {
      if (records.some((record) => (record.target as Element).localName === "dialog")) recompute();
    });
    attributes.observe(document, { subtree: true, attributes: true, attributeFilter: ["open"] });
    const removals = new MutationObserver((records) => {
      if (records.some((record) => Array.from(record.removedNodes).some(isDialogNode))) recompute();
    });
    removals.observe(document.body, { childList: true });
    observers = [attributes, removals];
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      observers.forEach((observer) => observer.disconnect());
      observers = [];
    }
  };
}

let fallback: readonly HTMLDialogElement[] = NONE;
const getSnapshot = () => {
  if (observers.length > 0) return cached;
  // Not watched yet (first render): compute, but hand back a stable array while nothing changed.
  const next = findModalDialogs();
  if (!same(next, fallback)) fallback = next.length === 0 ? NONE : next;
  return fallback;
};
const getServerSnapshot = () => NONE;
const never = () => () => {};

/** Every open modal dialog, in document order, kept current while `enabled`. Empty on the server and when disabled. */
export function useModalDialogs(enabled = true): readonly HTMLDialogElement[] {
  return useSyncExternalStore(
    enabled ? subscribe : never,
    enabled ? getSnapshot : getServerSnapshot,
    getServerSnapshot,
  );
}

/** The topmost open modal dialog, kept current while `enabled`. Always `null` on the server and when disabled. */
export function useTopModalDialog(enabled = true): HTMLDialogElement | null {
  const dialogs = useModalDialogs(enabled);
  return dialogs[dialogs.length - 1] ?? null;
}
