import { useId } from "react";
import type { HTMLAttributes, MouseEvent, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { EmptyState, type EmptyStateProps } from "../EmptyState";
import { LufiaLink } from "../LufiaProvider";
import styles from "./Table.module.css";

const join = (...names: (string | undefined)[]) => names.filter(Boolean).join(" ");

export type TableProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** `TableHead` and `TableBody`. */
  children: ReactNode;
  /**
   * The table's accessible name ("Projects"), and the name of the scrollable region around it. It is a real `<caption>`,
   * visually hidden unless `showCaption` is set.
   */
  caption: string;
  /** Show the caption above the table instead of hiding it visually. */
  showCaption?: boolean;
  /**
   * What the table does when its own width is under 40rem. `cards` (default) turns every row into a card: the header row
   * is hidden visually, the first cell becomes the title and each other cell shows its `label`. `scroll` keeps the table
   * and scrolls it sideways, with a shadow on each edge that has more to see.
   */
  responsive?: "cards" | "scroll";
  /**
   * `framed` (default) draws the table's own border, radius and background. `flush` drops them so the table sits edge to
   * edge inside a container that already has a frame (a card or panel); the header rule and row separators stay. In card
   * mode each card keeps its own border either way.
   */
  frame?: "framed" | "flush";
  /** Row padding. Default `comfortable`. */
  density?: "comfortable" | "compact";
  /** Hosts a `Pagination` (or any footer) under the rows. It is not part of the scrolling area. */
  footer?: ReactNode;
  /** Class for the `<table>` element; `className` goes to the outer wrapper. */
  tableClassName?: string;
};

/**
 * A data table: a surface that scrolls sideways with edge shadows, header cells in small monospace capitals, and under
 * 40rem of its own width (`responsive="cards"`) a list of cards. It is CSS only: it holds no state and does not sort,
 * filter or page. Own those, and hand the result in as rows. Compose it from `TableHead`, `TableBody`, `TableRow`, `Th`,
 * `Td` and `TableEmpty`; `SortableTh` also works in a header row.
 */
export function Table({
  children,
  caption,
  showCaption = false,
  responsive = "cards",
  density = "comfortable",
  frame = "framed",
  footer,
  tableClassName,
  className,
  ...rest
}: TableProps) {
  const captionId = useId();
  return (
    <div
      {...rest}
      className={join(styles.root, className)}
      data-responsive={responsive}
      data-density={density}
      data-frame={frame}
    >
      <div className={styles.frame}>
        {/* A scrolling region needs a tab stop and a name, or a keyboard user cannot reach what is off screen. */}
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrollable region must be focusable */}
        <div className={styles.scroller} role="region" aria-labelledby={captionId} tabIndex={0}>
          {/* The explicit roles keep the table semantics when a browser drops them for a table styled as cards. */}
          <table role="table" className={join(styles.table, tableClassName)}>
            <caption id={captionId} className={styles.caption} data-visible={showCaption ? "" : undefined}>
              {caption}
            </caption>
            {children}
          </table>
        </div>
        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </div>
  );
}

export type TableHeadProps = Omit<HTMLAttributes<HTMLTableSectionElement>, "role">;

/** The header group. In card mode it is hidden visually and stays in the accessibility tree. */
export function TableHead({ className, ...rest }: TableHeadProps) {
  // eslint-disable-next-line jsx-a11y/no-redundant-roles -- explicit so card mode keeps the semantics
  return <thead role="rowgroup" {...rest} className={join(styles.head, className)} />;
}

export type TableBodyProps = Omit<HTMLAttributes<HTMLTableSectionElement>, "role">;

/** The body group: `TableRow`s, or one `TableEmpty`. */
export function TableBody({ className, ...rest }: TableBodyProps) {
  // eslint-disable-next-line jsx-a11y/no-redundant-roles -- explicit so card mode keeps the semantics
  return <tbody role="rowgroup" {...rest} className={join(styles.body, className)} />;
}

