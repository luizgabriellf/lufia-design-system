"use client";

import type { ReactNode } from "react";
import type { Side } from "../internal/placement";
import { TOOLTIP_DELAY_MS, useTooltip, type TooltipTrigger } from "./useTooltip";

export type TooltipTriggerProps = TooltipTrigger;

export type TooltipProps = {
  /**
   * Renders the one focusable element the tooltip belongs to and spreads the given props onto it:
   * `{(props) => <IconButton {...props} icon={...} aria-label="Save" />}`. Put your own handlers before the spread, or
   * call the given ones from them: the spread replaces a handler of the same name.
   */
  children: (props: TooltipTriggerProps) => ReactNode;
  /** The text of the tooltip. Short and non-interactive: a hovering person can move onto it, but it never takes focus. */
  content: ReactNode;
  /**
   * Which side of the trigger it opens on (`start` and `end` follow the writing direction). It flips to the opposite
   * side when it does not fit. Default `top`.
   */
  placement?: Side;
  /**
   * How the control relates to the text. `description` (default): `aria-describedby`, for a control that already has a
   * name. `label`: the tooltip is the control's only name, so `aria-labelledby` points at a visually hidden copy of
   * `content` that is always in the DOM; prefer a real `aria-label` when you can.
   */
  relation?: "description" | "label";
  /** Milliseconds a hovering pointer waits before the tooltip shows. Keyboard focus shows it at once. Default 250. */
  delay?: number;
  /**
   * Turns the tooltip off without changing the tree, for example while a menu the control opens is showing. With
   * `relation="label"` the control keeps its name.
   */
  disabled?: boolean;
};

/**
 * A short text that names or explains a control on hover and keyboard focus. It shows on mouse and pen hover after a
 * short delay and on focus-visible, never on a touch hover, and goes away on Escape, blur, leaving and scroll; it stays
 * while the pointer is over it (WCAG 1.4.13). It is portalled to the body, flips to the opposite side when it does not
 * fit, fades in and out, and shows no motion under `prefers-reduced-motion`.
 *
 * Never put interactive content in it, and never put information in it that is not available another way: touch users
 * do not see it. For richer content use `Popover`.
 */
export function Tooltip({
  children,
  content,
  placement = "top",
  relation = "description",
  delay = TOOLTIP_DELAY_MS,
  disabled = false,
}: TooltipProps) {
  const { trigger, tooltip } = useTooltip({
    content,
    enabled: !disabled,
    side: placement,
    relation: relation === "label" ? "labelledby" : "describedby",
    delay,
  });
  return (
    <>
      {children(trigger)}
      {tooltip}
    </>
  );
}
