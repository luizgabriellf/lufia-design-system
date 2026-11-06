"use client";

import { useId, useState, type HTMLAttributes, type MouseEvent, type ReactNode } from "react";
import { Collapse } from "../../motion";
import { useLufia } from "../LufiaProvider";
import { ChevronGlyph, SidebarGlyph } from "./icons";
import { NavSurfaceContext, useNavSurface } from "./navigation";
import styles from "./Sidebar.module.css";

export type SidebarProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** Accessible name of the navigation landmark inside the sidebar. */
  label: string;
  /** Render as a rail: icons only. The parts keep their labels for assistive technology. */
  collapsed?: boolean;
  /** When given, a button in the header asks for the rail to open or close. */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Accessible name of that button while the sidebar is open ("Collapse sidebar"). */
  collapseLabel?: string;
  /** Accessible name of that button while it is a rail ("Expand sidebar"). */
  expandLabel?: string;
  /** Above the navigation: a brand, an account or workspace switcher. */
  header?: ReactNode;
  /** Below the navigation, pinned to the bottom: account and help links. */
  footer?: ReactNode;
  /** One or more `SidebarGroup`. */
  children: ReactNode;
};

/**
 * The desktop sidebar: a header slot, the navigation, and a footer slot. The navigation scrolls on its own when it is
 * taller than the window; the header and footer stay put. Compose it from `SidebarGroup` and `SidebarItem`, or hand it
 * `ShellNavigation` to render from data.
 */
export function Sidebar({
  label,
  collapsed = false,
  onCollapsedChange,
  collapseLabel,
  expandLabel,
  header,
  footer,
  className,
  children,
  ...rest
}: SidebarProps) {
  return (
    <NavSurfaceContext.Provider value={{ collapsed }}>
      <div
        {...rest}
        className={[styles.sidebar, className].filter(Boolean).join(" ")}
        data-collapsed={collapsed || undefined}
      >
        <div className={styles.head}>
          {header ? <div className={styles.headContent}>{header}</div> : null}
          {onCollapsedChange && collapseLabel && expandLabel ? (
            <button
              type="button"
              className={styles.collapseButton}
              aria-label={collapsed ? expandLabel : collapseLabel}
              onClick={() => onCollapsedChange(!collapsed)}
            >
              <SidebarGlyph />
            </button>
          ) : null}
        </div>
        <nav className={styles.nav} aria-label={label}>
          {children}
        </nav>
        {footer ? <div className={styles.foot}>{footer}</div> : null}
      </div>
    </NavSurfaceContext.Provider>
  );
}

export type SidebarGroupProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** Heading of the group. Without one the group is a plain run of items. */
  label?: string;
  /** Icon of the disclosure button. */
  icon?: ReactNode;
  /** Turns the heading into a button that shows and hides the items. Needs a `label`. */
  collapsible?: boolean;
  /** Controlled open state of a collapsible group. */
  open?: boolean;
  /** Initial open state when uncontrolled. Default `true`. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** The current page is inside this group. While the group is closed its button stands in for it. */
  current?: boolean;
  /** `SidebarItem`s. */
  children: ReactNode;
};

/** A heading and its items. Collapsible groups animate open and closed and, as a rail, show their items as plain icons. */
export function SidebarGroup({
  label,
  icon,
  collapsible = false,
  open: openProp,
  defaultOpen = true,
  onOpenChange,
  current = false,
  className,
  children,
  ...rest
}: SidebarGroupProps) {
  const { collapsed } = useNavSurface();
  const id = useId();
  const [inner, setInner] = useState(defaultOpen);
  const open = openProp ?? inner;
  const classes = [styles.group, className].filter(Boolean).join(" ");
  const list = <ul className={styles.list}>{children}</ul>;

  // A rail has no room for headings, and a closed group would hide icons the person needs: show the items, with a rule.
  if (!label || !collapsible || collapsed) {
    return (
      <div {...rest} className={classes} role="group" aria-labelledby={label ? `${id}-label` : undefined}>
        {label ? (
          <span id={`${id}-label`} className={styles.heading}>
            {label}
          </span>
        ) : null}
        {list}
      </div>
    );
  }

  const stands = current && !open;
  return (
    <div {...rest} className={classes} data-open={open || undefined}>
      <button
        type="button"
        className={`${styles.item} ${styles.disclosure}`}
        aria-expanded={open}
        aria-controls={`${id}-items`}
        data-active={stands || undefined}
        onClick={() => {
          if (openProp === undefined) setInner(!open);
          onOpenChange?.(!open);
        }}
      >
        {icon ? (
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <span className={styles.label}>{label}</span>
        <ChevronGlyph className={styles.chevron} width={16} height={16} />
      </button>
      <Collapse id={`${id}-items`} open={open} className={styles.items}>
        {list}
      </Collapse>
    </div>
  );
}

export type SidebarItemProps = {
  label: string;
  /** Makes the item a link, rendered through the configured `linkComponent`. */
  href?: string;
  icon?: ReactNode;
  badge?: ReactNode;
  /** This is the current page: `aria-current="page"` and the active style. */
  active?: boolean;
  /** Draw the active style without claiming the page: the item a click is heading to, before the page arrives. */
  highlighted?: boolean;
  disabled?: boolean;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  className?: string;
};

/** One destination. A link when it has an `href`, otherwise a button. In a rail only the icon shows. */
export function SidebarItem({
  label,
  href,
  icon,
  badge,
  active = false,
  highlighted,
  disabled = false,
  onClick,
  className,
}: SidebarItemProps) {
  const { linkComponent: Link } = useLufia();
  const { collapsed } = useNavSurface();
  const looksActive = highlighted ?? active;
  const common = {
    className: [styles.item, className].filter(Boolean).join(" "),
    "data-active": looksActive || undefined,
    "aria-current": active ? ("page" as const) : undefined,
    // The label stays in the DOM as a rail's accessible name; the native tooltip tells sighted people what the icon is.
    title: collapsed ? label : undefined,
  };
  const content = (
    <>
      {icon ? (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className={styles.label}>{label}</span>
      {/* The flex layout ignores this space; it keeps "Inbox 3" from reading as "Inbox3" where it matters. */}{" "}
      {badge !== undefined && badge !== null && badge !== false ? (
        <span className={styles.badge}>{badge}</span>
      ) : null}
    </>
  );
  return (
    <li className={styles.entry}>
      {href && !disabled ? (
        <Link {...common} href={href} onClick={onClick}>
          {content}
        </Link>
      ) : (
        <button type="button" {...common} disabled={disabled} onClick={onClick}>
          {content}
        </button>
      )}
    </li>
  );
}