export type TableRowProps = Omit<HTMLAttributes<HTMLTableRowElement>, "role"> & {
  /** Marks the row as selected: sets `aria-selected` and a selected background. The app owns the selection. */
  selected?: boolean;
  /** Marks the row as the current one (the item shown in a detail pane, say): sets `aria-current="true"` and an accent on its start edge. */
  current?: boolean;
};

/**
 * A row, and in card mode one card. It has no click handler of its own: to make a row open something, give one of its
 * cells `href` or `onActivate` (see `Td`). `selected` and `current` only mark state; they add no checkbox.
 */
export function TableRow({ selected, current, className, ...rest }: TableRowProps) {
  return (
    <tr
      role="row"
      aria-selected={selected === undefined ? undefined : selected}
      aria-current={current ? "true" : undefined}
      {...rest}
      className={join(styles.row, className)}
      data-selected={selected ? "" : undefined}
      data-current={current ? "" : undefined}
    />
  );
}

type ThBaseProps = Omit<ThHTMLAttributes<HTMLTableCellElement>, "role"> & {
  /** Right-aligned digits in tabular figures: use it on the header of a numeric column, with `numeric` on its cells. */
  numeric?: boolean;
};

export type ThProps =
  | (ThBaseProps & { actions?: false; label?: never })
  | (Omit<ThBaseProps, "children" | "aria-label" | "aria-labelledby"> & {
      /** Header of the column of `Td actions` cells. Its text is visually hidden, so `label` is required. */
      actions: true;
      /** The column's name for assistive technology ("Actions"), visually hidden. */
      label: string;
    });

/**
 * A plain column header (`scope="col"`). Pass `scope="row"` for a row header. For a column the user can sort, use
 * `SortableTh` in the same row; it takes the same look from the table, and `data-numeric` aligns it like `numeric`.
 */
export function Th({ numeric, actions, label, scope = "col", className, ...rest }: ThProps) {
  return (
    <th
      role={scope === "row" ? "rowheader" : "columnheader"}
      scope={scope}
      {...rest}
      className={className}
      data-numeric={numeric ? "" : undefined}
      data-actions={actions ? "" : undefined}
    >
      {actions ? <span className={styles.hiddenLabel}>{label}</span> : (rest as ThBaseProps).children}
    </th>
  );
}

export type TdProps = Omit<TdHTMLAttributes<HTMLTableCellElement>, "role"> & {
  /**
   * The column's name, shown before the value in card mode ("Status"). Use the same text as the column header. Without it
   * the value takes the whole line. Not shown for a `primary` or `actions` cell.
   */
  label?: string;
  /** Right-aligned digits in tabular figures. */
  numeric?: boolean;
  /** The row's identity: bolder, and the title of the card. Usually the first cell. */
  primary?: boolean;
  /** The row's buttons and links, laid out in a wrapping row. Never activates the row. */
  actions?: boolean;
  /**
   * With `actions`: in table layout, lets the controls wrap onto a second line (end-aligned, with a gap) instead of
   * keeping one line that can force a sideways scroll at mid widths. Default off: the cell shrinks to its buttons. Use it
   * for up to two or three short actions; for more than two text actions prefer one overflow menu in the cell. Card mode
   * already wraps.
   */
  wrap?: boolean;
  /**
   * Makes the row a link. The cell's content becomes a real link (through the `linkComponent` of `LufiaProvider`) whose
   * click area is stretched over the whole row, so it can be opened in a new tab and is announced as a link. Interactive
   * children of other cells (buttons, links) stay on top and do their own thing. One per row.
   */
  href?: string;
  /**
   * Called when the row is activated. With `href` it is the link's click handler (call `event.preventDefault()` to handle
   * the navigation yourself). Without `href` the cell's content becomes a real `<button>` stretched over the row, which
   * Enter and Space both activate. One per row. Needs a Client Component, since it passes a function.
   */
  onActivate?: (event: MouseEvent<HTMLElement>) => void;
  /**
   * The accessible name of the generated link or button (`aria-label`), for a cell with `href` or `onActivate`: "Open
   * details of Harbour redesign". Keep the cell's visible text inside it (WCAG 2.5.3). Without it the control is named by the whole cell content, `description` included.
   */
  activateLabel?: string;
  /** `aria-describedby` of the generated link or button: ids of elements that describe the row control. */
  activateDescribedBy?: string;
  /**
   * A muted, regular-weight line under the cell's content: a description or an identifier under a `primary` name. In a
   * cell with `href` or `onActivate` it is inside the control, so the whole block stays clickable and, without
   * `activateLabel`, is part of the control's name. In card mode it stays under the value.
   */
  description?: ReactNode;
  /**
   * Content rendered in the same cell but outside the generated control, lifted above the row's stretched click area:
   * a second link or a mailto next to the name. Interactive content here is valid HTML (never nested in the row's link or
   * button), reachable in DOM order after the control and clickable. It sits on its own line under the content.
   */
  after?: ReactNode;
};

