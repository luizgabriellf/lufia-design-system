"use client";

import type { HTMLAttributes, MouseEventHandler, ReactNode, Ref } from "react";
import { CloseIcon } from "../Icon/icons";
import styles from "./Chip.module.css";

export type ChipSize = "sm" | "md";
export type ChipTone = "neutral" | "accent" | "success" | "warning" | "danger";

type ChipBaseProps = Omit<HTMLAttributes<HTMLElement>, "children" | "onClick"> & {
  /** The label. Always required: the selected state and the icon never carry the meaning on their own. */
  children: ReactNode;
  /** Decorative icon before the label; hidden from assistive technology. */
  iconStart?: ReactNode;
  /** `sm` is 24px high and `md` 28px on a fine pointer. A coarse pointer keeps the look and widens the hit area only. */
  size?: ChipSize;
  /**
   * Colour family from the semantic tokens: `neutral` (default) is the plain look, `accent` the accent subtle fill, and
   * `success`, `warning` and `danger` the status fills. Colour never carries the meaning alone: the label does. A selected
   * toggle chip keeps the selected look whatever the tone.
   */
  tone?: ChipTone;
  /** Dims the chip and ignores activation. For a removable chip it disables the remove button. */
  disabled?: boolean;
  ref?: Ref<HTMLElement>;
};

/** An action chip or a toggle chip: the whole chip is one button. */
type ChipPressable = ChipBaseProps & {
  /**
   * Makes the chip a button that applies a suggestion or a filter. `aria-expanded`, `aria-haspopup` and `aria-controls`
   * reach the button, so a chip can open a popover or a menu.
   */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /**
   * Makes the chip a toggle: `true` or `false` is exposed as `aria-pressed`, and selected looks like the accent
   * subtle fill with the accent border and text. Leave it out for an action chip, which has no pressed state.
   */
  selected?: boolean;
  onRemove?: undefined;
  removeLabel?: undefined;
};

/** A removable chip: the label is static text and the remove button is the only interactive part. */
type ChipRemovable = ChipBaseProps & {
  /** Called when the remove button is activated. Makes the chip removable. */
  onRemove: MouseEventHandler<HTMLButtonElement>;
  /** Accessible name of the remove button, such as "Remove Draft". Required with `onRemove`. */
  removeLabel: string;
  onClick?: undefined;
  selected?: undefined;
};

export type ChipProps = ChipPressable | ChipRemovable;

/**
 * A compact pill control. With `onClick` it is an action chip (a suggestion the user applies), with `selected` a toggle
 * chip (`aria-pressed`), and with `onRemove` a removable chip whose label is static text next to a remove button. With
 * none of them it is a plain `<span>`. A button is never nested in another button.
 */
export function Chip({
  children,
  iconStart,
  size = "md",
  tone = "neutral",
  disabled = false,
  onClick,
  selected,
  onRemove,
  removeLabel,
  className,
  ref,
  ...rest
}: ChipProps) {
  const classes = [styles.root, className].filter(Boolean).join(" ");
  const state = {
    ...rest,
    className: classes,
    "data-size": size,
    "data-tone": tone === "neutral" ? undefined : tone,
    "data-selected": selected || undefined,
    "data-disabled": disabled || undefined,
  };
  const content = (
    <>
      {iconStart ? (
        <span className={styles.icon} aria-hidden="true">
          {iconStart}
        </span>
      ) : null}
      <span className={styles.label}>{children}</span>
    </>
  );

  if (onRemove) {
    return (
      <span {...state} ref={ref} data-removable="">
        {content}
        <button
          type="button"
          className={styles.remove}
          aria-label={removeLabel}
          disabled={disabled}
          onClick={onRemove}
        >
          <CloseIcon size="1em" />
        </button>
      </span>
    );
  }

  if (onClick || selected !== undefined) {
    return (
      <button
        type="button"
        {...(state as HTMLAttributes<HTMLButtonElement>)}
        ref={ref as Ref<HTMLButtonElement>}
        aria-pressed={selected}
        disabled={disabled}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return (
    <span {...state} ref={ref}>
      {content}
    </span>
  );
}
