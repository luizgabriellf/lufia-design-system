"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Lets a host form notice a change the user made to a control that keeps its state in React, the way it would for a native
 * input: after the DOM shows the new value, a bubbling `input` and then a bubbling `change` Event are dispatched from
 * `target()` (the control's hidden input when it has one, so `event.target.name` is the field name). Returns `announce`, to be
 * called with the value a user gesture (a click, an arrow key) is asking for. A value that changes any other way, a
 * controlled `value` from the parent or a form reset, dispatches nothing, and neither does choosing what is already chosen.
 * A controlled parent has to accept the value in the same update as `onValueChange`; if it does not, nothing is dispatched.
 * Internal: shared by the controls that render hidden inputs.
 */
export function useFormChangeEvents<T>(value: T, target: () => HTMLElement | null) {
  const pending = useRef<{ value: T } | null>(null);
  const current = useRef(value);
  const find = useRef(target);
  // The callback and value are read at announce and dispatch time; saved during render, like `useFormReset` does.
  /* eslint-disable react-hooks/refs */
  current.current = value;
  find.current = target;
  /* eslint-enable react-hooks/refs */
  const announce = useCallback((next: T) => {
    if (!Object.is(next, current.current)) pending.current = { value: next };
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
