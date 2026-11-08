"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * The open state of the phone sheet, uncontrolled or controlled, and a setter that reports only real changes.
 *
 * Several handlers of one click may each ask to close the sheet (an item's, the sheet's link delegate) before React has
 * rendered the first answer; only the first is a change, so `onChange` hears it once. A controlled owner that refuses a
 * change is asked again the next time, because the request lapses at the end of the event.
 */
export function useSheetControl(
  controlled: boolean | undefined,
  onChange: ((open: boolean) => void) | undefined,
) {
  const [inner, setInner] = useState(false);
  const open = controlled ?? inner;
  const now = useRef(open);
  const requested = useRef<boolean | null>(null);
  const latest = useRef({ controlled, onChange });
  useEffect(() => {
    now.current = open;
    latest.current = { controlled, onChange };
  });
  const setOpen = useCallback((next: boolean) => {
    if (next === (requested.current ?? now.current)) return;
    requested.current = next;
    queueMicrotask(() => {
      requested.current = null;
    });
    if (latest.current.controlled === undefined) setInner(next);
    latest.current.onChange?.(next);
  }, []);
  return { open, setOpen, forceClosed: inner && controlled === undefined ? () => setInner(false) : null };
}
