import {
  Children,
  cloneElement,
  isValidElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { Icon } from "../Icon/Icon";
import styles from "./StatusIcon.module.css";

/** The status vocabulary shared by every status marker in the package. */
export type StatusTone = "success" | "warning" | "danger" | "info" | "pending" | "neutral" | "needsInput";

/** Every tone, in display order: for galleries and tests. */
export const STATUS_TONES: readonly StatusTone[] = [
  "success",
  "warning",
  "danger",
  "info",
  "pending",
  "neutral",
  "needsInput",
];

export type StatusIconProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  /** The status. Each tone has its own shape, so it reads without colour (WCAG 1.4.1). */
  tone: StatusTone;
  /**
   * `bare` (default): the outlined glyph alone, in the tone colour; for inline messages. `ring`: the inner mark on a tinted
   * disc with a tone border; for toasts, cards and timelines. `mark`: the inner mark alone in `currentColor`, for a host that
   * draws its own container (a stepper dot).
   */
  variant?: "bare" | "ring" | "mark";
  /**
   * `sm`, `md` (default) or `lg`. A bare glyph or a mark is 16, 20 or 24px (`--lufia-icon-size-*`); a ring is 20, 24 or 32px,
   * and `--lufia-status-icon-size` overrides its diameter.
   */
  size?: "sm" | "md" | "lg";
  /**
   * Names the status for assistive technology (`role="img"`). Leave it out when visible text next to the icon already
   * names the status: the icon is then decorative.
   */
  label?: string;
  /**
   * Draw the glyph's strokes in once when it mounts, the motion of `SuccessCheck` (for a toast or a confirmation that has
   * just appeared). Under `prefers-reduced-motion` the glyph is simply drawn. Default `false`.
   */
  drawOn?: boolean;
};

/* The outlined glyphs: a distinct outer shape or inner mark per tone. */
const GLYPH: Record<StatusTone, ReactNode> = {
  success: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </>
  ),
  warning: (
    <>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </>
  ),
  danger: (
    <>
      <path d="M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </>
  ),
  pending: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  neutral: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
    </>
  ),
  needsInput: (
    <>
      <path d="M10.1 2.182a10 10 0 0 1 3.8 0M13.9 21.818a10 10 0 0 1-3.8 0M17.609 3.721a10 10 0 0 1 2.69 2.7M2.182 13.9a10 10 0 0 1 0-3.8M20.279 17.609a10 10 0 0 1-2.7 2.69M21.818 10.1a10 10 0 0 1 0 3.8M3.721 6.391a10 10 0 0 1 2.7-2.69M6.391 20.279a10 10 0 0 1-2.69-2.7" />
      <path d="M8 12h.01M12 12h.01M16 12h.01" />
    </>
  ),
};

/* The inner marks, drawn to fill the grid because they sit inside a container. Warning keeps its triangle: a lone "!"
   would match danger, and the triangle is the shape people read as a warning. */
const MARK: Record<StatusTone, ReactNode> = {
  success: <path d="M20 6 9 17l-5-5" />,
  warning: GLYPH.warning,
  danger: <path d="M12 4.5v9M12 19.5h.01" />,
  info: <path d="M12 10.5v9M12 4.5h.01" />,
  pending: <path d="M12 4.5V12l5 3" />,
  neutral: <path d="M5 12h14" />,
  needsInput: <path d="M5 12h.01M12 12h.01M19 12h.01" />,
};

/* Every stroke gets `pathLength={1}`, so one dash pattern draws any shape in. */
function measured(node: ReactNode): ReactNode {
  return Children.map(node, (child) => {
    if (!isValidElement(child)) return child;
    const element = child as ReactElement<{ children?: ReactNode; pathLength?: number }>;
    if (element.props.children) return cloneElement(element, {}, measured(element.props.children));
    return cloneElement(element, { pathLength: 1 });
  });
}

/**
 * One family of status markers: success, warning, danger, info, pending, neutral and needs-input, each with its own
 * shape. `Toast`, the field error, `DetailAttentionCard`, `StatusTimeline` and `Stepper` all draw their markers with it, so
 * a status looks the same everywhere. Decorative unless `label` is given.
 */
export function StatusIcon({
  tone,
  variant = "bare",
  size = "md",
  label,
  drawOn = false,
  className,
  ...rest
}: StatusIconProps) {
  const shape = variant === "bare" ? GLYPH[tone] : MARK[tone];
  const glyph = drawOn ? measured(shape) : shape;
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      {...rest}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-tone={tone}
      data-variant={variant}
      data-size={size}
      data-draw-on={drawOn || undefined}
    >
      <Icon
        size={variant === "ring" ? "sm" : size}
        className={styles.glyph}
        data-lufia-icon={`status-${tone}`}
      >
        {glyph}
      </Icon>
    </span>
  );
}
