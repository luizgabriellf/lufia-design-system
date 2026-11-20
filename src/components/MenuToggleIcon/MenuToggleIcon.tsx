import { Icon, type IconProps } from "../Icon";
import styles from "./MenuToggleIcon.module.css";

export type MenuToggleIconProps = Omit<
  IconProps,
  "title" | "aria-label" | "aria-labelledby" | "aria-hidden" | "children"
> & {
  /** `true` draws the cross, `false` the three bars. The bars morph between the two when the value changes. */
  open: boolean;
};

/**
 * Three bars that turn into a cross when `open`, for the button that opens and closes a menu or a navigation sheet. It is
 * decorative and always `aria-hidden`: the button that holds it carries the name and `aria-expanded`. It is sized like
 * every icon (`size`: `sm`, `md`, `lg`, `1em` or a number of px) and draws with `currentColor`. The bars move with
 * `transform` and `opacity` only, using the motion tokens, and swap without movement under `prefers-reduced-motion`.
 */
export function MenuToggleIcon({ open, className, ...rest }: MenuToggleIconProps) {
  return (
    <Icon
      {...rest}
      aria-hidden="true"
      data-lufia-icon="menu-toggle"
      data-state={open ? "open" : "closed"}
      className={[styles.root, className].filter(Boolean).join(" ")}
    >
      <path className={styles.top} d="M4 6h16" />
      <path className={styles.middle} d="M4 12h16" />
      <path className={styles.bottom} d="M4 18h16" />
    </Icon>
  );
}
