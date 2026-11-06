"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Button } from "../Button";
import type { FloatBarDataAttributes } from "./MobileFloatBar";
import styles from "./AppShell.module.css";

export type AppShellPrimaryAction = {
  label: string;
  icon?: ReactNode;
  href?: string;
  onSelect?: () => void;
  /** `data-*` attributes for the floating-bar button (analytics hooks, guided-tour anchors). */
  data?: FloatBarDataAttributes;
};

type Registration = { id: symbol; action: AppShellPrimaryAction };

export type ShellPrimaryActionRegistry = {
  /** The action to show: the latest registered one, else the shell's `primaryAction` prop. */
  action: AppShellPrimaryAction | undefined;
  register: (id: symbol, action: AppShellPrimaryAction) => void;
  unregister: (id: symbol) => void;
};

export const ShellPrimaryActionContext = createContext<ShellPrimaryActionRegistry | null>(null);

/** The registry state of one shell: registrations come and go with the pages that make them. */
export function useShellPrimaryActionRegistry(
  fallback: AppShellPrimaryAction | undefined,
): ShellPrimaryActionRegistry {
  const [registered, setRegistered] = useState<readonly Registration[]>([]);
  // A page that is already registered is updated where it stands; only a new registrant goes to the end (and wins).
  const register = useCallback(
    (id: symbol, action: AppShellPrimaryAction) =>
      setRegistered((all) =>
        all.some((entry) => entry.id === id)
          ? all.map((entry) => (entry.id === id ? { id, action } : entry))
          : [...all, { id, action }],
      ),
    [],
  );
  const unregister = useCallback(
    (id: symbol) => setRegistered((all) => all.filter((entry) => entry.id !== id)),
    [],
  );
  const action = registered[registered.length - 1]?.action ?? fallback;
  return useMemo(() => ({ action, register, unregister }), [action, register, unregister]);
}

/**
 * Hands the page's one main action to the shell, which shows it on the floating bar (phones) and wherever a
 * `ShellPrimaryActionSlot` sits (wide screens). Pass `null` to register nothing. When several pages are mounted at once the
 * latest registration wins, and the previous one comes back when it unmounts.
 *
 * Returns whether a shell hosts the action. When it does, leave your own trigger out; outside a shell keep it. The shell
 * re-registers when `label` or `href` change; `icon` and `data` are read at that moment, `onSelect` is always the latest.
 */
export function useShellPrimaryAction(action: AppShellPrimaryAction | null): boolean {
  const shell = useContext(ShellPrimaryActionContext);
  const register = shell?.register;
  const unregister = shell?.unregister;
  const [id] = useState(() => Symbol("shell-primary-action"));
  const latest = useRef(action);
  useEffect(() => {
    latest.current = action;
  });
  const label = action?.label;
  const href = action?.href;

  // Registering again on a change updates the entry in place; unregistering is tied to the page going away (or to having
  // no action), so a label change does not send the page to the back of the line.
  useEffect(() => {
    if (!register || label === undefined) return;
    const { icon, data } = latest.current ?? {};
    register(id, { label, href, icon, data, onSelect: () => latest.current?.onSelect?.() });
  }, [register, id, label, href]);
  const present = label !== undefined;
  useEffect(() => {
    if (!unregister || !present) return;
    return () => unregister(id);
  }, [unregister, id, present]);

  return shell !== null && action !== null;
}

/**
 * Where the shell's primary action shows on wide screens: put it in the page header. Renders nothing when no action is
 * registered, outside a shell, and on phones (the floating bar carries it there).
 */
export function ShellPrimaryActionSlot({ className }: { className?: string }) {
  const action = useContext(ShellPrimaryActionContext)?.action;
  if (!action) return null;
  const classes = [styles.primarySlot, className].filter(Boolean).join(" ");
  return action.href !== undefined ? (
    <Button
      {...action.data}
      variant="primary"
      href={action.href}
      iconStart={action.icon}
      className={classes}
      onClick={action.onSelect}
    >
      {action.label}
    </Button>
  ) : (
    <Button
      {...action.data}
      variant="primary"
      iconStart={action.icon}
      className={classes}
      onClick={action.onSelect}
    >
      {action.label}
    </Button>
  );
}
