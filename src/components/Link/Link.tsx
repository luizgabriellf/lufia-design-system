import type { AnchorHTMLAttributes, ReactNode } from "react";
import { LufiaLink } from "../LufiaProvider";
import { VisuallyHidden } from "../VisuallyHidden";
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

function ExternalIcon() {
  return (
    <svg
      className={styles.indicator}
      viewBox="0 0 16 16"
      width="1em"
      height="1em"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M6.5 3.5H3.5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3M9.5 2.5h4v4M13.5 2.5l-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * An inline text link. It renders through the `linkComponent` set on `LufiaProvider`, so client-side routing works. An
 * external link opens in a new tab, shows an indicator, and announces that through a visually hidden label.
 */
export function Link({ externalLabel, className, children, ...rest }: LinkProps) {
  const external = externalLabel !== undefined;
  return (
    <LufiaLink
      {...rest}
      className={[styles.root, className].filter(Boolean).join(" ")}
      {...(external ? { target: "_blank", rel: "noopener noreferrer", "data-external": "" } : {})}
    >
      {children}
      {external ? (
        <>
          <ExternalIcon /> <VisuallyHidden>{externalLabel}</VisuallyHidden>
        </>
      ) : null}
    </LufiaLink>
  );
}
