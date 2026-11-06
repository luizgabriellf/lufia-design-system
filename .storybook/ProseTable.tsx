import type { ComponentProps } from "react";

/**
 * Replaces the `table` of every docs page. A wide table scrolls inside this frame instead of widening the page, and the
 * frame is a named, focusable region so keyboard users can scroll it (WCAG 2.1.1).
 */
export function ProseTable(props: ComponentProps<"table">) {
  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrollable region must be focusable
    <div className="lufia-prose-table" role="region" aria-label="Table" tabIndex={0}>
      <table {...props} />
    </div>
  );
}
