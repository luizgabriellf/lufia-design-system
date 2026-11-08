"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { usePresence } from "../internal/usePresence";
import { FieldSpinner } from "../FormField/FieldSpinner";
import { useFocusTrap } from "../useFocusTrap";
import { useLufia } from "../LufiaProvider";
import styles from "./CommandPalette.module.css";

export type CommandItemTone = "default" | "accent" | "danger";

export type CommandItem = {
  key: string;
  label: string;
  /** Second line under the label. */
  description?: string;
  /** Heading of the group the command is listed under. Groups appear in the order they are first used. */
  group?: string;
  /** Decorative icon; hidden from assistive technology. */
  icon?: ReactNode;
  /**
   * Tints the icon: `accent` for create or assistant actions, `danger` for destructive ones. Default `default`. Never
   * the only cue: the label says what the command does.
   */
  tone?: CommandItemTone;
  /** Words that find the command but are never shown. */
  keywords?: string;
  /** Keep the palette open after the command runs (a command that shows its answer inside). */
  keepOpen?: boolean;
  onSelect: () => void;
};

export type CommandPaletteLabels = {
  /** Accessible name of the dialog and of the search field: "Search or run a command". */
  title: string;
  placeholder: string;
  /**
   * Shown when nothing matches. Return `null`, `undefined`, `false` or `""` to render no empty row at all, for example
   * when an error notice already explains the state.
   */
  empty: (query: string) => ReactNode;
  /** Announced politely as the list changes: "3 results". */
  resultCount: (count: number) => string;
  /**
   * Shown, with a spinner, below the listed commands while `loading` is true: "Searching…". It is also announced
   * politely each time `loading` turns on; keep it true across keystrokes to announce once. Without it `loading` shows nothing.
   */
  loading?: string;
};

export type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: readonly CommandItem[];
  labels: CommandPaletteLabels;
  /**
   * A tip about what can be searched. A node is shown while the field is empty. A function is called with the current
   * query on every render and decides for itself (return `null` to show nothing), so a hint can show for a short query
   * ("Type at least 2 characters"). It is not shown while `bodyOverride` is set.
   */
  hint?: ReactNode | ((state: { query: string }) => ReactNode | null);
  /** Where the hint sits: `bottom` (default) under the results, `top` above them so it stays in view in a long list. */
  hintPlacement?: "top" | "bottom";
  /**
   * Content above the results that does not replace them (an error from the server search, a warning about stale
   * results). It sits in a region outside the listbox, so it is not an option, and the arrows and Enter keep working
   * on the commands. The palette gives it no role: wrap an error in `role="alert"` and a plain note in nothing.
   */
  notice?: ReactNode;
  /**
   * Decides which commands match the query. Defaults to {@link filterCommands}: every word of the query, ignoring case
   * and accents, must appear in the label, description, group or keywords. Pass `() => true` when `items` already
   * comes filtered (a server search driven by `onQueryChange`).
   */
  filter?: (item: CommandItem, query: string) => boolean;
  /**
   * Called as the person types, for searches that ask a server: replace `items` with the answer, pass `filter={() => true}`
   * so the palette does not filter it again, and set `loading` while the request runs.
   */
  onQueryChange?: (query: string) => void;
  /**
   * A search is in flight: `aria-busy` on the results, the empty message waits, so "No results" does not flash before the
   * server answers, and `labels.loading` (when given) is shown below the commands and announced each time `loading` turns on.
   */
  loading?: boolean;
  /**
   * The order of the group headings, by name. Groups not listed follow, in the order they are first used; listed groups with
   * no results are left out. Default: the order of first use.
   */
  groupOrder?: readonly string[];
  /**
   * Replaces the results (and the empty message and hint) with your own content, such as an answer to the query. A function
   * gets the current query. While it is set the field is not a listbox: arrows and Enter do nothing, and the results are
   * not announced. The field keeps focus.
   */
  bodyOverride?: ReactNode | ((state: { query: string }) => ReactNode);
  /**
   * Called on Escape before the palette closes. Return `true` when you handled it (left a sub-mode, cleared an answer): the
   * palette then stays open, and the next Escape closes it. Return anything else to close.
   */
  onEscape?: () => boolean | void;
  /** Open on Ctrl+K and Cmd+K. Default `true`. */
  shortcut?: boolean;
  /** Where the palette is mounted. Defaults to `document.body`. */
  container?: HTMLElement | null;
};

