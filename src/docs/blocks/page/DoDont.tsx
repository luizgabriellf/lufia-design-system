import { Unstyled } from "@storybook/addon-docs/blocks";
import type { ReactNode } from "react";
import { CheckIcon, CrossIcon } from "../../demo";
import styles from "./DoDont.module.css";

type TileProps = {
  /** What to do or avoid, in a sentence. This is the content for assistive technology. */
  caption: ReactNode;
  /** A live mini render. It is decorative: the caption says the same thing in words. */
  children: ReactNode;
};

function Tile({ kind, caption, children }: TileProps & { kind: "do" | "dont" }) {
  const Icon = kind === "do" ? CheckIcon : CrossIcon;
  return (
    <figure className={styles.tile} data-kind={kind}>
      <div aria-hidden="true" inert className={styles.stage}>
        {children}
      </div>
      <figcaption className={styles.caption}>
        <span className={styles.label}>
          <Icon size={16} />
          {kind === "do" ? "Do" : "Don't"}
        </span>
        <span>{caption}</span>
      </figcaption>
    </figure>
  );
}

export const Do = (props: TileProps) => <Tile kind="do" {...props} />;
export const Dont = (props: TileProps) => <Tile kind="dont" {...props} />;

/** Side-by-side Do and Don't tiles with live mini renders. Put one `Do` and one `Dont` inside, in that order. */
export function DoDont({ children }: { children: ReactNode }) {
  return (
    <Unstyled>
      <div className={styles.pair}>{children}</div>
    </Unstyled>
  );
}
