"use client";

import { useState } from "react";
import { SidebarGroup, SidebarItem } from "./Sidebar";
import { findActiveNavKey, type ShellNavGroup, type ShellNavItem } from "./navigation";

export type ShellNavigationProps = {
  groups: readonly ShellNavGroup[];
  /** The path being shown. Items whose `href` it equals or sits under are current. */
  currentPath?: string;
  /** Takes over from `currentPath`: return true for the current item. The first match wins. */
  isActive?: (item: ShellNavItem) => boolean;
  /** Keys of the open collapsible groups. */
  openGroups: readonly string[];
  onToggleGroup: (key: string, open: boolean) => void;
  /** Key of the item a click is heading to: it looks active before the page arrives, `aria-current` stays put. */
  pendingKey?: string;
  /** An item was chosen by a plain click or by keyboard (not an open-in-new-tab click). */
  onItemChoose?: (item: ShellNavItem) => void;
};

/** Renders `ShellNavGroup` data as `SidebarGroup` and `SidebarItem`, for the sidebar and the navigation sheet alike. */
export function ShellNavigation({
  groups,
  currentPath,
  isActive,
  openGroups,
  onToggleGroup,
  pendingKey,
  onItemChoose,
}: ShellNavigationProps) {
  const activeKey = findActiveNavKey(groups, currentPath, isActive);
  return (
    <>
      {groups.map((group) => {
        const open = openGroups.includes(group.key);
        return (
          <SidebarGroup
            key={group.key}
            label={group.label}
            icon={group.icon}
            collapsible={group.collapsible}
            open={open}
            onOpenChange={(next) => onToggleGroup(group.key, next)}
            current={group.items.some((item) => item.key === activeKey)}
          >
            {group.items.map((item) => (
              <SidebarItem
                key={item.key}
                label={item.label}
                ariaLabel={item.ariaLabel}
                href={item.href}
                icon={item.icon}
                badge={item.badge}
                disabled={item.disabled}
                active={item.key === activeKey}
                highlighted={pendingKey ? item.key === pendingKey : item.key === activeKey}
                onClick={(event) => {
                  const modified =
                    event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
                  if (item.href && modified) return;
                  item.onSelect?.();
                  onItemChoose?.(item);
                }}
              />
            ))}
          </SidebarGroup>
        );
      })}
    </>
  );
}

/**
 * Which collapsible groups are open, for uncontrolled use. The groups marked `defaultOpen` and the one holding the
 * current page start open, and arriving on a page inside a closed group opens it again until the person closes it.
 */
export function useGroupDisclosure(
  groups: readonly ShellNavGroup[],
  activeGroupKey: string | undefined,
  controlled: readonly string[] | undefined,
  onChange: ((keys: readonly string[]) => void) | undefined,
  defaultOpen: readonly string[] | undefined,
) {
  const [inner, setInner] = useState<readonly string[]>(() => {
    const initial = defaultOpen ?? groups.filter((group) => group.defaultOpen).map((group) => group.key);
    return activeGroupKey && !initial.includes(activeGroupKey) ? [...initial, activeGroupKey] : initial;
  });
  const [seen, setSeen] = useState(activeGroupKey);
  if (seen !== activeGroupKey) {
    setSeen(activeGroupKey);
    if (controlled === undefined && activeGroupKey && !inner.includes(activeGroupKey)) {
      setInner([...inner, activeGroupKey]);
    }
  }
  const open = controlled ?? inner;
  const toggle = (key: string, next: boolean) => {
    const keys = next ? [...open.filter((k) => k !== key), key] : open.filter((k) => k !== key);
    if (controlled === undefined) setInner(keys);
    onChange?.(keys);
  };
  return { open, toggle };
}
