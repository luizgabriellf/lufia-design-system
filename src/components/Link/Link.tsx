import type { AnchorHTMLAttributes, ReactNode } from "react";
import { LufiaLink } from "../LufiaProvider";
import { VisuallyHidden } from "../VisuallyHidden";
import { ExternalLinkIcon } from "../Icon/icons";
import styles from "./Link.module.css";

export type LinkVariant = "inline" | "standalone";

export type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children"> & {
  /** Where the link goes. Rendered through the `linkComponent` of `LufiaProvider`. */
  href: string;
  /** The link text. */
  children: ReactNode;
  /**
   * Marks the link as external: it opens in a new tab (`target="_blank"`, `rel="noopener noreferrer"`) and shows an
   * indicator. The value is the visually hidden text read after the link text, such as "(opens in new tab)", so the new tab
   * is announced. Giving the text is what makes a link external, so there is no external link without it.
   */
  externalLabel?: string;
  /**
   * `inline` (default) is a link inside running text: underlined at rest. `standalone` is a link on its own line or in a
   * list or footer: no underline at rest, an underline on hover and focus, and a medium weight. Use it only where the
   * surroundings, not colour alone, show that the text is a link (WCAG 1.4.1).
   */
  variant?: LinkVariant;
  /** Decorative icon before the text, hidden from assistive technology. It does not move on hover. */
  iconStart?: ReactNode;
  /**
   * Decorative icon after the text, hidden from assistive technology. It moves 2px along the inline axis on hover, not
   * under reduced motion. The external indicator, when there is one, comes after it.
   */
  iconEnd?: ReactNode;
};

/**
 * A text link, inline in running text by default or `standalone` on its own line. It renders through the `linkComponent` set on `LufiaProvider`, so client-side routing works. An
 * external link opens in a new tab, shows an indicator, and announces that through a visually hidden label.
 */
export function Link({
  externalLabel,
  variant = "inline",
  iconStart,
  iconEnd,
  className,
  children,
  ...rest
}: LinkProps) {
  const external = externalLabel !== undefined;
  const target = external ? "_blank" : rest.target;
  // Any link that opens a new tab gets noopener and noreferrer, merged with the caller's own rel tokens.
  const rel =
    target === "_blank"
      ? [...new Set(`${rest.rel ?? ""} noopener noreferrer`.split(/\s+/).filter(Boolean))].join(" ")
      : rest.rel;
  return (
    <LufiaLink
      {...rest}
      target={target}
      rel={rel}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-variant={variant}
      data-external={external ? "" : undefined}
    >
      {iconStart ? (
        <span className={styles.iconStart} aria-hidden="true">
          {iconStart}
        </span>
      ) : null}
      {children}
      {iconEnd ? (
        <span className={styles.icon} aria-hidden="true">
          {iconEnd}
        </span>
      ) : null}
      {external ? (
        <>
          <ExternalLinkIcon size="1em" className={styles.indicator} />{" "}
          <VisuallyHidden>{externalLabel}</VisuallyHidden>
        </>
      ) : null}
    </LufiaLink>
  );
}
