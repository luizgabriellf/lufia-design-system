"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { Button } from "../Button";
import { MoreActions, type MoreActionItem } from "../MoreActions";
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
};

/**
 * The action row of a page, normally the `actions` of a `PageHeader`: one primary action, a few secondary ones and an
 * overflow menu. On wide screens the secondary actions are buttons. On narrow screens they join the overflow menu, so the
 * primary action stays the only labelled button and the row never wraps.
 */
export function PageActions({
  primary,
  secondary = [],
  overflow = [],
  moreLabel,
  className,
  ...rest
}: PageActionsProps) {
  const menu: MoreActionItem[] = [...secondary.map((item) => ({ ...item, narrowOnly: true })), ...overflow];
  return (
    <div {...rest} className={[styles.root, className].filter(Boolean).join(" ")}>
      {primary ? (
        <Button
          variant="primary"
          size="md"
          iconStart={primary.icon}
          disabled={primary.disabled}
          {...(primary.href !== undefined ? { href: primary.href } : {})}
          onClick={primary.onSelect}
        >
          {primary.label}
        </Button>
      ) : null}
      {secondary.map((item) => (
        <Button
          key={item.key}
          className={styles.secondary}
          variant="secondary"
          iconStart={item.icon}
          disabled={item.disabled}
          {...(item.href !== undefined ? { href: item.href } : {})}
          onClick={item.onSelect}
        >
          {item.label}
        </Button>
      ))}
      {menu.length > 0 ? (
        <MoreActions
          className={overflow.length === 0 ? styles.narrowOnly : undefined}
          label={moreLabel}
          items={menu}
          variant="secondary"
        />
      ) : null}
    </div>
  );
}
