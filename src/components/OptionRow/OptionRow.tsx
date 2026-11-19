"use client";

import { cloneElement, isValidElement } from "react";
import type {
  ButtonHTMLAttributes,
  MouseEvent,
  MouseEventHandler,
  ReactElement,
  ReactNode,
  Ref,
} from "react";
import styles from "./OptionRow.module.css";

/** What the element given to `render` may already carry; the row merges its own values into these. */
type RenderedElementProps = {
  className?: string;
  onClick?: MouseEventHandler<HTMLElement>;
};

export type OptionRowDensity = "comfortable" | "compact";

export type OptionRowProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "title" | "children" | "onClick"
> & {
  /** The option's name. It is the row's accessible name together with the description. */
  title: ReactNode;
  /** Small accent line above the title, such as a category or a step. It is read before the title. */
  eyebrow?: ReactNode;
  /** Supporting line under the title. */
  description?: ReactNode;
  /** Small muted line under the description, which may hold inline icons. It is read after the description. */
  meta?: ReactNode;
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
  /**
   * `comfortable` (default) is a bordered card row, for a short list of choices. `compact` is for a long pick list inside
   * a menu, sheet or modal: no border or shadow, tighter block padding, a medium-weight title and a small muted
   * description. The rows are separated by the parent's gap, or a hairline the parent draws. On a coarse pointer a compact
   * row is still at least `--lufia-target-touch` tall.
   */
  density?: OptionRowDensity;
  /**
   * Keeps the title, the description, the eyebrow and the meta each on one line, cut with an ellipsis, for a row in a
   * narrow container such as a menu trigger. Default `false`: the text wraps.
   */
  truncate?: boolean;
  /**
   * A purely visual emphasis: the accent subtle fill and border of `selected`, with no `aria-pressed` or `aria-current`.
   * For a suggested or recommended option. Exposed as `data-highlighted`.
   */
  highlighted?: boolean;
  /**
   * Default `true`. `false` renders the same layout as a plain `<div>` (or the element given to `render`) with no button
   * semantics, no hover, press or focus affordance and no `onClick`, for a row that only displays. `selected` and
   * `highlighted` still style it. `disabled` has no effect.
   */
  interactive?: boolean;
  /** The row's button, so a menu or popover can anchor to it. A trigger's spread props (`aria-expanded` and the rest) pass through. */
  ref?: Ref<HTMLButtonElement>;
  onClick?: MouseEventHandler<HTMLElement>;
  disabled?: boolean;
  /**
   * The element to render instead of the default `<button>`, such as a router link. It receives the row's class, state,
   * content and `onClick`, and keeps its own props. It is not natively disabled: `disabled` marks it `aria-disabled` and
   * ignores activation. Create it in a Client Component. With `interactive={false}` it is the static container instead.
   */
  render?: ReactElement<RenderedElementProps>;
};

/**
 * A full-width row that is one button: a leading slot, a title with an optional eyebrow, description and meta, a
 * trailing slot and a selected state. It also serves as a menu or disclosure trigger (`aria-expanded` gives the open
 * look) and, with `interactive={false}`, as a static card. For a list of choices the user picks from (a plan, a template, an address), where `NavRow` would suggest
 * navigating. Several rows belong in a list the caller marks up.
 */
export function OptionRow({
  title,
  eyebrow,
  description,
  meta,
  leading,
  trailing,
  selected,
  density = "comfortable",
  truncate = false,
  highlighted = false,
  interactive = true,
  onClick,
  disabled = false,
  render,
  className,
  ...rest
}: OptionRowProps) {
  const classes = [styles.root, className].filter(Boolean).join(" ");
  const state = {
    "data-density": density,
    "data-selected": selected || undefined,
    "data-highlighted": highlighted || undefined,
    "data-truncate": truncate || undefined,
    "data-static": interactive ? undefined : "",
    "data-disabled": disabled || undefined,
  };
  const content = (
    <>
      {leading ? (
        <span className={styles.leading} aria-hidden="true">
          {leading}
        </span>
      ) : null}
      <span className={styles.copy}>
        {eyebrow ? (
          <>
            <span className={styles.eyebrow}>{eyebrow}</span>{" "}
          </>
        ) : null}
        <span className={styles.title}>{title}</span>
        {description ? (
          <>
            {" "}
            <span className={styles.description}>{description}</span>
          </>
        ) : null}
        {meta ? (
          <>
            {" "}
            <span className={styles.meta}>{meta}</span>
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

  if (!interactive) {
    const element: ReactElement<RenderedElementProps> = render ?? <div />;
    if (!isValidElement(element)) {
      throw new Error(
        "OptionRow: `render` must be a React element created in a Client Component. An element passed from a Server " +
          "Component can arrive as a lazy reference.",
      );
    }
    const passed = { ...rest } as Record<string, unknown>;
    delete passed.type;
    return cloneElement(
      element,
      {
        ...passed,
        className: [classes, element.props.className].filter(Boolean).join(" "),
        ...state,
      } as RenderedElementProps,
      content,
    );
  }

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
