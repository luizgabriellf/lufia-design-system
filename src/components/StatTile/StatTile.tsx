import { useId, type HTMLAttributes, type MouseEventHandler, type ReactNode } from "react";
import { Skeleton } from "../../motion/Skeleton";
import { LufiaLink } from "../LufiaProvider";
import { VisuallyHidden } from "../VisuallyHidden";
import styles from "./StatTile.module.css";

export type StatTileTone = "neutral" | "success" | "warning" | "danger";
export type StatTileTrend = "up" | "down" | "flat";

export type StatTileProps = Omit<HTMLAttributes<HTMLDivElement>, "onClick"> & {
  /** What the figure measures. With `href` or `onClick` it is also the text of the tile's single link or button. */
  label: ReactNode;
  /** The figure, already formatted. Pass an `AnimatedNumber` to count it up. */
  value: ReactNode;
  /** `warning` and `danger` tint the whole tile for a figure that needs attention. The label always says why. */
  tone?: StatTileTone;
  /** The change, already formatted ("+12% vs last week"). */
  delta?: ReactNode;
  /** Direction arrow shown before `delta`. The arrow is decorative: say the direction in `trendLabel` or in `delta`. */
  trend?: StatTileTrend;
  /** Direction in words for screen readers ("Up"). Read before `delta`. */
  trendLabel?: string;
  /** Colour of `delta`. A rise is not always good news, so it is independent of `trend`. */
  deltaTone?: StatTileTone;
  /** A line of context under the figure. */
  hint?: ReactNode;
  /** A chart beside the figure, usually a `Sparkline`. Give it `label={null}` or a label of its own. */
  sparkline?: ReactNode;
  /** Makes the whole tile a link: the label becomes the link and its hit area is stretched over the tile. */
  href?: string;
  /** Called on press. Alone, it makes the whole tile a button. Together with `href` it runs before navigation. */
  onClick?: MouseEventHandler<HTMLElement>;
  /**
   * Turns a button tile into a toggle, for a row of tiles that filters a list: the button exposes `aria-pressed` and the
   * tile shows a selected state (accent border and background, a thicker inset border and a check mark, so it is not
   * colour alone). Ignored unless the tile is a button, so a link tile, a plain tile and a `loading` tile never get it.
   */
  pressed?: boolean;
  /**
   * Shows skeletons in place of the figure, the change, the hint and the chart, and disables the link or button. Each
   * skeleton has the line box of the content it stands for, so the loaded tile has exactly the same height. Pass the same
   * `delta`, `hint` and `sparkline` you will pass once loaded (placeholders are fine): they decide which lines are held.
   */
  loading?: boolean;
  /** Accessible name of the loading state ("Loading pending items"). Without it the skeleton is silent. */
  loadingLabel?: string;
};

const ARROWS: Record<StatTileTrend, string> = {
  up: "M3 10l5-5 5 5",
  down: "M3 6l5 5 5-5",
  flat: "M3 8h10",
};

function TrendArrow({ trend }: { trend: StatTileTrend }) {
  return (
    <svg className={styles.arrow} viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path
        d={ARROWS[trend]}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * A key figure with its label: the tile of a dashboard.
 *
 * The interactive variant uses the stretched-link pattern, like `Card`: the label is the one link (or button) and its
 * `::after` covers the tile, so the tile is one tab stop. The figure, change and hint are attached to it as its
 * description, so a screen reader announces "label, link, 12, up 3 since yesterday" without reading the tile twice.
 * Hover and press are small `transform` moves from motion tokens, removed under reduced motion. While `loading`, the
 * skeletons take the line boxes of the figure, the change, the hint and the chart, so the tile does not change height
 * when the data arrives. With `onClick` and `pressed` the tile is a toggle button (`aria-pressed`) for filtering.
 */
export function StatTile({
  label,
  value,
  tone = "neutral",
  delta,
  trend,
  trendLabel,
  deltaTone = "neutral",
  hint,
  sparkline,
  href,
  onClick,
  pressed,
  loading = false,
  loadingLabel,
  className,
  ...rest
}: StatTileProps) {
  const id = useId();
  const valueId = `${id}-value`;
  const deltaId = `${id}-delta`;
  const hintId = `${id}-hint`;
  const hasDelta = delta !== undefined && delta !== null;
  const hasHint = hint !== undefined && hint !== null;
  const interactive = !loading && (href !== undefined || onClick !== undefined);
  const isPressed = interactive && href === undefined && pressed !== undefined ? pressed : undefined;
  const describedBy = [valueId, hasDelta ? deltaId : null, hasHint ? hintId : null].filter(Boolean).join(" ");

  let labelNode: ReactNode = label;
  if (interactive && href !== undefined) {
    labelNode = (
      <LufiaLink href={href} className={styles.link} onClick={onClick} aria-describedby={describedBy}>
        {label}
      </LufiaLink>
    );
  } else if (interactive) {
    labelNode = (
      <button
        type="button"
        className={styles.link}
        onClick={onClick}
        aria-pressed={isPressed}
        aria-describedby={describedBy}
      >
        {label}
      </button>
    );
  }

  return (
    <div
      {...rest}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-tone={tone}
      data-interactive={interactive || undefined}
      data-pressed={isPressed || undefined}
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
    >
      {isPressed !== undefined ? (
        <svg className={styles.check} viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
          <path
            d="M3 8.5l3.2 3.2L13 4.8"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
      <div className={styles.body}>
        <span className={styles.label}>{labelNode}</span>
        <span className={styles.valueRow}>
          <span id={valueId} className={styles.value}>
            {loading ? (
              <Skeleton width="4.5rem" className={styles.skeletonValue} label={loadingLabel} />
            ) : (
              value
            )}
          </span>
          {sparkline ? (
            <span className={styles.spark}>
              {loading ? (
                <Skeleton variant="rect" height="auto" className={styles.skeletonSpark} />
              ) : (
                sparkline
              )}
            </span>
          ) : null}
        </span>
        {loading ? (
          <>
            {hasDelta ? <Skeleton width="70%" className={styles.skeletonLine} /> : null}
            {hasHint ? <Skeleton width="55%" className={styles.skeletonLine} /> : null}
          </>
        ) : (
          <>
            {hasDelta ? (
              <span id={deltaId} className={styles.delta} data-tone={deltaTone} data-trend={trend}>
                {trend ? <TrendArrow trend={trend} /> : null}
                {trendLabel ? <VisuallyHidden>{trendLabel} </VisuallyHidden> : null}
                {delta}
              </span>
            ) : null}
            {hasHint ? (
              <span id={hintId} className={styles.hint}>
                {hint}
              </span>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
