import { useId } from "react";
import type { ComponentProps, CSSProperties, MouseEvent, ReactNode } from "react";
import { EmptyState, type EmptyStateProps } from "../EmptyState";
import { LufiaLink } from "../LufiaProvider";
import styles from "./Table.module.css";

const join = (...names: (string | undefined)[]) => names.filter(Boolean).join(" ");

/**
 * How the table is named: exactly one of a `caption`, an `aria-label` or an `aria-labelledby`. The name is also the name
 * of the scrollable region around the table, which is a landmark and must have one, so a table is never left unnamed. Use
 * `aria-label` or `aria-labelledby` when there is no caption worth showing (a table generated from free content, or one a
 * heading on the page already names).
 */
type TableName =
  | {
      /**
       * The table's accessible name ("Projects"), and the name of the scrollable region around it. It is a real
       * `<caption>`, visually hidden unless `showCaption` is set.
       */
      caption: string;
      /** Show the caption above the table instead of hiding it visually. */
      showCaption?: boolean;
      /**
       * With `showCaption`: `muted` sets the visible caption in the muted text colour, for a table that sits under prose and
       * should not compete with its heading. Default `default`. `--lufia-table-caption-color` overrides either.
       */
      captionTone?: "default" | "muted";
      "aria-label"?: never;
      "aria-labelledby"?: never;
    }
  | {
      caption?: never;
      showCaption?: never;
      captionTone?: never;
      /** Names the table and its scroll region without a `<caption>`. */
      "aria-label": string;
      "aria-labelledby"?: never;
    }
  | {
      caption?: never;
      showCaption?: never;
      captionTone?: never;
      "aria-label"?: never;
      /** Names the table and its scroll region by the id of an element the page already shows (a heading). */
      "aria-labelledby": string;
    };

