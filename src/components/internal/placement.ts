/** Which side of the anchor a floating panel opens on. `start` and `end` follow the writing direction. */
export type Side = "top" | "bottom" | "start" | "end";
/** How the panel lines up with the anchor along the other axis. */
export type Align = "start" | "center" | "end";

export type Box = { left: number; top: number; right: number; bottom: number };

export type PlacementInput = {
  /** The anchor's box, in viewport coordinates. */
  anchor: Box;
  /** The panel's natural size, measured with no size cap. */
  size: { width: number; height: number };
  /** The visible viewport, minus scrollbars. */
  viewport: { width: number; height: number };
  side: Side;
  align: Align;
  /** Space between the anchor and the panel, in pixels. */
  gap: number;
  /** Space kept between the panel and the viewport edge, in pixels. */
  margin: number;
  rtl: boolean;
};

export type PlacementResult = {
  /** Viewport coordinates for `position: fixed`. */
  left: number;
  top: number;
  /** The side it ended up on: the requested one, or the opposite when that had more room. */
  side: Side;
  /** Set when the room on the chosen side is smaller than the panel, so the panel can scroll inside. */
  maxWidth?: number;
  maxHeight?: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(max, min));

/**
 * Where to put a floating panel so it stays in the viewport. It opens on `side` and flips to the opposite side when it does
 * not fit there and the opposite side has more room. Along the other axis it lines up with `align`, then shifts to stay
 * inside the margin. When even the chosen side is too small it reports a cap for the panel's size. Pure: the caller
 * measures and applies.
 */
export function computePlacement(input: PlacementInput): PlacementResult {
  const { anchor, size, viewport, side, align, gap, margin, rtl } = input;
  // `start` and `end` are the physical left or right of the anchor, depending on the direction.
  const physical = (logical: Side) =>
    logical === "start" ? (rtl ? "right" : "left") : logical === "end" ? (rtl ? "left" : "right") : logical;
  const room = {
    top: anchor.top - gap - margin,
    bottom: viewport.height - anchor.bottom - gap - margin,
    left: anchor.left - gap - margin,
    right: viewport.width - anchor.right - gap - margin,
  };
  const opposite = { top: "bottom", bottom: "top", left: "right", right: "left" } as const;
  let chosen = physical(side) as keyof typeof room;
  const vertical = chosen === "top" || chosen === "bottom";
  const need = vertical ? size.height : size.width;
  if (room[chosen] < need && room[opposite[chosen]] > room[chosen]) chosen = opposite[chosen];

  const available = room[chosen];
  const used = Math.min(need, Math.max(available, 0));
  const result: PlacementResult = {
    left: 0,
    top: 0,
    side: chosen === "top" || chosen === "bottom" ? chosen : (chosen === "left") !== rtl ? "start" : "end",
  };

  if (vertical) {
    if (size.height > available) result.maxHeight = Math.max(available, 0);
    result.top = chosen === "top" ? anchor.top - gap - used : anchor.bottom + gap;
    const wide = anchor.right - anchor.left;
    const edge =
      align === "center"
        ? anchor.left + (wide - size.width) / 2
        : (align === "start") !== rtl
          ? anchor.left
          : anchor.right - size.width;
    result.left = clamp(edge, margin, viewport.width - margin - size.width);
  } else {
    if (size.width > available) result.maxWidth = Math.max(available, 0);
    result.left = chosen === "left" ? anchor.left - gap - used : anchor.right + gap;
    const room = viewport.height - 2 * margin;
    const height = Math.min(size.height, room);
    if (size.height > room) result.maxHeight = room;
    const tall = anchor.bottom - anchor.top;
    const edge =
      align === "center"
        ? anchor.top + (tall - height) / 2
        : align === "start"
          ? anchor.top
          : anchor.bottom - height;
    result.top = clamp(edge, margin, viewport.height - margin - height);
  }
  return result;
}
