"use client";

import { useTooltip } from "../Tooltip/useTooltip";

/**
 * A tooltip for the sidebar rail, where the label is hidden and an icon alone is not enough. Spread `trigger` on the
 * control and render `tooltip` anywhere beside it.
 *
 * It is a sighted-person aid and `aria-hidden`: the control keeps its own accessible name, so nothing is announced
 * twice. It opens on the inline-end side of the control. Behaviour (delay, focus, Escape, scroll, exit) is `useTooltip`.
 */
export function useShellTooltip(label: string, enabled: boolean) {
  return useTooltip({ content: label, enabled, side: "end", relation: "none" });
}
