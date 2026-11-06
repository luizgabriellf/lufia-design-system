"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * Runs `onReset` when the form that contains `ref`'s element is reset (`<button type="reset">`, `form.reset()`), so state a
 * control keeps in React, and the hidden inputs it renders, go back to their defaults like native fields do. The listener
 * sits on the form, not on the document, and is removed with the component. Internal: shared by the controls.
 */
export function useFormReset(ref: RefObject<HTMLElement | null>, onReset: () => void) {
  const latest = useRef(onReset);
  useEffect(() => {
    latest.current = onReset;
  });
  useEffect(() => {
    const element = ref.current;
    const form = (element as HTMLInputElement | null)?.form ?? element?.closest("form");
    if (!form) return;
    const listener = () => latest.current();
    form.addEventListener("reset", listener);
    return () => form.removeEventListener("reset", listener);
  }, [ref]);
}
