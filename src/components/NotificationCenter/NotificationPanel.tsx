"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from "react";
import { ChangeHighlight, Skeleton, usePrefersReducedMotion } from "../../motion";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { EmptyState } from "../EmptyState";
import { IconButton } from "../IconButton";
import { LufiaLink, useLufia } from "../LufiaProvider";
import { NotificationActionContext } from "./context";
import { useSlidingIndicator } from "../useSlidingIndicator";
import { VisuallyHidden } from "../VisuallyHidden";
import type {
  NotificationEmpty,
  NotificationFooter,
  NotificationGroup,
  NotificationItem,
  NotificationTab,
} from "./types";
import { useUnreadAnnouncement } from "./useUnreadAnnouncement";
import styles from "./NotificationPanel.module.css";

/** What a notification centre shows: shared by `NotificationPanel` and `NotificationCenter`. */
export type NotificationContentProps = {
  /** The panel's heading and, on a landmark panel, its accessible name ("Notifications"). */
  label: string;
  /** How many notifications are unread, across every tab. Drives the badge, "Mark all as read" and the live region. */
  unreadCount: number;
  /** Read before the title of an unread row, so the state is not carried by the dot alone ("unread"). */
  unreadLabel: string;
  /** Says a count in words ("4 unread"). Used for the hidden text of the badge and the live region. */
  unreadCountLabel: (count: number) => string;
  /** The tabs, in order. Without them the panel is one list. Tabs are the caller's: "All", "Approvals", "Stock". */
  tabs?: readonly NotificationTab[];
  /** Key of the chosen tab. Controlled. */
  activeTab?: string;
  /** Initial tab when `activeTab` is not given. Defaults to the first. */
  defaultActiveTab?: string;
  /** Called with the key of the tab the person chose. */
  onTabChange?: (key: string) => void;
  /** Every notification, newest first. Tabs and groups pick from this one list. */
  items: readonly NotificationItem[];
  /** The headings, in order. Items are placed by `NotificationItem.group`. Without groups the list has no headings. */
  groups?: readonly NotificationGroup[];
  /** A highlight above the list, usually a `NotificationSummary`. It shows under every tab. */
  summary?: ReactNode;
  /** Runs when "Mark all as read" is pressed. The button shows when this and `markAllLabel` are set. */
  onMarkAllRead?: () => void;
  /** Text of the mark-all action ("Mark all as read"). */
  markAllLabel?: string;
  /** The link or button at the bottom ("Notification settings"), with a chevron. */
  footer?: NotificationFooter;
  /** Shows skeleton rows in place of the list. */
  loading?: boolean;
  /** Name of the loading state, read once as a polite status ("Loading notifications"). */
  loadingLabel?: string;
  /** What to show when the chosen tab has no items. A tab's own `empty` wins. */
  empty?: NotificationEmpty;
  /** Replaces the list when loading failed. It is announced as an alert; include the way to retry. */
  error?: ReactNode;
};

export type NotificationPanelProps = Omit<HTMLAttributes<HTMLElement>, "children" | "title"> &
  NotificationContentProps & {
    /** Adds a close button to the header, for a panel shown as a sheet. */
    onClose?: () => void;
    /**
     * Receives what a row, the footer or the summary's action is about to do, so a host can close itself first and run it once
     * focus is back where it belongs. Omit it and the action runs at once.
     */
    onAction?: (run: () => void) => void;
    /** Id of the heading, for a host that names its dialog with it. Generated when omitted. */
    titleId?: string;
    /**
     * Whether the root is a labelled region (`<section>`). Default `true`. A host that already names the panel, such as the
     * dialog of `NotificationCenter`, sets `false` to get a plain element.
     */
    landmark?: boolean;
    /** Renders the polite live region that announces changes of `unreadCount`. Default `true`; a host that has its own turns it off. */
    announce?: boolean;
    ref?: Ref<HTMLElement>;
  };

const SKELETON_ROWS = 4;
/** Rows past this one enter together with it, so the whole entrance stays short. */
const STAGGER_LIMIT = 6;
/** How long the entrance, the arrival highlight and the mark-all cascade stay switched on: past their longest animation. */
const INTRO_MS = 700;
const ARRIVAL_MS = 900;
const CASCADE_MS = 700;
/** Where the arrows go in a tab row. */
const ROW_ENDS = ["Home", "End"];

