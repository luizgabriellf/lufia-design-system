"use client";

import { useEffect, useRef, type RefObject } from "react";

const SUBMIT = 'button:not([type]), button[type="submit"], input[type="submit"], input[type="image"]';

/**
 * Tells a control whether the form is being submitted on purpose right now. The returned ref is `true` from a click on a
 * submit control, or an Enter key press in a field, until the browser has run its validation (the next task). It is `false`
 * for a silent `checkValidity()`, so a control can take focus on a real attempt and stay out of the way otherwise.
 *
 * The capture-phase listeners sit on the form, never on the document, follow the control if its `form` attribute changes,
 * and are removed with the component. Internal: used by `RadioGroup`.
 */
export function useSubmitIntent(ref: RefObject<HTMLElement | null>): RefObject<boolean> {
  const intent = useRef(false);
  const attached = useRef<HTMLFormElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  function onEnter(event: Event) {
    const key = event as KeyboardEvent;
    const target = key.target as Element | null;
    if (
      key.key === "Enter" &&
      target?.matches?.("input:not([type=button], [type=reset], [type=checkbox], [type=radio])")
    ) {
      mark();
    }
  }

  // Implicit submission is the default action of the Enter key press, so both events mark the intent.
  const handlers = useRef({
    click: (event: Event) => {
      if ((event.target as Element | null)?.closest?.(SUBMIT)) mark();
    },
    keydown: onEnter,
    keypress: onEnter,
  });

  function mark() {
    intent.current = true;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => (intent.current = false), 0);
  }

  useEffect(() => {
    const element = ref.current;
    const form = (element as HTMLInputElement | null)?.form ?? element?.closest("form") ?? null;
    if (form === attached.current) return;
    for (const [type, handler] of Object.entries(handlers.current)) {
      attached.current?.removeEventListener(type, handler, true);
      form?.addEventListener(type, handler, true);
    }
    attached.current = form;
  });
  useEffect(() => {
    const current = handlers.current;
    return () => {
      for (const [type, handler] of Object.entries(current))
        attached.current?.removeEventListener(type, handler, true);
      attached.current = null;
      clearTimeout(timer.current);
    };
  }, []);

  return intent;
}
