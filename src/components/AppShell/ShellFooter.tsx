"use client";

import type { HTMLAttributes, MouseEvent, ReactNode } from "react";
import { useLufia } from "../LufiaProvider";
import { formatShellCount, useNavSurface, type ShellBadgeTone, type ShellDataAttributes } from "./navigation";
import { useShellTooltip } from "./ShellTooltip";
import styles from "./ShellFooter.module.css";

export type ShellFooterProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** Accessible name of the group ("Account and site"). */
  "aria-label": string;
  /** `ShellFooterItem`s. */
  children: ReactNode;
};

/**
 * The row of small actions at the bottom of the sidebar and of the phone sheet: theme, settings, help, sign out. One
 * column in the sidebar, icons only in the rail, two columns in the sheet. Fill it with `ShellFooterItem`.
 */
export function ShellFooter({ className, children, ...rest }: ShellFooterProps) {
  const { collapsed, surface } = useNavSurface();
  return (
    <div
      role="group"
      {...rest}
      className={[styles.footer, className].filter(Boolean).join(" ")}
      data-surface={surface}
      data-collapsed={collapsed || undefined}
    >
      {children}
    </div>
  );
}

export type ShellFooterItemProps = ShellDataAttributes & {
  /** The name of the action. Visible beside the icon, kept as the accessible name and the tooltip in the rail. */
  label: string;
  /** Decorative icon. Shown alone in the rail. */
  icon?: ReactNode;
  /** Makes the item a link, rendered through the configured `linkComponent`. Without it the item is a button. */
  href?: string;
  /** Render a plain `<a>` that leaves the app (another site), not the router's link. Needs `href`. */
  external?: boolean;
  /** Link target, with `href`. `_blank` also sets `rel="noopener noreferrer"` unless `rel` is given. */
  target?: string;
  rel?: string;
  /** Button type. Use `submit` inside a form (a sign-out form). Default `button`. */
  type?: "button" | "submit";
  /** This is the current page: `aria-current="page"` and the active style. */
  active?: boolean;
  /** The action is running (signing out): dimmed, `aria-busy`, and further clicks are ignored. Focus stays put. */
  pending?: boolean;
  disabled?: boolean;
  /** A number after the label (unread replies). Hidden at 0, "99+" above 99, on the icon in the rail. */
  count?: number;
  countTone?: ShellBadgeTone;
  /** Accessible name when it should add to the label ("Help, 2 unread"). Keep the visible label in it. */
  ariaLabel?: string;
  /** `pressed` makes it a toggle button (`aria-pressed`): theme, density. Buttons only. */
  pressed?: boolean;
  /** `warning` colours it as a caution (an admin area). */
  tone?: "default" | "warning";
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  className?: string;
};

/**
 * One action of the footer: an icon and a label, as a link, a plain external link or a button. In the rail only the icon
 * shows and a tooltip names it; the label stays as the accessible name. Supports an active page, a pending state and a count.
 */
export function ShellFooterItem({
  label,
  icon,
  href,
  external = false,
  target,
  rel,
  type = "button",
  active = false,
  pending = false,
  disabled = false,
  count,
  countTone = "neutral",
  ariaLabel,
  pressed,
  tone = "default",
  onClick,
  className,
  ...data
}: ShellFooterItemProps) {
  const { linkComponent: Link } = useLufia();
  const { collapsed } = useNavSurface();
  const tip = useShellTooltip(label, collapsed);
  const countText = formatShellCount(count);
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if (pending) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };
  const common = {
    ...data,
    ...tip.trigger,
    className: [styles.item, className].filter(Boolean).join(" "),
    "data-active": active || undefined,
    "data-pending": pending || undefined,
    "data-tone": tone === "default" ? undefined : tone,
    "aria-current": active ? ("page" as const) : undefined,
    "aria-label": ariaLabel,
    "aria-busy": pending || undefined,
    onClick: handleClick,
  };
  const content = (
    <>
      {icon ? (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className={styles.label}>{label}</span>
      {/* Keeps "Help 2" from reading as "Help2" where the layout's spacing does not count. */}{" "}
      {countText ? (
        <span className={styles.count} data-tone={countTone}>
          {countText}
        </span>
      ) : null}
    </>
  );
  let control: ReactNode;
  if (href && !disabled && external) {
    control = (
      <a
        {...common}
        href={href}
        target={target}
        rel={rel ?? (target === "_blank" ? "noopener noreferrer" : undefined)}
      >
        {content}
      </a>
    );
  } else if (href && !disabled) {
    control = (
      <Link {...common} href={href} target={target} rel={rel}>
        {content}
      </Link>
    );
  } else {
    control = (
      <button type={type} {...common} aria-pressed={pressed} disabled={disabled}>
        {content}
      </button>
    );
  }
  return (
    <>
      {control}
      {tip.tooltip}
    </>
  );
}