function ChevronIcon() {
  return (
    <svg viewBox="0 0 16 16" width="1rem" height="1rem" fill="none" focusable="false" aria-hidden="true">
      <path
        d="M6 3.5 10.5 8 6 12.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" width="1rem" height="1rem" fill="none" focusable="false" aria-hidden="true">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/**
 * The content of a notification centre, without the bell: a header with the unread count and "Mark all as read", tabs, an
 * optional highlight, grouped rows, a footer link, and the loading, empty and error states. `NotificationCenter` shows it in
 * a popover or a sheet; mount it directly to host it in a page.
 *
 * The tabs follow the WAI-ARIA tabs pattern (automatic activation) and share one tab panel, whose list is filtered by the
 * chosen tab. Rows are links or buttons, in lists under a heading per group; an unread row says so in text.
 */
export function NotificationPanel({
  label,
  unreadCount,
  unreadLabel,
  unreadCountLabel,
  tabs,
  activeTab,
  defaultActiveTab,
  onTabChange,
  items,
  groups,
  summary,
  onMarkAllRead,
  markAllLabel,
  footer,
  loading = false,
  loadingLabel,
  empty,
  error,
  onClose,
  onAction,
  titleId,
  landmark = true,
  announce = true,
  className,
  ref,
  ...rest
}: NotificationPanelProps) {
  const { labels } = useLufia();
  const baseId = useId();
  const headingId = titleId ?? `${baseId}-title`;
  const panelId = `${baseId}-panel`;
  // Ids come from the position, not the key: a key is the caller's text and may hold characters an id or a selector dislikes.
  const tabId = (index: number) => `${baseId}-tab-${index}`;
  const tabRefs = useRef(new Map<number, HTMLButtonElement>());
  const [inner, setInner] = useState(defaultActiveTab);
  const message = useUnreadAnnouncement(unreadCount, (count) => `${label}, ${unreadCountLabel(count)}`);
  const reduced = usePrefersReducedMotion();
  const tabsRef = useRef<HTMLDivElement>(null);

  const tabList = tabs ?? [];
  const requested = activeTab ?? inner ?? tabList[0]?.key;
  const currentIndex = Math.max(
    0,
    tabList.findIndex((tab) => tab.key === requested),
  );
  const current = tabList[currentIndex];
  const indicator = useSlidingIndicator(tabsRef, `[data-tab-index="${currentIndex}"]`, currentIndex);

  // Motion state. Each piece is compared while rendering, so the first frame after a change already carries it, and each
  // one switches itself off once its animation is over: a tab switch remounts the rows and must not replay them.
  const [intro, setIntro] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setIntro(false), INTRO_MS);
    return () => window.clearTimeout(timer);
  }, []);
  // The list crossfades when the tab changes, never on the first paint.
  const [shownTab, setShownTab] = useState(current?.key);
  const [crossfade, setCrossfade] = useState(false);
  if (shownTab !== current?.key) {
    setShownTab(current?.key);
    setCrossfade(true);
  }
  // Items that arrive while the panel is open enter at the top.
  // What is on screen when the list first finishes loading is the baseline, not an arrival: a list fetched on open must not
  // flash as if every row had just come in.
  const [seen, setSeen] = useState(() => new Set(items.map((item) => item.id)));
  const [baselined, setBaselined] = useState(!loading);
  const [arrived, setArrived] = useState<ReadonlySet<string>>(() => new Set());
  if (!baselined && !loading) {
    setBaselined(true);
    setSeen(new Set(items.map((item) => item.id)));
  } else if (baselined && !loading) {
    const newcomers = items.filter((item) => !seen.has(item.id)).map((item) => item.id);
    if (newcomers.length > 0) {
      setSeen(new Set([...seen, ...newcomers]));
      setArrived(new Set(newcomers));
    }
  }
  useEffect(() => {
    if (arrived.size === 0) return;
    const timer = window.setTimeout(() => setArrived(new Set()), ARRIVAL_MS);
    return () => window.clearTimeout(timer);
  }, [arrived]);
  // A tab row that does not fit scrolls sideways; the edge that hides more tabs fades, so the clipping is not silent.
  useEffect(() => {
    const row = tabsRef.current;
    if (!row) return;
    const mark = () => {
      const start = Math.abs(row.scrollLeft) > 2;
      const end = Math.abs(row.scrollLeft) + row.clientWidth < row.scrollWidth - 2;
      if (start || end) row.dataset.more = start && end ? "both" : start ? "start" : "end";
      else delete row.dataset.more;
    };
    mark();
    row.addEventListener("scroll", mark, { passive: true });
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(mark) : null;
    observer?.observe(row);
    return () => {
      row.removeEventListener("scroll", mark);
      observer?.disconnect();
    };
  }, [tabList.length]);
  // Keep the chosen tab in sight when the row scrolls.
  useEffect(() => {
    tabRefs.current.get(currentIndex)?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
  }, [currentIndex]);
  // "Mark all as read" settles the rows top to bottom, a short step apart.
  const [cascade, setCascade] = useState(false);
  useEffect(() => {
    if (!cascade) return;
    const timer = window.setTimeout(() => setCascade(false), CASCADE_MS);
    return () => window.clearTimeout(timer);
  }, [cascade]);

  const choose = (key: string) => {
    // Compare with what the caller asked for, not what is shown: a controlled `activeTab` that matches no tab shows the first
    // one, and choosing that one is still a change the caller has to hear about.
    if (key === requested && tabList.some((tab) => tab.key === key)) return;
    setInner(key);
    onTabChange?.(key);
  };

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = tabList.length - 1;
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const forward = rtl ? "ArrowLeft" : "ArrowRight";
    const backward = rtl ? "ArrowRight" : "ArrowLeft";
    let target = -1;
    if (event.key === forward) target = index === last ? 0 : index + 1;
    else if (event.key === backward) target = index === 0 ? last : index - 1;
    else if (ROW_ENDS.includes(event.key)) target = event.key === "Home" ? 0 : last;
    if (target < 0) return;
    event.preventDefault();
    tabRefs.current.get(target)?.focus();
    choose(tabList[target]!.key);
  };

  const run = onAction ?? ((fn: () => void) => fn());

  const visible = current && !current.all ? items.filter((item) => item.tab === current.key) : items;
  const known = new Set((groups ?? []).map((group) => group.key));
  const sections = [
    {
      key: "",
      label: undefined as string | undefined,
      rows: visible.filter((i) => !i.group || !known.has(i.group)),
    },
    ...(groups ?? []).map((group) => ({
      key: group.key,
      label: group.label as string | undefined,
      rows: visible.filter((item) => item.group === group.key),
    })),
  ].filter((section) => section.rows.length > 0);

  const emptyContent = current?.empty ?? empty;
  const markable = Boolean(onMarkAllRead && markAllLabel);
  const Root = landmark ? "section" : "div";

  let order = 0;
  const row = (item: NotificationItem) => {
    const index = order++;
    const leading = item.avatar ?? item.icon;
    const content = (
      <>
        {leading ? (
          <span className={styles.leading} data-kind={item.avatar ? "avatar" : "icon"} aria-hidden="true">
            {leading}
          </span>
        ) : null}
        <span className={styles.body}>
          <span className={styles.title}>
            {item.unread ? <VisuallyHidden>{unreadLabel},</VisuallyHidden> : null}
            {item.unread ? " " : null}
            {item.title}
          </span>{" "}
          {item.meta || item.time ? (
            <span className={styles.meta}>
              {item.meta ? <span>{item.meta}</span> : null}
              {item.meta && item.time ? " " : null}
              {item.meta && item.time ? (
                <span className={styles.separator} aria-hidden="true">
                  ·
                </span>
              ) : null}
              {item.meta && item.time ? " " : null}
              {item.time ? <span>{item.time}</span> : null}
            </span>
          ) : null}
        </span>
        {/* Always rendered, so marking a row read can fade the dot out instead of removing it. */}
        <span className={styles.dot} data-on={item.unread || undefined} aria-hidden="true" />
      </>
    );
    const activate = () => run(() => item.onSelect?.());
    return (
      <li
        key={item.id}
        className={styles.entry}
        data-arrived={arrived.has(item.id) || undefined}
        style={{ "--row-index": Math.min(index, STAGGER_LIMIT - 1) } as CSSProperties}
      >
        {item.href !== undefined ? (
          <LufiaLink
            href={item.href}
            className={styles.row}
            data-unread={item.unread || undefined}
            onClick={activate}
          >
            {content}
          </LufiaLink>
        ) : (
          <button
            type="button"
            className={styles.row}
            data-unread={item.unread || undefined}
            onClick={activate}
          >
            {content}
          </button>
        )}
      </li>
    );
  };

  let list: ReactNode;
  if (error) {
    list = (
      <div role="alert" className={styles.state}>
        {error}
      </div>
    );
  } else if (loading) {
    list = (
      <ul className={styles.list} aria-hidden={loadingLabel ? undefined : true} data-loading="">
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          <li key={index} className={styles.skeletonRow}>
            <Skeleton
              variant="circle"
              width="2rem"
              height="2rem"
              label={index === 0 ? loadingLabel : undefined}
            />
            <span className={styles.skeletonLines}>
              <Skeleton width={index % 2 ? "70%" : "85%"} />
              <Skeleton width="45%" height="0.75rem" />
            </span>
          </li>
        ))}
      </ul>
    );
  } else if (sections.length === 0) {
    list = emptyContent ? (
      <EmptyState
        className={styles.empty}
        icon={emptyContent.icon}
        title={emptyContent.title}
        body={emptyContent.description}
        action={emptyContent.action}
      />
    ) : null;
  } else {
    list = sections.map((section) => {
      const headingIndex = Math.min(order, STAGGER_LIMIT - 1);
      const sectionHeading = `${baseId}-group-${section.key}`;
      return (
        <div key={section.key || "ungrouped"} className={styles.group}>
          {section.label ? (
            <h3
              id={sectionHeading}
              className={styles.groupHeading}
              style={{ "--row-index": headingIndex } as CSSProperties}
            >
              {section.label}
            </h3>
          ) : null}
          <ul className={styles.list} aria-labelledby={section.label ? sectionHeading : undefined}>
            {section.rows.map(row)}
          </ul>
        </div>
      );
    });
  }

  return (
    <Root
      {...rest}
      // `section` and `div` share every attribute used here; the union only trips the ref type.
      ref={ref as Ref<HTMLDivElement>}
      aria-label={landmark ? label : undefined}
      className={[styles.panel, className].filter(Boolean).join(" ")}
      data-lufia-part="notification-panel"
      data-cascade={cascade || undefined}
      data-intro={intro && !reduced ? "" : undefined}
    >
      <NotificationActionContext value={run}>
        <header className={styles.header}>
          <h2 id={headingId} className={styles.heading}>
            {label}
          </h2>
          {unreadCount > 0 ? (
            <>
              <ChangeHighlight value={unreadCount} aria-hidden="true">
                <Badge tone="info">{unreadCount}</Badge>
              </ChangeHighlight>
              <VisuallyHidden>{unreadCountLabel(unreadCount)}</VisuallyHidden>
            </>
          ) : null}
          <span className={styles.headerActions}>
            {markable ? (
              <Button
                variant="ghost"
                size="sm"
                className={styles.markAll}
                aria-disabled={unreadCount === 0 || undefined}
                onClick={() => {
                  if (unreadCount === 0) return;
                  setCascade(true);
                  onMarkAllRead?.();
                }}
              >
                {markAllLabel}
              </Button>
            ) : null}
            {onClose ? (
              <IconButton size="sm" icon={<CloseIcon />} aria-label={labels.close} onClick={onClose} />
            ) : null}
          </span>
        </header>

        {tabList.length > 0 ? (
          <div ref={tabsRef} role="tablist" aria-label={label} className={styles.tabs}>
            <span ref={indicator} className={styles.indicator} hidden aria-hidden="true" />
            {tabList.map((tab, index) => {
              const selected = index === currentIndex;
              return (
                <button
                  key={tab.key}
                  ref={(node) => {
                    if (node) tabRefs.current.set(index, node);
                    else tabRefs.current.delete(index);
                  }}
                  type="button"
                  role="tab"
                  id={tabId(index)}
                  data-tab-index={index}
                  aria-selected={selected}
                  aria-controls={panelId}
                  tabIndex={selected ? 0 : -1}
                  className={styles.tab}
                  onClick={() => choose(tab.key)}
                  onKeyDown={(event) => onTabKeyDown(event, index)}
                >
                  {tab.label}
                  {tab.count !== undefined ? (
                    <ChangeHighlight value={tab.count} className={styles.count}>
                      {tab.count}
                    </ChangeHighlight>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}

        <div className={styles.scroll}>
          {summary ? <div className={styles.summarySlot}>{summary}</div> : null}
          <div
            id={panelId}
            role={current ? "tabpanel" : undefined}
            aria-labelledby={current ? tabId(currentIndex) : undefined}
            aria-busy={loading || undefined}
          >
            <div key={current?.key} className={styles.content} data-crossfade={crossfade || undefined}>
              {list}
            </div>
          </div>
        </div>

        {footer ? (
          <div className={styles.footer} style={{ "--row-index": STAGGER_LIMIT } as CSSProperties}>
            {footer.href !== undefined ? (
              <LufiaLink
                href={footer.href}
                className={styles.footerLink}
                onClick={() => run(() => footer.onSelect?.())}
              >
                {footer.label}
                <ChevronIcon />
              </LufiaLink>
            ) : (
              <button
                type="button"
                className={styles.footerLink}
                onClick={() => run(() => footer.onSelect?.())}
              >
                {footer.label}
                <ChevronIcon />
              </button>
            )}
          </div>
        ) : null}

        {announce ? (
          <VisuallyHidden role="status" aria-live="polite">
            {message}
          </VisuallyHidden>
        ) : null}
      </NotificationActionContext>
    </Root>
  );
}
