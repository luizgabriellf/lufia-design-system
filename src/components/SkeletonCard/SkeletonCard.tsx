import { Card, type CardProps } from "../Card";
import { Skeleton } from "../../motion/Skeleton";
import styles from "./SkeletonCard.module.css";

export type SkeletonCardProps = Omit<
  CardProps,
  | "title"
  | "headingLevel"
  | "description"
  | "headerAction"
  | "footer"
  | "href"
  | "flush"
  | "divider"
  | "children"
> & {
  /** Draws a title bar on the line box of the card's title, spaced from the body like the card's header. Default `true`. */
  header?: boolean;
  /** Number of body text lines. The last one is shorter, like the end of a paragraph. Default 3. */
  lines?: number;
  /** A block under the lines, for a chart or a media area: `true` for 6rem, or a CSS height. Default `false`. */
  block?: boolean | string;
  /** Turn the shimmer off. It also stops under `prefers-reduced-motion`. */
  still?: boolean;
};

const LINE_SHARES = ["92%", "84%", "88%", "76%"];

/**
 * A `Card` that is loading: a title bar, text lines and an optional block, drawn inside the card's own padding box, so
 * the loaded card takes exactly its place. Decorative (`aria-hidden`): mark the region `aria-busy` and name the loading
 * state once, for example with a labelled `Skeleton`.
 */
export function SkeletonCard({
  header = true,
  lines = 3,
  block = false,
  still = false,
  className,
  ...rest
}: SkeletonCardProps) {
  const lineCount = Number.isFinite(lines) && lines > 0 ? Math.floor(lines) : 0;
  return (
    <Card {...rest} aria-hidden="true" className={[styles.root, className].filter(Boolean).join(" ")}>
      {header ? (
        <div className={styles.header}>
          <Skeleton width="45%" still={still} />
        </div>
      ) : null}
      {Array.from({ length: lineCount }, (_, index) => (
        <div key={index} className={styles.line}>
          <Skeleton
            width={index === lineCount - 1 && lineCount > 1 ? "60%" : LINE_SHARES[index % LINE_SHARES.length]}
            still={still}
          />
        </div>
      ))}
      {block ? (
        <Skeleton
          variant="rect"
          height={typeof block === "string" ? block : undefined}
          still={still}
          className={styles.block}
        />
      ) : null}
    </Card>
  );
}
