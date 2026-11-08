import type { HTMLAttributes } from "react";
import { Skeleton } from "../../motion/Skeleton";
import pageHeader from "../PageHeader/PageHeader.module.css";
import styles from "./SkeletonPageHeader.module.css";

export type SkeletonPageHeaderProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** Draws the eyebrow line above the title. Default `false`. */
  eyebrow?: boolean;
  /** Draws the description line under the title. Default `true`. */
  description?: boolean;
  /** Number of action placeholders, each the size of a medium `Button`. Default 0. */
  actions?: number;
  /** Turn the shimmer off. It also stops under `prefers-reduced-motion`. */
  still?: boolean;
};

/**
 * The top of a page that is loading. It uses `PageHeader`'s own layout classes, so the eyebrow, title and description
 * lines take the same line boxes, the title grows at the same breakpoint and the actions wrap under the text the same way.
 * Decorative (`aria-hidden`): mark the region `aria-busy` and name the loading state once.
 */
export function SkeletonPageHeader({
  eyebrow = false,
  description = true,
  actions = 0,
  still = false,
  className,
  ...rest
}: SkeletonPageHeaderProps) {
  const actionCount = Number.isFinite(actions) && actions > 0 ? Math.floor(actions) : 0;
  /* Widths are capped by percentages, so a bar never widens a grid or flex parent beyond the text it stands for. */
  const line = (extra: string | undefined) => [extra, styles.line].filter(Boolean).join(" ");
  return (
    <div {...rest} aria-hidden="true" className={[pageHeader.root, className].filter(Boolean).join(" ")}>
      <div className={pageHeader.text}>
        {eyebrow ? (
          <div className={line(pageHeader.eyebrow)}>
            <Skeleton width="min(6rem, 100%)" still={still} />
          </div>
        ) : null}
        <div className={line(pageHeader.title)}>
          <Skeleton width="min(16rem, 100%)" still={still} />
        </div>
        {description ? (
          <div className={line(pageHeader.description)}>
            <Skeleton width="min(28rem, 100%)" still={still} />
          </div>
        ) : null}
      </div>
      {actionCount ? (
        <div className={[pageHeader.actions, styles.actions].join(" ")}>
          {Array.from({ length: actionCount }, (_, index) => (
            <Skeleton key={index} variant="rect" still={still} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
