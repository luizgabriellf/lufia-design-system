import { Icon, type IconProps } from "../Icon/Icon";
import styles from "./SuccessCheck.module.css";

export type SuccessCheckProps = Omit<IconProps, "size"> & {
  /** Rendered size: a number of px, or a size token of `Icon` (`sm`, `md`, `lg`, `1em`). Default 16. */
  size?: IconProps["size"];
};

/**
 * A check mark whose stroke draws in once when it appears. Decorative (`aria-hidden`): the text next to it says what
 * happened, so never use it as the only signal. Under `prefers-reduced-motion` it is simply drawn.
 */
export function SuccessCheck({ size = 16, className, ...rest }: SuccessCheckProps) {
  return (
    <Icon
      {...rest}
      className={[styles.root, className].filter(Boolean).join(" ")}
      size={size}
      data-lufia-icon="success-check"
    >
      <path className={styles.path} pathLength={1} d="M20 6 9 17l-5-5" />
    </Icon>
  );
}
