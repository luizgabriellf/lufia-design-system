"use client";

import type { ReactNode } from "react";
import { Button, type ButtonProps } from "../Button";

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

export type IconButtonProps = DistributiveOmit<
  ButtonProps,
  "children" | "iconStart" | "iconEnd" | "fullWidth"
> & {
  /** Accessible name. Required: an icon alone has no name, and the types refuse a button without one. */
  "aria-label": string;
  /** The icon. Decorative: the name comes from `aria-label`. */
  icon: ReactNode;
  /** Tooltip text. Defaults to `aria-label`, so sighted mouse users get the same name. */
  title?: string;
};

/**
 * A button that shows only an icon. It shares `Button`'s variants, sizes, loading state and link rendering, and adds a
 * required `aria-label` and a `title` tooltip.
 */
export function IconButton({
  icon,
  title,
  "aria-label": label,
  variant = "ghost",
  ...rest
}: IconButtonProps) {
  return (
    <Button
      {...(rest as ButtonProps)}
      variant={variant}
      aria-label={label}
      title={title ?? label}
      data-icon-only=""
      iconStart={icon}
    />
  );
}
