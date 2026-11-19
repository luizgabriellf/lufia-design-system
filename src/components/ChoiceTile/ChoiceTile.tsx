import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import styles from "./ChoiceTile.module.css";

export type ChoiceTileSize = "sm" | "md";
export type ChoiceTileEmphasis = "solid" | "subtle";

export type ChoiceTileProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  /** The value being picked, such as a date or a time. It is the main line: semibold, with tabular numbers. */
  label: ReactNode;
  /** Small muted line above the label, such as a weekday. Without it the tile is a single line. */
  eyebrow?: ReactNode;
  /** Small muted line below the label. */
  description?: ReactNode;
  /**
   * Marks the tile as the chosen one and exposes it as `aria-pressed`. Tiles are toggle buttons: put the set in a
   * labelled `role="group"` and keep exactly one `selected`.
   */
  selected?: boolean;
  /**
   * How the selected tile reads. `solid` (default) is the accent fill with the on-accent text, the strongest element of
   * its set. `subtle` is the accent subtle fill with the accent border and text, for a set that sits inside an already
   * emphasised surface.
   */
  emphasis?: ChoiceTileEmphasis;
  /** `md` (default) is at least `--lufia-target-touch` tall. `sm` is 36px on a fine pointer and regains the touch floor on a coarse one. */
  size?: ChoiceTileSize;
  /** Stretches the tile to the width of its container, for a grid column or a stacked list. */
  fullWidth?: boolean;
  /** Dims the tile, removes it from the tab order and ignores activation. */
  disabled?: boolean;
  ref?: Ref<HTMLButtonElement>;
};

/**
 * A pressable, selectable tile for picking one value out of a short visible set laid out in a row, a wrapping grid or a
 * horizontally scrolling strip: a day, a time slot, a plan or a size. Larger than a `Chip` and with room for an eyebrow
 * and a description; a row in a vertical list is an `OptionRow`. The tile is one `<button>`; `aria-pressed` carries the
 * selected state, so colour never does alone.
 */
export function ChoiceTile({
  label,
  eyebrow,
  description,
  selected,
  emphasis = "solid",
  size = "md",
  fullWidth = false,
  disabled = false,
  className,
  ref,
  ...rest
}: ChoiceTileProps) {
  const classes = [styles.root, className].filter(Boolean).join(" ");
  return (
    <button
      type="button"
      {...rest}
      ref={ref}
      className={classes}
      data-size={size}
      data-emphasis={emphasis}
      data-selected={selected || undefined}
      data-full-width={fullWidth || undefined}
      data-disabled={disabled || undefined}
      aria-pressed={selected}
      disabled={disabled}
    >
      {eyebrow ? (
        <>
          <span className={styles.eyebrow}>{eyebrow}</span>{" "}
        </>
      ) : null}
      <span className={styles.label}>{label}</span>
      {description ? (
        <>
          {" "}
          <span className={styles.description}>{description}</span>
        </>
      ) : null}
    </button>
  );
}