/**
 * A body cell. `label` is the column name for card mode; `primary` and `actions` mark the title and the button cluster of a
 * card. `href` or `onActivate` makes the whole row clickable through a real link or button in this cell, not through a
 * click handler on the `<tr>`.
 */
export function Td({
  label,
  numeric,
  primary,
  actions,
  wrap,
  href,
  onActivate,
  activateLabel,
  activateDescribedBy,
  description,
  after,
  className,
  children,
  ...rest
}: TdProps) {
  const content = (
    <>
      {children}
      {description ? <span className={styles.description}>{description}</span> : null}
    </>
  );
  const target =
    href !== undefined ? (
      <LufiaLink
        href={href}
        className={styles.rowLink}
        onClick={onActivate}
        aria-label={activateLabel}
        aria-describedby={activateDescribedBy}
      >
        {content}
      </LufiaLink>
    ) : onActivate ? (
      <button
        type="button"
        className={styles.rowLink}
        onClick={onActivate}
        aria-label={activateLabel}
        aria-describedby={activateDescribedBy}
      >
        {content}
      </button>
    ) : (
      content
    );
  return (
    <td
      // eslint-disable-next-line jsx-a11y/no-interactive-element-to-noninteractive-role -- explicit so card mode keeps the semantics
      role="cell"
      {...rest}
      className={className}
      data-label={label}
      data-numeric={numeric ? "" : undefined}
      data-primary={primary ? "" : undefined}
      data-actions={actions ? "" : undefined}
      data-wrap={actions && wrap ? "" : undefined}
    >
      {actions && wrap ? <div className={styles.actionsRow}>{target}</div> : target}
      {after ? <div className={styles.after}>{after}</div> : null}
    </td>
  );
}

export type TableEmptyProps = Omit<EmptyStateProps, "title"> & {
  /** The number of columns, so the message spans the whole row. */
  colSpan: number;
  /**
   * Headline of the titled empty state. Leave it out to render `children` as one muted, centred line instead (`icon`,
   * `body` and `action` are then ignored).
   */
  title?: string;
};

/**
 * The body of a table with nothing to show: one full-width row. With a `title` it hosts an `EmptyState`; with only
 * `children` it is a single muted line. Put it alone in `TableBody`.
 */
export function TableEmpty({ colSpan, title, ...empty }: TableEmptyProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- the bare form drops the titled form's extras
  const { icon, body, action, className, children, ...rest } = empty;
  return (
    <tr role="row" className={styles.emptyRow}>
      {/* eslint-disable-next-line jsx-a11y/no-interactive-element-to-noninteractive-role -- explicit so card mode keeps the semantics */}
      <td role="cell" colSpan={colSpan} className={styles.emptyCell}>
        {title !== undefined ? (
          <EmptyState {...empty} title={title} />
        ) : (
          <p role="status" {...rest} className={join(styles.emptyMessage, className)}>
            {children}
          </p>
        )}
      </td>
    </tr>
  );
}
