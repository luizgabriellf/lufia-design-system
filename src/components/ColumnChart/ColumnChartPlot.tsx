"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import styles from "./ColumnChart.module.css";

export type ColumnChartPlotProps = HTMLAttributes<HTMLDivElement> & {
  /** One tooltip body per column, in column order. */
  tips: readonly ReactNode[];
};

/** Where the tooltip sits horizontally: against the start or the end of the plot for the outer thirds, on the column in the middle. */
export function tipZone(index: number, count: number): "start" | "center" | "end" {
  const middle = (index + 0.5) / count;
  if (middle < 1 / 3) return "start";
  if (middle > 2 / 3) return "end";
  return "center";
}

/**
 * The plot of an `interactive` `ColumnChart`: one tooltip for the whole plot, shown for the column that is hovered, focused
 * or tapped. Internal: the chart renders it only when `interactive` is set, so a static chart stays a server component.
 * Each column is a `[data-column]` element carrying its index; the events are delegated from the plot.
 *
 * The tooltip is a visual copy of what the column's accessible name already says, so it is hidden from assistive
 * technology (no `aria-describedby`: the detail would be read twice). It meets the WCAG 1.4.13 conditions: Escape
 * dismisses it, the pointer can move onto it without it closing, and it stays until the pointer or the focus leaves.
 */
export function ColumnChartPlot({ tips, children, className, ...rest }: ColumnChartPlotProps) {
  const [active, setActive] = useState<number | null>(null);
  // Roving tabindex: one column is in the tab order, the one that was focused last.
  const [stopKey, setStopKey] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  // The tab stop follows its column by key. When that column is gone, or nothing was focused yet, it is the first one.
  const keys = Children.toArray(children).map((child) => (isValidElement(child) ? String(child.key) : null));
  const stop = Math.max(0, keys.indexOf(stopKey));
  // A tap on the column that already shows its tip closes it; the tap that first shows it must not.
  const wasActive = useRef(false);
  const pointerType = useRef("mouse");

  const indexOf = (target: EventTarget) => {
    const column = (target as HTMLElement).closest<HTMLElement>("[data-column]");
    return column && root.current?.contains(column) ? Number(column.dataset.column) : null;
  };

  // A tap outside the plot closes the tip (there is no pointer-leave on touch).
  useEffect(() => {
    if (active === null) return;
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setActive(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [active]);

  return (
    // The columns inside are the focusable elements; the plot only delegates their pointer, focus and key events.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      {...rest}
      ref={root}
      className={[styles.plot, className].filter(Boolean).join(" ")}
      onPointerOver={(event) => {
        rest.onPointerOver?.(event);
        const index = indexOf(event.target);
        if (event.pointerType === "mouse" && index !== null) setActive(index);
      }}
      onPointerLeave={(event) => {
        rest.onPointerLeave?.(event);
        if (event.pointerType === "mouse") setActive(null);
      }}
      onPointerDown={(event) => {
        rest.onPointerDown?.(event);
        pointerType.current = event.pointerType;
        const index = indexOf(event.target);
        wasActive.current = index !== null && index === active;
      }}
      onClick={(event) => {
        rest.onClick?.(event);
        const index = indexOf(event.target);
        if (index === null) return;
        setActive(pointerType.current !== "mouse" && wasActive.current ? null : index);
      }}
      onFocus={(event) => {
        rest.onFocus?.(event);
        const index = indexOf(event.target);
        if (index !== null) {
          setActive(index);
          const key = Children.toArray(children)[index];
          setStopKey(isValidElement(key) ? String(key.key) : null);
        }
      }}
      onBlur={(event) => {
        rest.onBlur?.(event);
        if (!root.current?.contains(event.relatedTarget as Node | null)) setActive(null);
      }}
      onKeyDown={(event) => {
        rest.onKeyDown?.(event);
        if (event.key === "Escape" && active !== null) {
          // Only the tooltip is dismissed. A native dialog turns an Escape that is not default-prevented into a close
          // request, and the repo's own overlays check `defaultPrevented`, so both are needed.
          event.preventDefault();
          event.stopPropagation();
          setActive(null);
          return;
        }
        const from = indexOf(event.target);
        const last = tips.length - 1;
        if (from === null || event.altKey || event.ctrlKey || event.metaKey) return;
        const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
        const step =
          event.key === (rtl ? "ArrowLeft" : "ArrowRight")
            ? 1
            : event.key === (rtl ? "ArrowRight" : "ArrowLeft")
              ? -1
              : 0;
        const to =
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : step
                ? Math.min(last, Math.max(0, from + step))
                : null;
        if (to === null) return;
        event.preventDefault();
        root.current?.querySelector<HTMLElement>(`[data-column="${to}"]`)?.focus();
      }}
    >
      {Children.map(children, (child, index) =>
        isValidElement<{ tabIndex?: number }>(child)
          ? cloneElement(child, { tabIndex: index === stop ? 0 : -1 })
          : child,
      )}
      {active !== null ? (
        <div
          className={styles.tip}
          aria-hidden="true"
          data-zone={tipZone(active, tips.length)}
          style={{ "--tip-index": active, "--tip-count": tips.length } as CSSProperties}
        >
          {tips[active]}
        </div>
      ) : null}
    </div>
  );
}
