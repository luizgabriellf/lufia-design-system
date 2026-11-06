import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./DemoButton.module.css";

export type DemoButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
  /** Decorative icon shown before the label. */
  icon?: ReactNode;
};

/**
 * Docs-only button for stories and MDX. The package ships no Button (a new component starts as an RFC), so demos use this
 * instead of an unstyled native element. It is not exported from the package.
 */
export function DemoButton({
  variant = "secondary",
  size = "md",
  icon,
  className,
  type = "button",
  children,
  ...rest
}: DemoButtonProps) {
  return (
    <button
      type={type}
      {...rest}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-variant={variant}
      data-size={size}
    >
      {icon}
      {children}
    </button>
  );
}

export type DemoLinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  Pick<DemoButtonProps, "variant" | "size" | "icon">;

/** The same look as {@link DemoButton} on an anchor, for calls to action that navigate. */
export function DemoLinkButton({
  variant = "secondary",
  size = "md",
  icon,
  className,
  children,
  ...rest
}: DemoLinkButtonProps) {
  return (
    <a
      {...rest}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-variant={variant}
      data-size={size}
    >
      {icon}
      {children}
    </a>
  );
}
