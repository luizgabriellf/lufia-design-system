"use client";

import type { ReactNode } from "react";
import { Button, type ButtonProps, type ButtonSize } from "../Button";

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
  /** Tooltip text. Defaults to `aria-label`, so sighted mouse users get the same name. */
  title?: string;
};

/**
 * A button that shows only an icon. It shares `Button`'s variants, sizes, loading state and link rendering, and adds a
 * required `aria-label` and a `title` tooltip. A theme sets `--lufia-icon-button-size` to change the box of every size.
 */
export function IconButton({
  icon,
  title,
  "aria-label": label,
  variant = "ghost",
  shape,
  ...rest
}: IconButtonProps) {
  return (
    <Button
      {...(rest as ButtonProps)}
      variant={variant}
      aria-label={label}
      title={title ?? label}
      data-icon-only=""
      data-shape={shape === "circle" ? "circle" : undefined}
      iconStart={icon}
    />
  );
}
