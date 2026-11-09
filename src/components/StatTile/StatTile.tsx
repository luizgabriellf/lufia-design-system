import {
  useId,
  type CSSProperties,
  type HTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import { Skeleton } from "../../motion/Skeleton";
import { LufiaLink } from "../LufiaProvider";
import { VisuallyHidden } from "../VisuallyHidden";
import type { IconComponent } from "../Icon/Icon";
import { CheckIcon, ChevronDownIcon, ChevronRightIcon, ChevronUpIcon, MinusIcon } from "../Icon/icons";
import styles from "./StatTile.module.css";

export type StatTileTone = "neutral" | "success" | "warning" | "danger";
export type StatTileTrend = "up" | "down" | "flat";
export type StatTileLayout = "tile" | "row";
export type StatTileToneSurface = "fill" | "none";

export type StatTileProps = Omit<HTMLAttributes<HTMLDivElement>, "onClick"> & {
  /** What the figure measures. With `href` or `onClick` it is also the text of the tile's single link or button. */
  label: ReactNode;
  /** The figure, already formatted. Pass an `AnimatedNumber` to count it up. */
  value: ReactNode;
  /**
   * `warning` and `danger` tint the whole tile for a figure that needs attention. The label always says why. In the `row`
   * layout only the start edge and the figure take the tone, so a column of rows does not turn into a block of colour.
   */
  tone?: StatTileTone;
  /**
   * Where a `warning` or `danger` tone shows. `fill` (default) tints the whole tile. `none` keeps the plain card and puts
   * the tone only on the accent dash and the figure, for a calm grid where a filled card would shout.
   */
  toneSurface?: StatTileToneSurface;
  /**
   * `tile` (default) stacks label, figure and hint. `row` puts the label and hint at the start and the figure at the end,
   * one line high, for a dense list of figures on a phone; a link or button row also shows a trailing chevron.
   */
  layout?: StatTileLayout;
  /**
   * Lines of label height to hold, so the figures of a row of tiles sit on one line when their labels wrap differently.
   * Set it to the most lines a label takes in the row. The same can be set per breakpoint with the
   * `--lufia-stat-tile-label-lines` custom property on the grid. Ignored by the `row` layout.
   */
  labelLines?: number;
  /**
   * Steps the figure back, for a value with nothing to act on (usually zero): it takes the muted text colour, which keeps
   * at least 4.5:1 on the surface, and the tone no longer colours it. Pair it with the `neutral` tone.
   */
  quiet?: boolean;
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

const ARROWS: Record<StatTileTrend, IconComponent> = {
  up: ChevronUpIcon,
  down: ChevronDownIcon,
  flat: MinusIcon,
};

function TrendArrow({ trend }: { trend: StatTileTrend }) {
  const Arrow = ARROWS[trend];
  return <Arrow className={styles.arrow} size="sm" />;
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
 * Hover effects apply only where the primary pointer can hover, so a tap on a phone leaves no underline or lift behind.
 */
export function StatTile({
  label,
  value,
  tone = "neutral",
  toneSurface = "fill",
  layout = "tile",
  labelLines,
  quiet = false,
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
  style,
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

  const rootStyle =
    labelLines !== undefined
      ? ({ ...style, "--lufia-stat-tile-label-lines": String(labelLines) } as CSSProperties)
      : style;

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
      style={rootStyle}
      data-tone={tone}
      data-tone-surface={toneSurface === "fill" ? undefined : toneSurface}
      data-quiet={quiet || undefined}
      data-layout={layout === "tile" ? undefined : layout}
      data-interactive={interactive || undefined}
      data-pressed={isPressed || undefined}
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
    >
      {isPressed !== undefined ? <CheckIcon className={styles.check} size="sm" /> : null}
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
      {layout === "row" && interactive && isPressed === undefined ? (
        <ChevronRightIcon className={styles.chevron} size="sm" />
      ) : null}
    </div>
  );
}
