"use client";

import { useCallback, useState } from "react";

/**
 * A value that is controlled when `value` is given and held here otherwise. Returns the current value and a setter that
 * updates the inner state only when uncontrolled; `onChange` is called in both cases. Internal: shared by the controls.
 */
export function useControllableState<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (next: T) => void,
): [T, (next: T) => void] {
  const [inner, setInner] = useState(defaultValue);
  const controlled = value !== undefined;
  const set = useCallback(
    (next: T) => {
      if (!controlled) setInner(next);
      onChange?.(next);
    },
    [controlled, onChange],
  );
  return [controlled ? value : inner, set];
}
