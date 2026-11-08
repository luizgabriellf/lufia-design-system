import type { ReactNode, Ref, SVGProps } from "react";
import styles from "./Icon.module.css";

/** A size token (`sm` 16px, `md` 20px, `lg` 24px by default), `"1em"` to follow the font size, or a number of px. */
export type IconSize = "sm" | "md" | "lg" | "1em" | number;

export type IconProps = Omit<SVGProps<SVGSVGElement>, "width" | "height" | "viewBox" | "children" | "ref"> & {
  /**
   * Rendered size: `sm`, `md` or `lg` read `--lufia-icon-size-*` (16, 20 and 24px by default), `1em` follows the font size
   * of the text around it, and a number is a size in px. Default `md`.
   */
  size?: IconSize;
  /**
   * Makes the icon meaningful: rendered as an SVG `<title>`, with `role="img"`. Without `title` or `aria-label` the icon
   * is decorative and hidden from assistive technology. Prefer naming the button or link that holds the icon instead.
   */
  title?: string;
  ref?: Ref<SVGSVGElement>;
};

/** What `createIcon` draws: SVG children on the 24-unit grid, or one or more path `d` strings. */
export type IconGeometry = ReactNode | string | readonly string[];

const PX: Record<"sm" | "md" | "lg", number> = { sm: 16, md: 20, lg: 24 };
/** Numeric sizes at or below this many px take the small stroke, like `size="sm"`. */
const SMALL_PX = 18;

function draw(geometry: IconGeometry): ReactNode {
  if (typeof geometry === "string") return <path d={geometry} />;
  if (Array.isArray(geometry)) {
    return (geometry as readonly string[]).map((d) => <path key={d} d={d} />);
  }
  return geometry as ReactNode;
}

/**
 * The base icon: a 24x24 viewBox, `fill="none"`, a `currentColor` stroke with round caps and joins, and a stroke width read
 * from `--lufia-icon-stroke` (`--lufia-icon-stroke-sm` at the small size). Decorative by default (`aria-hidden`); a
 * `title` or an `aria-label` makes it an image with that name.
 *
 * Use it directly with your own children, or make a reusable icon with `createIcon`.
 */
export function Icon({
  size = "md",
  title,
  className,
  children,
  "aria-label": ariaLabel,
  "aria-hidden": ariaHidden,
  ...rest
}: IconProps & { children?: ReactNode }) {
  const named = Boolean(title) || (typeof ariaLabel === "string" && ariaLabel.length > 0);
  const px = typeof size === "number" ? size : size === "1em" ? undefined : PX[size];
  const dataSize = typeof size === "number" ? "custom" : size === "1em" ? "em" : size;
  const small = typeof size === "number" ? size <= SMALL_PX : size === "sm";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={px ?? "1em"}
      height={px ?? "1em"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={small ? 2 : 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      role={named ? "img" : undefined}
      aria-label={named ? ariaLabel : undefined}
      aria-hidden={named ? ariaHidden : (ariaHidden ?? true)}
      data-size={dataSize}
      data-stroke={small ? "sm" : undefined}
      className={[styles.icon, className].filter(Boolean).join(" ")}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

/** A component made by `createIcon`. */
export type IconComponent = ((props: IconProps) => ReactNode) & { displayName?: string; iconName: string };

/**
 * Makes a named icon component that inherits the grid, stroke, sizes and accessibility rules of `Icon`. Draw on a 24x24
 * grid with strokes only (no fills, no stroke widths of your own) so the icon matches the rest of the set.
 *
 * ```tsx
 * const RouteIcon = createIcon("route", ["M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z", "M18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"]);
 * ```
 *
 * @param name A kebab-case name, written to `data-lufia-icon` for tests and styling.
 * @param geometry SVG children (`<path>`, `<circle>`, `<rect>`...), a path `d` string or a list of them.
 */
export function createIcon(name: string, geometry: IconGeometry): IconComponent {
  const content = draw(geometry);
  const Component = (props: IconProps) => (
    <Icon data-lufia-icon={name} {...props}>
      {content}
    </Icon>
  );
  const pascal = name.replace(/(^|-)([a-z0-9])/g, (_, __, c: string) => c.toUpperCase());
  return Object.assign(Component, { displayName: `${pascal}Icon`, iconName: name });
}