const normalize = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase();

/** The default matcher: every word of `query` appears, ignoring case and accents, in the label, description, group or keywords. */
export function filterCommands(item: CommandItem, query: string): boolean {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = normalize(
    [item.label, item.description, item.group, item.keywords].filter(Boolean).join(" "),
  );
  return words.every((word) => haystack.includes(word));
}

const subscribeNothing = () => () => {};

/**
 * A search-and-run overlay opened with Ctrl+K or Cmd+K. It follows the WAI-ARIA APG "Combobox with listbox popup"
 * pattern inside a modal dialog: the text field keeps focus, Up and Down move a highlighted option that the field points
 * at with `aria-activedescendant`, and Enter runs it. Escape, a tap on the dimmed page or the close button closes it, and
 * focus returns to where it was.
 */
export function CommandPalette({
  open,
  onOpenChange,
  items,
  labels,
  hint,
  hintPlacement = "bottom",
  notice,
  filter = filterCommands,
  onQueryChange,
  loading = false,
  groupOrder,
  bodyOverride,
  onEscape,
  shortcut = true,
  container,
}: CommandPaletteProps) {
  const { labels: lufia } = useLufia();
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const client = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
  const { phase, finish } = usePresence(open, panel);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  // A new opening starts clean.
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) {
      setQuery("");
      setActive(0);
    }
  }

  const results = useMemo(() => items.filter((item) => filter(item, query)), [items, filter, query]);
  const groups = useMemo(() => {
    const order: string[] = [];
    const byGroup = new Map<string, CommandItem[]>();
    for (const item of results) {
      const name = item.group ?? "";
      if (!byGroup.has(name)) {
        byGroup.set(name, []);
        order.push(name);
      }
      byGroup.get(name)!.push(item);
    }
    const ranked = groupOrder ? groupOrder.filter((name) => byGroup.has(name)) : [];
    const rest = order.filter((name) => !ranked.includes(name));
    return [...ranked, ...rest].map((name) => ({ name, items: byGroup.get(name)! }));
  }, [results, groupOrder]);
  // The flat reading order is the order of the groups, which can differ from `results` when groups interleave.
  const flat = useMemo(() => groups.flatMap((group) => group.items), [groups]);
  const activeIndex = Math.min(active, Math.max(flat.length - 1, 0));
  // Derived from the command's key, not its position, so the id (and `aria-activedescendant`) follows the option.
  const optionIdOf = (item: CommandItem) => `${id}-option-${item.key.replace(/\s/g, "_")}`;
  const activeId = flat[activeIndex] ? optionIdOf(flat[activeIndex]) : undefined;

  const close = () => onOpenChange(false);
  const overridden = bodyOverride !== undefined && bodyOverride !== null && bodyOverride !== false;
  useFocusTrap(phase === "open", panel, {
    onEscape: () => {
      if (onEscape?.() !== true) close();
    },
    initialFocus: field,
    inertBackground: true,
  });

  // Ctrl+K / Cmd+K opens the palette from anywhere. It leaves the key alone when something else already handled it (an
  // editor's "insert link"), during IME composition, on key repeat, and while another modal is open. It does not toggle:
  // Escape closes, and handling it is the focus trap's job.
  useEffect(() => {
    if (!shortcut || open) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing || event.repeat) return;
      if (!(event.metaKey || event.ctrlKey) || event.altKey || event.key.toLowerCase() !== "k") return;
      if (document.querySelector('[aria-modal="true"]')) return;
      event.preventDefault();
      onOpenChange(true);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [shortcut, open, onOpenChange]);

  // Keep the highlighted option in sight.
  useEffect(() => {
    if (phase !== "open") return;
    if (activeId) document.getElementById(activeId)?.scrollIntoView?.({ block: "nearest" });
  }, [activeId, phase]);

  const run = (item: CommandItem) => {
    if (!item.keepOpen) close();
    item.onSelect();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (overridden) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive(flat.length ? (activeIndex + 1) % flat.length : 0);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(flat.length ? (activeIndex - 1 + flat.length) % flat.length : 0);
    } else if (event.key === "Enter") {
      const item = flat[activeIndex];
      if (item) {
        event.preventDefault();
        run(item);
      }
    }
  };

  const target = container ?? (client ? document.body : null);
  if (phase === "unmounted" || !target) return null;

  const listId = `${id}-list`;
  const hintNode = overridden
    ? null
    : typeof hint === "function"
      ? hint({ query })
      : query.trim()
        ? null
        : hint;
  const hintRow = hintNode ? <p className={styles.hint}>{hintNode}</p> : null;
  const searching = loading && !overridden && labels.loading;
  const expanded = flat.length > 0 && !overridden;
  const emptyContent = !overridden && !expanded && !loading ? labels.empty(query.trim()) : null;
  let index = -1;

  return createPortal(
    <div className={styles.root} data-state={phase === "open" ? "open" : "closed"}>
      <div className={styles.backdrop} onClick={close} aria-hidden="true" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={labels.title}
        tabIndex={-1}
        className={styles.panel}
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget) finish();
        }}
      >
        <div className={styles.header}>
          <svg
            className={styles.glyph}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
            focusable="false"
          >
            <circle cx="11" cy="11" r="6" />
            <path d="m20 20-4.2-4.2" />
          </svg>
          <input
            ref={field}
            className={styles.input}
            type="text"
            role="combobox"
            aria-label={labels.title}
            aria-expanded={expanded}
            aria-controls={expanded ? listId : undefined}
            aria-activedescendant={expanded ? activeId : undefined}
            aria-autocomplete="list"
            autoComplete="off"
            spellCheck={false}
            placeholder={labels.placeholder}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
              onQueryChange?.(event.target.value);
            }}
            onKeyDown={onKeyDown}
          />
          <kbd className={styles.escape} aria-hidden="true">
            Esc
          </kbd>
          <button type="button" className={styles.close} aria-label={lufia.close} onClick={close}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        {(hintPlacement === "top" && hintRow) || (!overridden && notice) ? (
          <div className={styles.pinned} data-pinned="">
            {hintPlacement === "top" ? hintRow : null}
            {!overridden && notice ? <div className={styles.notice}>{notice}</div> : null}
          </div>
        ) : null}
        <div className={styles.body}>
          <div aria-busy={loading || undefined}>
            {overridden ? (
              typeof bodyOverride === "function" ? (
                bodyOverride({ query })
              ) : (
                bodyOverride
              )
            ) : expanded ? (
              <div id={listId} role="listbox" aria-label={labels.title} className={styles.list}>
                {groups.map((group, groupIndex) => {
                  const headingId = `${id}-group-${groupIndex}`;
                  return (
                    <div
                      key={group.name}
                      role="group"
                      aria-labelledby={group.name ? headingId : undefined}
                      className={styles.group}
                    >
                      {group.name ? (
                        <p id={headingId} className={styles.heading} role="presentation">
                          {group.name}
                        </p>
                      ) : null}
                      {group.items.map((item) => {
                        index += 1;
                        const position = index;
                        return (
                          // APG: options are never focusable, focus stays on the field and `aria-activedescendant` points
                          // at the highlighted one; keyboard users run it with Enter on the field.
                          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus
                          <div
                            key={item.key}
                            id={optionIdOf(item)}
                            role="option"
                            aria-selected={position === activeIndex}
                            data-active={position === activeIndex || undefined}
                            className={styles.option}
                            onMouseMove={() => position !== activeIndex && setActive(position)}
                            onClick={() => run(item)}
                          >
                            {item.icon ? (
                              <span
                                className={styles.icon}
                                data-tone={item.tone && item.tone !== "default" ? item.tone : undefined}
                                aria-hidden="true"
                              >
                                {item.icon}
                              </span>
                            ) : null}
                            <span className={styles.copy}>
                              <span className={styles.label}>{item.label}</span>
                              {item.description ? (
                                <span className={styles.description}>{item.description}</span>
                              ) : null}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ) : loading || !emptyContent ? null : (
              <p className={styles.empty}>{emptyContent}</p>
            )}
            {searching ? (
              <div className={styles.searching} data-loading-row="" aria-hidden="true">
                <FieldSpinner />
                <span>{labels.loading}</span>
              </div>
            ) : null}
          </div>
          {hintPlacement === "bottom" ? hintRow : null}
        </div>
        <p className={styles.status} role="status">
          {searching
            ? labels.loading
            : query.trim() && !overridden && !loading
              ? labels.resultCount(flat.length)
              : ""}
        </p>
      </div>
    </div>,
    target,
  );
}
