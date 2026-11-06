"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * Runs `onReset` when the form that contains `ref`'s element is reset (`<button type="reset">`, `form.reset()`), so state a
 * control keeps in React, and the hidden inputs it renders, go back to their defaults like native fields do. The listener
 * sits on the form, not on the document, follows the control if its `form` attribute changes, and is removed with the component. Internal: shared by the controls.
 */
export function useFormReset(ref: RefObject<HTMLElement | null>, onReset: () => void) {
  const latest = useRef(onReset);
  const attached = useRef<HTMLFormElement | null>(null);
  const listener = useRef(() => latest.current());
  useEffect(() => {
    latest.current = onReset;
    // Checked after every render: the `form` attribute of a control can point it at another form at any time.
    const element = ref.current;
    const form = (element as HTMLInputElement | null)?.form ?? element?.closest("form") ?? null;
    if (form === attached.current) return;
    attached.current?.removeEventListener("reset", listener.current);
    form?.addEventListener("reset", listener.current);
    attached.current = form;
  });
  useEffect(() => {
    const handler = listener.current;
    return () => {
      attached.current?.removeEventListener("reset", handler);
      attached.current = null;
    };
  }, []);
}
