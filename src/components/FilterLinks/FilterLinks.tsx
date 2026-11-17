import type { HTMLAttributes, ReactNode, Ref } from "react";
import { LufiaLink } from "../LufiaProvider";
import styles from "./FilterLinks.module.css";

export type FilterLinksItem = {
  /** Stable key, also what `value` matches against. */
  key: string;
  /** Already localised by the caller. */
  label: ReactNode;
  /** Where the link goes: the same list with this filter applied (usually a URL with a query string). */
  href: string;
  /**
   * How many results the filter has. Shown after the label. A `0` is shown; `undefined` shows nothing. Format it
   * yourself (for example `"99+"`) when it needs a cap or a locale.
   */
  count?: number | string;
  /**
   * Render a plain `<a>` instead of going through the `LufiaProvider` link adapter. The browser follows it, so it is never
   * prefetched and never a client-side transition: use it for a link that must do a full document navigation.
   */
  native?: boolean;
};

export type FilterLinksProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  /** Accessible name of the group ("Filter by status"). Required: a page can have more than one navigation. */
  label: string;
  items: readonly FilterLinksItem[];
  /** Key of the current filter. Its link gets `aria-current="true"`. Leave it out when none is current. */
  value?: string;
  ref?: Ref<HTMLElement>;
};

/**
 * A labelled row of links that each apply a different filter to one list, such as "All", "Open" and "Closed" with a count.
 * The filter lives in the URL, so every chip is a real link (opened in a new tab, crawled, followed without script)
 * rendered through the `linkComponent` of `LufiaProvider` (or a plain `<a>` for an item with `native`). The current one is
 * marked `aria-current="true"`, not `"page"`: the page is the same, only the filter changes. The row wraps onto more
 * lines, so nothing is hidden and the page never widens. Works in a Server Component.
 */
export function FilterLinks({ label, items, value, className, ref, ...rest }: FilterLinksProps) {
  return (
    <nav
      {...rest}
      ref={ref}
      aria-label={label}
      className={[styles.root, className].filter(Boolean).join(" ")}
    >
      <ul className={styles.list}>
        {items.map((item) => {
          const current = item.key === value;
          const linkProps = {
            href: item.href,
            className: styles.chip,
            "aria-current": current ? ("true" as const) : undefined,
            "data-current": current ? "" : undefined,
          };
          const content = (
            <>
              <span className={styles.label}>{item.label}</span>
              {item.count !== undefined ? (
                <>
                  {/* A space, so the accessible name reads "Open 42" and not "Open42". */}{" "}
                  <span className={styles.count}>{item.count}</span>
                </>
              ) : null}
            </>
          );
          return (
            <li key={item.key} className={styles.entry}>
              {item.native ? (
                <a {...linkProps}>{content}</a>
              ) : (
                <LufiaLink {...linkProps}>{content}</LufiaLink>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