export type TableProps = Omit<ComponentProps<"div">, "children" | "aria-label" | "aria-labelledby"> &
  TableName & {
    /** `TableHead`, `TableBody` and, for a total row, `TableFoot`. */
    children: ReactNode;
    /**
     * What the table does when its own width is under 40rem. `cards` (default) turns every row into a card: the header row
     * is hidden visually, the `primary` cell becomes the title (first, wherever its column is) and each other cell shows its `label`. `scroll` keeps the table
     * and scrolls it sideways, with a shadow on each edge that has more to see.
     */
    responsive?: "cards" | "scroll";
    /**
     * `framed` (default) draws the table's own border, radius and background. `flush` drops them so the table sits edge to
     * edge inside a container that already has a frame (a card or panel); the header rule and row separators stay. In card
     * mode each card keeps its own border either way.
     */
    frame?: "framed" | "flush";
    /**
     * How a card lays out its labelled cells under 40rem. `stack` (default) is one cell per line. `grid` sets labelled cells
     * in two columns of label-over-value pairs, which makes a many-column row far shorter; it falls back to one column when
     * the table is under 20rem wide. The title, the actions and unlabelled cells always take the full width, and a wide value
     * can ask for it with `Td cardSpan="full"`. No effect in `responsive="scroll"` or above 40rem.
     */
    cardLayout?: "stack" | "grid";
    /**
     * With `cardLayout="grid"`: how many labelled cells share a line of the card, 2 (default), 3 or 4, for a comparison row
     * (one title and a value per option). A pair never gets narrower than its own content: when the cells do not fit they
     * wrap onto the next line, so a narrow card does not overflow. With 2 a container under 20rem is one column; with 3 or 4
     * it keeps the columns and relies on that wrapping. `Td cardSpan="full"` still takes the whole line.
     */
    cardColumns?: 2 | 3 | 4;
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
 * `Td`, `TableFoot` and `TableEmpty`; `SortableTh` also works in a header row.
 */
export function Table({
  children,
  caption,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  showCaption = false,
  captionTone = "default",
  responsive = "cards",
  cardLayout = "stack",
  cardColumns = 2,
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
      data-card-layout={cardLayout}
      data-card-columns={cardLayout === "grid" && cardColumns !== 2 ? cardColumns : undefined}
      data-density={density}
      data-frame={frame}
    >
      <div className={styles.frame}>
        {/* A scrolling region needs a tab stop and a name, or a keyboard user cannot reach what is off screen. */}
        <div
          className={styles.scroller}
          role="region"
          aria-label={caption === undefined ? ariaLabel : undefined}
          aria-labelledby={caption !== undefined ? captionId : ariaLabelledby}
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrollable region must be focusable
          tabIndex={0}
        >
          {/* The explicit roles keep the table semantics when a browser drops them for a table styled as cards. */}
          <table
            role="table"
            className={join(styles.table, tableClassName)}
            aria-label={caption === undefined ? ariaLabel : undefined}
            aria-labelledby={caption === undefined ? ariaLabelledby : undefined}
          >
            {caption !== undefined ? (
              <caption
                id={captionId}
                className={styles.caption}
                data-visible={showCaption ? "" : undefined}
                data-tone={captionTone}
              >
                {caption}
              </caption>
            ) : null}
            {children}
          </table>
        </div>
        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </div>
  );
}

export type TableHeadProps = Omit<ComponentProps<"thead">, "role">;

/** The header group. In card mode it is hidden visually and stays in the accessibility tree. */
export function TableHead({ className, ...rest }: TableHeadProps) {
  // eslint-disable-next-line jsx-a11y/no-redundant-roles -- explicit so card mode keeps the semantics
  return <thead role="rowgroup" {...rest} className={join(styles.head, className)} />;
}

export type TableBodyProps = Omit<ComponentProps<"tbody">, "role">;

/** The body group: `TableRow`s, or one `TableEmpty`. */
export function TableBody({ className, ...rest }: TableBodyProps) {
  // eslint-disable-next-line jsx-a11y/no-redundant-roles -- explicit so card mode keeps the semantics
  return <tbody role="rowgroup" {...rest} className={join(styles.body, className)} />;
}

export type TableFootProps = Omit<ComponentProps<"tfoot">, "role">;

/**
 * The footer group, for a total row: `TableRow`s whose first cell is a `Td rowHeader` ("Total") followed by `Td numeric`
 * cells. Foot rows read stronger than body rows, with a rule above them, and carry no hover. Give them no `href` or
 * `onActivate`. In card mode the foot becomes one last summary card, one `label` and value pair per cell like a body row.
 * Put it after `TableBody`.
 */
export function TableFoot({ className, ...rest }: TableFootProps) {
  // eslint-disable-next-line jsx-a11y/no-redundant-roles -- explicit so card mode keeps the semantics
  return <tfoot role="rowgroup" {...rest} className={join(styles.foot, className)} />;
}

export type TableRowProps = Omit<ComponentProps<"tr">, "role"> & {
  /** Marks the row as selected: sets `aria-selected` and a selected background. The app owns the selection. */
  selected?: boolean;
  /** Marks the row as the current one (the item shown in a detail pane, say): sets `aria-current="true"` and an accent on its start edge. */
  current?: boolean;
  /**
   * Marks a group header row: a row inside `TableBody` whose single `Th scope="colgroup"` has a `colSpan` over every
   * column and names the rows that follow, up to the next group header. In card mode it is a full-width heading above its
   * cards, not a card. Several `TableBody`s in one `Table` work too; put the group header first in each.
   */
  group?: boolean;
};

/**
 * A row, and in card mode one card. It has no click handler of its own: to make a row open something, give one of its
 * cells `href` or `onActivate` (see `Td`). `selected` and `current` only mark state; they add no checkbox. `ref` and
 * `style` reach the `<tr>`, so a sortable-list library can drive it.
 */
export function TableRow({ selected, current, group, className, ...rest }: TableRowProps) {
  return (
    <tr
      role="row"
      aria-selected={selected === undefined ? undefined : selected}
      aria-current={current ? "true" : undefined}
      {...rest}
      className={join(styles.row, className)}
      data-selected={selected ? "" : undefined}
      data-current={current ? "" : undefined}
      data-group={group ? "" : undefined}
    />
  );
}

type ThBaseProps = Omit<ComponentProps<"th">, "role"> & {
  /** Right-aligned digits in tabular figures: use it on the header of a numeric column, with `numeric` on its cells. */
  numeric?: boolean;
  /**
   * Card mode only: drops this header's visible label when the matching `Td hideInCards` is dropped. The header row is
   * already hidden visually in card mode; this also keeps the header out of the revealed row that shows while a sortable
   * header has keyboard focus. It stays in the accessibility tree.
   */
  hideInCards?: boolean;
  /**
   * Lets the header text wrap onto a second line (balanced, aligned to the bottom of the header row) instead of staying on
   * one line, so a long header such as a two-word label takes less width and a wide table scrolls sideways less. Default
   * off: headers keep one line. Has no effect in card mode, where the header row is hidden.
   */
  wrap?: boolean;
  /**
   * A short visible text for a long header ("Qty" for "Quantity ordered"). `children` stays the full name: it is what
   * assistive technology reads (the short text is hidden from it and carries the full name as a `title` tooltip when the
   * children are a string), what the revealed header row shows in card mode, and the attribute is also set natively on the
   * `<th>`. Default: the children are shown as they are.
   */
  abbr?: string;
  /**
   * Marks this column as the one to look at (a recommended plan in a comparison): a tinted background, in table and card
   * mode, set with `--lufia-table-emphasis-bg`, `-color` and `-font-weight`. Set it on the `Th` and on every `Td` of the
   * column. A tint alone is not an accessible cue, so when the emphasis carries meaning also pass `emphasisLabel`.
   */
  emphasis?: boolean;
  /**
   * With `emphasis`: visually hidden text read after the content, so assistive technology gets what the tint says
   * ("Recommended"). A string from the app, since the package has no copy of its own. Without it the emphasis is visual only.
   */
  emphasisLabel?: string;
};

export type ThProps =
  | (ThBaseProps & { actions?: false; label?: never })
  | (Omit<ThBaseProps, "children" | "aria-label" | "aria-labelledby" | "wrap" | "abbr" | "emphasisLabel"> & {
      wrap?: never;
      abbr?: never;
      emphasisLabel?: never;
      /** Header of the column of `Td actions` cells. Its text is visually hidden, so `label` is required. */
      actions: true;
      /** The column's name for assistive technology ("Actions"), visually hidden. */
      label: string;
    });

/**
 * A plain column header (`scope="col"`). `scope="row"` makes a row header that looks like a body cell; for a row header
 * with `primary`, `label`, `description` or `href`, use `Td rowHeader`. For a column the user can sort, use
 * `SortableTh` in the same row; it takes the same look from the table, and `data-numeric` aligns it like `numeric`.
 */
export function Th({
  numeric,
  hideInCards,
  wrap,
  abbr,
  emphasis,
  emphasisLabel,
  actions,
  label,
  scope = "col",
  className,
  ...rest
}: ThProps) {
  const { children, ...restProps } = rest as ThBaseProps;
  return (
    <th
      role={scope === "row" || scope === "rowgroup" ? "rowheader" : "columnheader"}
      scope={scope}
      {...restProps}
      className={className}
      data-numeric={numeric ? "" : undefined}
      data-actions={actions ? "" : undefined}
      data-hide-in-cards={hideInCards ? "" : undefined}
      data-wrap={wrap ? "" : undefined}
      data-emphasis={emphasis ? "" : undefined}
      abbr={abbr}
    >
      {actions ? (
        <span className={styles.hiddenLabel}>{label}</span>
      ) : abbr ? (
        <>
          {/* The short text is for the eye; the full name, visually hidden in table layout, is what is read. */}
          <span
            aria-hidden="true"
            data-th-short=""
            title={typeof children === "string" ? children : undefined}
          >
            {abbr}
          </span>
          <span data-th-full="">{children}</span>
        </>
      ) : (
        children
      )}
      {emphasis && emphasisLabel ? (
        <>
          {" "}
          <span className={styles.hiddenLabel}>{emphasisLabel}</span>
        </>
      ) : null}
    </th>
  );
}

export type TdProps = Omit<ComponentProps<"td">, "role"> & {
  /**
   * The column's name, shown before the value in card mode ("Status"). Use the same text as the column header. Without it
   * the value takes the whole line. Not shown for a `primary` or `actions` cell.
   */
  label?: string;
  /** Right-aligned digits in tabular figures. */
  numeric?: boolean;
  /** The row's identity: bolder, and the title of the card. Usually the first cell. */
  primary?: boolean;
  /**
   * Renders the cell as the row's header (`<th scope="row">`, `role="rowheader"`) instead of a `<td>`, so assistive
   * technology announces it as the name of every other cell in the row. It keeps the look of a body cell (not the
   * column-header capitals) and every other prop works as on a plain `Td`; with `primary` it is the card's title. Use it on
   * the cell that identifies the row, usually the first.
   */
  rowHeader?: boolean;
  /** The row's buttons and links, laid out in a wrapping row. Never activates the row. */
  actions?: boolean;
  /**
   * With `actions`: in table layout, lets the controls wrap onto a second line (end-aligned, with a gap) instead of
   * keeping one line that can force a sideways scroll at mid widths. With room the controls still share one line; they wrap
   * only when the table would overflow. Default off: the cell shrinks to its buttons. Use it
   * for up to two or three short actions; for more than two text actions prefer one overflow menu in the cell. Card mode
   * already wraps.
   */
  wrap?: boolean;
  /**
   * Card mode only: lets block content take the whole width of the value slot (a progress bar, a `flex: 1` child). By
   * default the value is start-aligned and as wide as its content, which keeps a `Badge` or short text at its natural
   * size but shrinks a block child that relies on stretching to its minimum width. Set it on cells whose content is
   * block-level; leave it off for badges and text. Needs a `label`.
   */
  stretch?: boolean;
  /**
   * Card mode only, with `cardLayout="grid"`: `full` makes the cell span every column, for a wide value. Without the grid
   * layout every cell already has the full width.
   */
  cardSpan?: "full";
  /**
   * Card mode only: `corner` takes the cell out of the card's flow and pins it to the card's top end corner (a drag handle
   * or an overflow menu). It leaves no line of its own, the title reserves room beside it so text never runs under it,
   * and it follows the text direction. Its `label` is not shown. Keep the cell small (an icon button); a `primary` cell
   * in the same row is the one that reserves the room.
   */
  cardSlot?: "corner";
  /**
   * Card mode only: the cell's position among the card's cells, as CSS `order` (lower first, default 0). The `primary`
   * cell defaults to a position before every other cell, so the title is first whatever the column order; give an
   * `actions` cell a negative number to put it right after the title, or a positive one to keep it last. Visual order
   * only: reading order and Tab order keep following the markup, so keep the markup order sensible and use this for small
   * moves.
   */
  cardOrder?: number;
  /**
   * Card mode only: hides the cell visually, for a column whose value already appears elsewhere in the card (a company
   * column repeated in the title). The cell stays in the accessibility tree, so the row keeps one cell per column header
   * and assistive technology can still read it; hide it from assistive technology yourself only if the value is truly
   * redundant. Pair it with `Th hideInCards`.
   */
  hideInCards?: boolean;
  /**
   * Marks this column as the one to look at (a recommended plan in a comparison): a tinted background, in table and card
   * mode, set with `--lufia-table-emphasis-bg`, `-color` and `-font-weight`. Set it on the `Th` and on every `Td` of the
   * column. A tint alone is not an accessible cue, so when the emphasis carries meaning also pass `emphasisLabel`.
   */
  emphasis?: boolean;
  /**
   * With `emphasis`: visually hidden text read after the content, so assistive technology gets what the tint says
   * ("Recommended"). A string from the app, since the package has no copy of its own. Without it the emphasis is visual only.
   */
  emphasisLabel?: string;
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
   * Turns the row control off while keeping it in the page: for a row that cannot be opened right now. The button stays
   * focusable (`aria-disabled="true"`, like `Button` and `Pagination`, so focus is not lost and a reader can still find it)
   * and activation is ignored; the link is rendered without `href`, so it cannot be followed. The cell reads muted. Needs
   * `href` or `onActivate`.
   */
  activateDisabled?: boolean;
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
 * A body cell. `rowHeader` makes it the row's `<th scope="row">`, still styled as a body cell. `label` is the column name for card mode; `primary` and `actions` mark the title and the button cluster of a
 * card. `href` or `onActivate` makes the whole row clickable through a real link or button in this cell, not through a
 * click handler on the `<tr>`.
 */
export function Td({
  label,
  numeric,
  primary,
  rowHeader,
  actions,
  wrap,
  stretch,
  cardSpan,
  cardSlot,
  cardOrder,
  hideInCards,
  emphasis,
  emphasisLabel,
  href,
  onActivate,
  activateLabel,
  activateDescribedBy,
  activateDisabled,
  description,
  after,
  className,
  style,
  children,
  ...rest
}: TdProps) {
  const content = (
    <>
      {children}
      {description ? <span className={styles.description}>{description}</span> : null}
      {emphasis && emphasisLabel ? (
        <>
          {" "}
          <span className={styles.hiddenLabel}>{emphasisLabel}</span>
        </>
      ) : null}
    </>
  );
  const target =
    activateDisabled && (href !== undefined || onActivate) ? (
      // Inert: a link without `href` cannot be followed (the role keeps it announced as a link), and a button with no
      // handler does nothing. The button stays focusable.
      <InertControl
        link={href !== undefined}
        label={activateLabel}
        describedBy={activateDescribedBy}
        content={content}
      />
    ) : href !== undefined ? (
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
  const Cell = rowHeader ? "th" : "td";
  return (
    <Cell
      role={rowHeader ? "rowheader" : "cell"}
      scope={rowHeader ? "row" : undefined}
      {...rest}
      className={className}
      style={
        cardOrder !== undefined && Number.isFinite(cardOrder)
          ? ({ ...style, "--table-card-order": Math.trunc(cardOrder) } as CSSProperties)
          : style
      }
      data-label={label}
      data-numeric={numeric ? "" : undefined}
      data-primary={primary ? "" : undefined}
      data-actions={actions ? "" : undefined}
      data-wrap={actions && wrap ? "" : undefined}
      data-stretch={stretch ? "" : undefined}
      data-card-span={cardSpan}
      data-card-slot={cardSlot}
      data-hide-in-cards={hideInCards ? "" : undefined}
      data-emphasis={emphasis ? "" : undefined}
    >
      {actions && wrap ? <div className={styles.actionsRow}>{target}</div> : target}
      {after ? <div className={styles.after}>{after}</div> : null}
    </Cell>
  );
}

function InertControl({
  link,
  label,
  describedBy,
  content,
}: {
  link: boolean;
  label?: string;
  describedBy?: string;
  content: ReactNode;
}) {
  const Tag = link ? "a" : "button";
  return (
    <Tag
      role={link ? "link" : undefined}
      type={link ? undefined : "button"}
      className={styles.rowLink}
      aria-disabled="true"
      aria-label={label}
      aria-describedby={describedBy}
    >
      {content}
    </Tag>
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
