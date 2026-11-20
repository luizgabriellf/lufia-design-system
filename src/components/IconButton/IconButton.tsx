"use client";

import type { FocusEvent, KeyboardEvent, PointerEvent, ReactNode } from "react";
import { Button, type ButtonProps, type ButtonSize } from "../Button";
import type { Side } from "../internal/placement";
import { useTooltip } from "../Tooltip/useTooltip";

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

/** `Button`'s sizes plus `xl`, a 4rem control for large media overlays. `Button` itself has no `xl`. */
export type IconButtonSize = ButtonSize | "xl";

export type IconButtonShape = "default" | "circle";

export type IconButtonProps = DistributiveOmit<
  ButtonProps,
  "children" | "iconStart" | "iconEnd" | "fullWidth" | "size"
> & {
  /** Default `md` (2.5rem). `xl` is 4rem, for a large media control such as a play button over a poster. */
  size?: IconButtonSize;
  /** `circle` makes the control round with equal sides (full radius). Default `default`: the rounded square. */
  shape?: IconButtonShape;
  /** Accessible name. Required: an icon alone has no name, and the types refuse a button without one. */
  "aria-label": string;
  /** The icon. Decorative: the name comes from `aria-label`. */
  icon: ReactNode;
  /**
   * The tooltip text. Defaults to `aria-label`, so sighted users get the same name. It is the package tooltip, not a
   * native `title` attribute: none is rendered.
   */
  title?: string;
  /** The side of the button the tooltip opens on; it flips when it does not fit. Default `top`. */
  tooltipPlacement?: Side;
  /**
   * Shows the tooltip on hover and keyboard focus. Default `true`. Turn it off when you wrap the button in your own
   * `Tooltip`, or while a menu or popover it opens is showing. A `disabled` or `loading` button never shows one.
   */
  tooltip?: boolean;
};

/**
 * A button that shows only an icon. It shares `Button`'s variants, sizes, loading state and link rendering, and adds a
 * required `aria-label` and the package tooltip (`aria-hidden`: the name is not announced twice). A theme sets
 * `--lufia-icon-button-size` to change the box of every size.
 */
export function IconButton({
  icon,
  title,
  tooltipPlacement = "top",
  tooltip: showTooltip = true,
  "aria-label": label,
  variant = "ghost",
  shape,
  ...rest
}: IconButtonProps) {
  const { disabled, loading, onPointerEnter, onPointerLeave, onFocus, onBlur, onKeyDown } = rest as {
    disabled?: boolean;
    loading?: boolean;
    onPointerEnter?: (event: PointerEvent<HTMLElement>) => void;
    onPointerLeave?: (event: PointerEvent<HTMLElement>) => void;
    onFocus?: (event: FocusEvent<HTMLElement>) => void;
    onBlur?: (event: FocusEvent<HTMLElement>) => void;
    onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  };
  const { trigger, tooltip } = useTooltip({
    content: title ?? label,
    enabled: showTooltip && !disabled && !loading,
    side: tooltipPlacement,
    relation: "none",
  });
  return (
    <>
      <Button
        {...(rest as ButtonProps)}
        variant={variant}
        aria-label={label}
        data-icon-only=""
        data-shape={shape === "circle" ? "circle" : undefined}
        iconStart={icon}
        onPointerEnter={(event: PointerEvent<HTMLElement>) => {
          onPointerEnter?.(event);
          trigger.onPointerEnter(event);
        }}
        onPointerLeave={(event: PointerEvent<HTMLElement>) => {
          onPointerLeave?.(event);
          trigger.onPointerLeave();
        }}
        onFocus={(event: FocusEvent<HTMLElement>) => {
          onFocus?.(event);
          trigger.onFocus(event);
        }}
        onBlur={(event: FocusEvent<HTMLElement>) => {
          onBlur?.(event);
          trigger.onBlur();
        }}
        onKeyDown={(event: KeyboardEvent<HTMLElement>) => {
          onKeyDown?.(event);
          trigger.onKeyDown(event);
        }}
      />
      {tooltip}
    </>
  );
}
