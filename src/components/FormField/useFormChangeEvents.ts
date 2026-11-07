"use client";

import { useCallback, useEffect, useInsertionEffect, useRef } from "react";

/**
 * Lets a host form notice a change the user made to a control that keeps its state in React, the way it would for a native
 * input: after the DOM shows the new value, a bubbling `input` and then a bubbling `change` Event are dispatched from
 * `target()` (the control's hidden input when it has one, so `event.target.name` is the field name). Returns `announce`, to be
 * called with the value a user gesture (a click, an arrow key) is asking for. A value that changes any other way, a
 * controlled `value` from the parent or a form reset, dispatches nothing, and neither does choosing what is already chosen.
 * A controlled parent has to accept the value in the same update as `onValueChange`; if it does not, the announcement
 * expires at the end of the event and nothing is dispatched. The events are for native listeners and React `onInput`:
 * React's own `onChange` ignores hidden inputs, so it never sees them.
 * Internal: shared by the controls that render hidden inputs.
 */
export function useFormChangeEvents<T>(value: T, target: () => HTMLElement | null) {
  const pending = useRef<{ value: T } | null>(null);
  const current = useRef(value);
  const find = useRef(target);
  // Saved by an insertion effect, so only committed renders count (as in `useFormReset`).
  useInsertionEffect(() => {
    current.current = value;
    find.current = target;
  });
  const announce = useCallback((next: T) => {
    if (Object.is(next, current.current)) return;
    const announced = { value: next };
    pending.current = announced;
    // The render that follows a gesture is flushed before this runs. If none came (a controlled parent refused the value),
    // the announcement expires, so a later value set by the parent is not mistaken for the user's.
    queueMicrotask(() => {
      if (pending.current === announced) pending.current = null;
    });
  }, []);
  // After every render: the announcement is settled by the first render that follows it.
  useEffect(() => {
    const announced = pending.current;
    pending.current = null;
    if (!announced || !Object.is(announced.value, value)) return;
    const element = find.current();
    if (!element) return;
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  });
  return announce;
}
