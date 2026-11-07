"use client";

import { useId, type HTMLAttributes, type ReactNode } from "react";
import { MoreActions, type MoreActionItem } from "../MoreActions";
import { Button } from "../Button";
import { VisuallyHidden } from "../VisuallyHidden";
import styles from "./PageActions.module.css";

export type PageActionItem = {
  key: string;
  label: string;
  /** Decorative icon before the label. */
  icon?: ReactNode;
  /** Makes the action a link instead of a button. */
  href?: string;
  onSelect?: () => void;
  disabled?: boolean;
  /**
   * Short explanation, such as why the action is disabled. Shown as the native tooltip and read by assistive technology
   * as the description of the control. A disabled action with a hint stays focusable (`aria-disabled`, activation
   * ignored) so keyboard and screen reader users can reach the explanation; without a hint it is natively disabled.
   */
  hint?: string;
};

export type PageActionsProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** The one main action of the page. Always visible. */
  primary?: PageActionItem;
  /** Frequent actions. Visible on wide screens; on narrow ones they move into the overflow menu. */
  secondary?: readonly PageActionItem[];
  /** Infrequent actions. Always in the overflow menu. */
  overflow?: readonly MoreActionItem[];
  /** Accessible name of the overflow menu button, such as "More actions". */
  moreLabel: string;
  /** Size of the primary and secondary buttons and of the menu button. Defaults to `"md"`; `"sm"` suits compact headers. */
  size?: "sm" | "md";
  /**
   * `"medium"` hides the whole row below 60rem, for a page whose app shell shows the actions elsewhere on narrow screens.
   * Pure CSS, so there is no flash on first paint. Omit it to keep the row at every width.
   */
  hideBelow?: "medium";
  /**
   * Where the primary action is rendered. `"inline"` (default) keeps it in the row. `"external"` hides it in the row
   * below 60rem (the `medium` breakpoint), because the app shell renders it there, for example in a floating bar; it stays
   * inline on wider screens. The secondary actions and the menu are not affected.
   */
  primaryPlacement?: "inline" | "external";
};

function ActionButton({
  item,
  variant,
  size,
  className,
}: {
  item: PageActionItem;
  variant: "primary" | "secondary";
  size: "sm" | "md";
  className?: string;
}) {
  const hintId = useId();
  const hinted = item.hint !== undefined && item.hint !== "";
  // A natively disabled button takes no focus and, in some browsers, no hover, so its hint would be unreachable. With a
  // hint it is `aria-disabled` instead (APG: keep it focusable) and its activation is ignored here. Links already work so.
  const soft = hinted && item.disabled && item.href === undefined;
  return (
    <>
      <Button
        className={className}
        variant={variant}
        size={size}
        iconStart={item.icon}
        title={hinted ? item.hint : undefined}
        aria-describedby={hinted ? hintId : undefined}
        {...(soft ? { "aria-disabled": true } : { disabled: item.disabled })}
        {...(item.href !== undefined ? { href: item.href } : {})}
        onClick={soft ? undefined : item.onSelect}
      >
        {item.label}
      </Button>
      {hinted ? (
        <VisuallyHidden id={hintId} hidden>
          {item.hint}
        </VisuallyHidden>
      ) : null}
    </>
  );
}

/**
 * The action row of a page, normally the `actions` of a `PageHeader`: one primary action, a few secondary ones and an
 * overflow menu. On wide screens the secondary actions are buttons. On narrow screens they join the overflow menu, so the
 * primary action stays the only labelled button and the row never wraps. Below 60rem the open menu is a bottom sheet (see
 * `MoreActions` `presentation`), whose stacking order an app can raise with `--lufia-overlay-z`.
 */
export function PageActions({
  primary,
  secondary = [],
  overflow = [],
  moreLabel,
  size = "md",
  hideBelow,
  primaryPlacement = "inline",
  className,
  ...rest
}: PageActionsProps) {
  const menu: MoreActionItem[] = [...secondary.map((item) => ({ ...item, narrowOnly: true })), ...overflow];
  return (
    <div
      {...rest}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-lufia-part="page-actions"
      data-hide-below={hideBelow}
      data-primary-placement={primaryPlacement}
    >
      {primary ? (
        <ActionButton item={primary} variant="primary" size={size} className={styles.primary} />
      ) : null}
      {secondary.map((item) => (
        <ActionButton
          key={item.key}
          item={item}
          variant="secondary"
          size={size}
          className={styles.secondary}
        />
      ))}
      {menu.length > 0 ? (
        <MoreActions label={moreLabel} items={menu} variant="secondary" size={size} presentation="auto" />
      ) : null}
    </div>
  );
}
