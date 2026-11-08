"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
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
  /**
   * A longer description of what the action does. The shell does not draw it; read it with
   * `useShellPrimaryActionState` to list the action elsewhere (a command palette's actions group).
   */
  description?: string;
  icon?: ReactNode;
  href?: string;
  onSelect?: () => void;
  /**
   * Called when the person shows intent: the pointer enters the control or it receives focus. Warm the destination here
   * (a router prefetch, a code chunk); it can fire often, so keep it cheap and idempotent.
   */
  onIntent?: () => void;
  /** `data-*` attributes for the floating-bar button (analytics hooks, guided-tour anchors). */
  data?: FloatBarDataAttributes;
};

type Registration = { id: symbol; action: AppShellPrimaryAction };

export type ShellPrimaryActionRegistry = {
  /** The action to show: the latest registered one, else the shell's `primaryAction` prop. */
  action: AppShellPrimaryAction | undefined;
  /** `action` is the shell's own default, because no page has registered one. */
  isFallback: boolean;
  /** Whether wide screens show the shell's default action while no page has registered one. */
  desktopFallback: boolean;
  register: (id: symbol, action: AppShellPrimaryAction) => void;
  unregister: (id: symbol) => void;
};

export const ShellPrimaryActionContext = createContext<ShellPrimaryActionRegistry | null>(null);

/** Layout effects run before paint, so a client navigation never paints the previous page's action. */
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** The registry state of one shell: registrations come and go with the pages that make them. */
export function useShellPrimaryActionRegistry(
  fallback: AppShellPrimaryAction | undefined,
  desktopFallback = true,
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
  const isFallback = registered.length === 0;
  return useMemo(
    () => ({ action, isFallback, desktopFallback, register, unregister }),
    [action, isFallback, desktopFallback, register, unregister],
  );
}

/**
 * Hands the page's one main action to the shell, which shows it on the floating bar (phones) and wherever a
 * `ShellPrimaryActionSlot` sits (wide screens). Pass `null` to register nothing. When several pages are mounted at once the
 * latest registration wins, and the previous one comes back when it unmounts.
 *
 * Returns whether a shell hosts the action. When it does, leave your own trigger out; outside a shell keep it. The shell
 * re-registers when `label`, `href` or `description` change; `icon` and `data` are read at that moment, `onSelect` is
 * always the latest. It registers before the browser paints, so a client navigation never shows the previous page's action;
 * for the first server render, see `ShellPrimaryActionOwner`.
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
  const description = action?.description;

  // Registering again on a change updates the entry in place; unregistering is tied to the page going away (or to having
  // no action), so a label change does not send the page to the back of the line.
  useIsomorphicLayoutEffect(() => {
    if (!register || label === undefined) return;
    const { icon, data, onIntent } = latest.current ?? {};
    register(id, {
      label,
      description,
      href,
      icon,
      data,
      onSelect: () => latest.current?.onSelect?.(),
      onIntent: onIntent ? () => latest.current?.onIntent?.() : undefined,
    });
  }, [register, id, label, href, description]);
  const present = label !== undefined;
  useIsomorphicLayoutEffect(() => {
    if (!unregister || !present) return;
    return () => unregister(id);
  }, [unregister, id, present]);

  return shell !== null && action !== null;
}

/** What `useShellPrimaryActionState` returns: the action the shell shows now, and whose it is. */
export type ShellPrimaryActionState = {
  /** The latest registered action, else the shell's `primaryAction`; `undefined` when there is neither. */
  action: AppShellPrimaryAction | undefined;
  /** `action` is the shell's own default, because no page has registered one. */
  isFallback: boolean;
};

/**
 * Reads the shell's current primary action without registering one: to list it in a command palette, a keyboard
 * shortcut or a help panel, in step with the floating bar. `null` outside a shell. `onSelect` and `onIntent` call the
 * registering page's latest handlers.
 */
export function useShellPrimaryActionState(): ShellPrimaryActionState | null {
  const registry = useContext(ShellPrimaryActionContext);
  const action = registry?.action;
  const isFallback = registry?.isFallback ?? true;
  return useMemo(() => (registry ? { action, isFallback } : null), [registry, action, isFallback]);
}

/**
 * Server-rendered mark of a page that registers its own primary action. A page registers only once it hydrates, so on a
 * hard load the shell's default would show first and then be replaced. Render this anywhere in the page (it is an empty,
 * `hidden` element) and the shell keeps its default out of sight, on the floating bar and in `ShellPrimaryActionSlot`,
 * for as long as the mark is in the page. Its place is kept, so nothing moves when the page's action arrives.
 */
export function ShellPrimaryActionOwner() {
  return <span hidden data-lufia-shell-primary-owner="" />;
}

/**
 * Where the shell's primary action shows on wide screens: put it in the page header. Renders nothing when no action is
 * registered, outside a shell, and on phones (the floating bar carries it there). With `desktopPrimaryFallback={false}` on
 * the shell it also stays empty until a page registers its own, so the default never flashes in the wrong place on a hard load.
 */
export function ShellPrimaryActionSlot({ className }: { className?: string }) {
  const registry = useContext(ShellPrimaryActionContext);
  const action = registry?.action;
  if (!action || (registry.isFallback && !registry.desktopFallback)) return null;
  const classes = [styles.primarySlot, className].filter(Boolean).join(" ");
  const intent = {
    onPointerEnter: action.onIntent,
    onFocus: action.onIntent,
    "data-fallback": registry.isFallback || undefined,
  };
  return action.href !== undefined ? (
    <Button
      {...action.data}
      {...intent}
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
      {...intent}
      variant="primary"
      iconStart={action.icon}
      className={classes}
      onClick={action.onSelect}
    >
      {action.label}
    </Button>
  );
}
