"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The text for a polite live region that announces a change of the unread count. It is empty on first render, so a page that
 * loads with unread items stays quiet, and it speaks only when the count really changes afterwards.
 */
export function useUnreadAnnouncement(count: number, describe: (count: number) => string): string {
  const [message, setMessage] = useState("");
  const previous = useRef(count);
  const describeRef = useRef(describe);
  useEffect(() => {
    describeRef.current = describe;
  });
  useEffect(() => {
    if (previous.current === count) return;
    previous.current = count;
    // Reacting to an outside value changing is what an effect is for; the text is the live region's content.
    setMessage(describeRef.current(count));
  }, [count]);
  return message;
}
