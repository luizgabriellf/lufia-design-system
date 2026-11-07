"use client";

import { useCallback, useEffect, useInsertionEffect, useRef } from "react";

/**
 * Lets a host form notice a change the user made to a control that keeps its state in React, the way it would for a native
 * input: after the DOM shows the new value, a bubbling `input` and then a bubbling `change` Event are dispatched from
 * `target()` (the control's hidden input when it has one, so `event.target.name` is the field name). Returns `announce`, to be
 * called with the value a user gesture (a click, an arrow key) is asking for. A value that changes any other way, a
 * controlled `value` from the parent or a form reset, dispatches nothing, and neither does choosing what is already chosen.
 * An announcement is settled by the commit that shows its value, whenever that is (a transition may commit later); a
 * commit that shows a different value drops it. Edge case: if a controlled parent refuses the choice and nothing renders
 * in between, the announcement waits, and the parent later setting that same value announces once. There is no timer:
 * React schedules its own render in a microtask, so any time-based expiry loses real events.
 * The events are for native listeners and React `onInput`: React's own `onChange` ignores hidden inputs, so it never sees them.
 * Internal: shared by the controls that render hidden inputs.
 */
export function useFormChangeEvents<T>(value: T, target: () => HTMLElement | null) {
  const pending = useRef<{ value: T; from: T } | null>(null);
  const current = useRef(value);
  const find = useRef(target);
  // Saved by an insertion effect, so only committed renders count (as in `useFormReset`).
  useInsertionEffect(() => {
    current.current = value;
    find.current = target;
  });
  const announce = useCallback((next: T) => {
    if (Object.is(next, current.current)) return;
    pending.current = { value: next, from: current.current };
  }, []);
  // After every render: an announcement is settled by the commit that shows its value, and dropped by a commit that shows
  // another one. A commit that still shows the old value (a transition not yet committed) leaves it waiting.
  useEffect(() => {
    const announced = pending.current;
    if (!announced) return;
    if (!Object.is(announced.value, value)) {
      if (!Object.is(announced.from, value)) pending.current = null;
      return;
    }
    pending.current = null;
    const element = find.current();
    if (!element) return;
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  });
  return announce;
}
