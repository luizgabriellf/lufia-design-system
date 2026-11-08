import type { AnchorHTMLAttributes, ReactNode } from "react";
import { LufiaLink } from "../LufiaProvider";
import { VisuallyHidden } from "../VisuallyHidden";
import { ExternalLinkIcon } from "../Icon/icons";
import styles from "./Link.module.css";

export type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children"> & {
  href: string;
  children: ReactNode;
  /**
   * Marks the link as external: it opens in a new tab (`target="_blank"`, `rel="noopener noreferrer"`) and shows an
   * indicator. The value is the visually hidden text read after the link text, such as "(opens in new tab)", so the new tab
   * is announced. Giving the text is what makes a link external, so there is no external link without it.
   */
  externalLabel?: string;
};

/**
 * An inline text link. It renders through the `linkComponent` set on `LufiaProvider`, so client-side routing works. An
 * external link opens in a new tab, shows an indicator, and announces that through a visually hidden label.
 */
export function Link({ externalLabel, className, children, ...rest }: LinkProps) {
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
      data-external={external ? "" : undefined}
    >
      {children}
      {external ? (
        <>
          <ExternalLinkIcon size="1em" className={styles.indicator} />{" "}
          <VisuallyHidden>{externalLabel}</VisuallyHidden>
        </>
      ) : null}
    </LufiaLink>
  );
}
