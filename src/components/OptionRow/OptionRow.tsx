"use client";

import { cloneElement, isValidElement } from "react";
import type { ButtonHTMLAttributes, MouseEvent, MouseEventHandler, ReactElement, ReactNode } from "react";
import styles from "./OptionRow.module.css";

/** What the element given to `render` may already carry; the row merges its own values into these. */
type RenderedElementProps = {
  className?: string;
  onClick?: MouseEventHandler<HTMLElement>;
};

export type OptionRowProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "title" | "children" | "onClick"
> & {
  /** The option's name. It is the row's accessible name together with the description. */
  title: ReactNode;
  /** Supporting line under the title. */
  description?: ReactNode;
  /** Decorative slot before the text, such as an icon or an avatar; hidden from assistive technology. */
  leading?: ReactNode;
  /**
   * Slot after the text, such as a check mark, a price or a count. It is read after the title, so text in it must carry
   * its own context. Mark a purely decorative one `aria-hidden` yourself.
   */
  trailing?: ReactNode;
  /**
   * Marks the row as the chosen one: the accent subtle fill and border, and `aria-pressed` on the button (`aria-current`
   * on an element given to `render`, which is usually a link). Leave it out for a row that is not a choice.
   */
  selected?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
  disabled?: boolean;
  /**
   * The element to render instead of the default `<button>`, such as a router link. It receives the row's class, state,
   * content and `onClick`, and keeps its own props. It is not natively disabled: `disabled` marks it `aria-disabled` and
   * ignores activation. Create it in a Client Component.
   */
  render?: ReactElement<RenderedElementProps>;
};

/**
 * A full-width row that is one button: a leading slot, a title, an optional description, a trailing slot and a selected
 * state. For a list of choices the user picks from (a plan, a template, an address), where `NavRow` would suggest
 * navigating. Several rows belong in a list the caller marks up.
 */
export function OptionRow({
  title,
  description,
  leading,
  trailing,
  selected,
  onClick,
  disabled = false,
  render,
  className,
  ...rest
}: OptionRowProps) {
  const classes = [styles.root, className].filter(Boolean).join(" ");
  const state = { "data-selected": selected || undefined, "data-disabled": disabled || undefined };
  const content = (
    <>
      {leading ? (
        <span className={styles.leading} aria-hidden="true">
          {leading}
        </span>
      ) : null}
      <span className={styles.copy}>
        <span className={styles.title}>{title}</span>
        {description ? (
          <>
            {" "}
            <span className={styles.description}>{description}</span>
          </>
        ) : null}
      </span>
      {trailing ? (
        <>
          {" "}
          <span className={styles.trailing}>{trailing}</span>
        </>
      ) : null}
    </>
  );

  if (render !== undefined) {
    if (!isValidElement(render)) {
      throw new Error(
        "OptionRow: `render` must be a React element created in a Client Component. An element passed from a Server " +
          "Component can arrive as a lazy reference.",
      );
    }
    // `type` is a button-only attribute.
    const passed = { ...rest } as Record<string, unknown>;
    delete passed.type;
    const own = render.props;
    return cloneElement(
      render,
      {
        ...passed,
        className: [classes, own.className].filter(Boolean).join(" "),
        ...state,
        "aria-current": selected || undefined,
        "aria-disabled": disabled || undefined,
        onClick: (event: MouseEvent<HTMLElement>) => {
          if (disabled) {
            event.preventDefault();
            return;
          }
          own.onClick?.(event);
          onClick?.(event);
        },
      } as RenderedElementProps,
      content,
    );
  }

  return (
    <button
      type="button"
      {...rest}
      className={classes}
      {...state}
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
    >
      {content}
    </button>
  );
}
