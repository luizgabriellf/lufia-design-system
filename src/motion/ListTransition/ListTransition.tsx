"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import { usePresence } from "../../components/internal/usePresence";
import { usePrefersReducedMotion } from "../usePrefersReducedMotion";
import styles from "./ListTransition.module.css";

export type ListTransitionProps<T> = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  /**
   * The list element. `ul` and `ol` render each item as an `li`; `div` renders each item as a `div`. Default `ul`.
   * The item element is rendered by this component, so `ul > li` stays valid.
   */
  as?: "ul" | "ol" | "div";
  /** The items, in display order. Items present on the first render do not animate. */
  items: readonly T[];
  /** A stable, unique key of an item. A new key enters; a key that disappears leaves. Never use the index. */
  getKey: (item: T) => string | number;
  /**
   * Renders the content of one item. Do not return an `li`: the component renders it, with the item's classes, `data-state`
   * and the `inert` and `aria-hidden` of a leaving item. While an item leaves, it keeps rendering its last `item`, and its
   * form controls are disabled, so they drop out of form submission and constraint validation.
   */
  children: (item: T) => ReactNode;
  /** Class name for every item element (the `li`). */
  itemClassName?: string;
  /** Ref to the list element. */
  ref?: Ref<HTMLElement>;
};

type Entry<T> = { key: string | number; item: T; present: boolean; animate: boolean };

/** Survivors in `items` order; entries that left stay where they were, after their nearest remaining predecessor. */
function merge<T>(
  previous: readonly Entry<T>[],
  items: readonly T[],
  getKey: (item: T) => string | number,
  keepLeaving: boolean,
): Entry<T>[] {
  const before = new Map(previous.map((entry) => [entry.key, entry]));
  const next: Entry<T>[] = items.map((item) => {
    const key = getKey(item);
    const old = before.get(key);
    return { key, item, present: true, animate: old ? old.animate : true };
  });
  if (!keepLeaving) return next;
  const gone = previous.filter((entry) => !next.some((candidate) => candidate.key === entry.key));
  let anchor = -1;
  for (const entry of previous) {
    const index = next.findIndex((candidate) => candidate.key === entry.key);
    if (index >= 0) {
      anchor = index;
      continue;
    }
    if (!gone.includes(entry)) continue;
    next.splice(anchor + 1, 0, { ...entry, present: false, animate: true });
    anchor += 1;
  }
  return next;
}

function sameEntries<T>(a: readonly Entry<T>[], b: readonly Entry<T>[]) {
  return (
    a.length === b.length &&
    a.every((entry, i) => {
      const other = b[i]!;
      return (
        entry.key === other.key &&
        entry.item === other.item &&
        entry.present === other.present &&
        entry.animate === other.animate
      );
    })
  );
}

type RowProps<T> = {
  entry: Entry<T>;
  as: "li" | "div";
  className?: string;
  onGone: (key: string | number) => void;
  children: (item: T) => ReactNode;
};

function Row<T>({ entry, as: Tag, className, onGone, children }: RowProps<T>) {
  const ref = useRef<HTMLElement>(null);
  const { phase, finish } = usePresence(entry.present, ref, { skipWhenNotRendered: true });

  // The item is inert from the commit on, which makes the browser drop focus inside it at the next rendering step. Before
  // that, hand focus to the list when the list can take it (`tabIndex`); otherwise it is the consumer's to place.
  useLayoutEffect(() => {
    if (entry.present) return;
    const element = ref.current;
    const list = element?.parentElement;
    if (element && list && list.hasAttribute("tabindex") && element.contains(document.activeElement))
      list.focus();
  }, [entry.present]);

  useEffect(() => {
    if (!entry.present && phase === "unmounted") onGone(entry.key);
  }, [entry.present, entry.key, phase, onGone]);

  if (phase === "unmounted") return null;

  const leaving = phase === "closed";
  return (
    <Tag
      ref={ref as Ref<never>}
      className={[styles.item, className].filter(Boolean).join(" ")}
      data-state={phase}
      data-animate={entry.animate ? "" : undefined}
      inert={leaving}
      aria-hidden={leaving ? true : undefined}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) finish();
      }}
    >
      <fieldset className={styles.inner} role="none" disabled={leaving}>
        {children(entry.item)}
      </fieldset>
    </Tag>
  );
}

/**
 * A list whose items animate in and out as they are added to and removed from `items`.
 *
 * The component renders the list and every item element (`ul > li`), so the list semantics hold while the height animates
 * (the `0fr` to `1fr` technique of `Collapse`, plus opacity). A removed item stays mounted, `inert` and `aria-hidden`,
 * until its exit ends (it still renders its last data), then unmounts. Adding a key that is still leaving brings the same
 * item back. Under `prefers-reduced-motion` items appear and disappear at once. A leaving item that is not rendered (the
 * list sits under a `hidden` ancestor) unmounts at once.
 *
 * Forms: the content of every item sits in a `fieldset` (`role="none"`) that is `disabled` while the item leaves, so its
 * named controls are left out of `FormData` and an empty `required` control in it cannot block submit. Tests: a leaving
 * item stays in the DOM until its exit ends, so query `:enabled` controls or wait for `[data-state="closed"]` to be gone.
 *
 * Focus: a leaving item cannot keep focus, because it is `inert`. When the list element has a `tabIndex`, focus moves to it;
 * otherwise the browser falls back to the document, so move focus yourself (for example to the next item or an add button)
 * in the handler that removes the item. Items render as `display: grid`, so the native list marker is not drawn: style
 * markers yourself.
 */
export function ListTransition<T>({
  as = "ul",
  items,
  getKey,
  children,
  itemClassName,
  ...rest
}: ListTransitionProps<T>) {
  const reduced = usePrefersReducedMotion();
  const [entries, setEntries] = useState<Entry<T>[]>(() =>
    items.map((item) => ({ key: getKey(item), item, present: true, animate: false })),
  );

  // Derive the entries from `items` while rendering: React re-renders at once, with no extra effect pass.
  const next = merge(entries, items, getKey, !reduced);
  if (!sameEntries(entries, next)) setEntries(next);

  const onGone = useCallback(
    (key: string | number) =>
      setEntries((current) => current.filter((entry) => entry.present || entry.key !== key)),
    [],
  );

  const List = as;
  const ItemTag = as === "div" ? "div" : "li";
  return (
    <List {...(rest as HTMLAttributes<HTMLElement>)}>
      {entries.map((entry) => (
        <Row key={entry.key} entry={entry} as={ItemTag} className={itemClassName} onGone={onGone}>
          {children}
        </Row>
      ))}
    </List>
  );
}
