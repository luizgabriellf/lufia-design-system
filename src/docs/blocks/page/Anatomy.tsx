import { Unstyled } from "@storybook/addon-docs/blocks";
import type { ReactNode } from "react";
import styles from "./Anatomy.module.css";

export type AnatomyPart = {
  /** Short name of the part, shown in the legend. */
  label: string;
  /** What the part is for, one sentence. */
  note: string;
  /** Where the pin touches the rendered component, as a percentage of its box. */
  x: number;
  y: number;
  /** Which way the pin's stem leaves the component. Defaults to `top`. */
  side?: "top" | "bottom" | "start" | "end";
};

type AnatomyProps = {
  /** Accessible name of the figure, for example "Anatomy of a Button". */
  label: string;
  parts: AnatomyPart[];
  /** The component: a live render or a schematic. It is decorative; the legend carries the same information. */
  children: ReactNode;
};

/** A component with numbered pins on its parts, and a legend that names each part. */
export function Anatomy({ label, parts, children }: AnatomyProps) {
  return (
    <Unstyled>
      <figure className={styles.anatomy} aria-label={label}>
        <div className={styles.stage}>
          <div className={styles.subject}>
            <div aria-hidden="true" inert className={styles.render}>
              {children}
            </div>
            <div aria-hidden="true" className={styles.pins}>
              {parts.map((part, index) => (
                <span
                  key={part.label}
                  className={styles.pin}
                  data-side={part.side ?? "top"}
                  style={{ insetInlineStart: `${part.x}%`, insetBlockStart: `${part.y}%` }}
                >
                  <span className={styles.stem} />
                  <span className={styles.dot} />
                  <span className={styles.num}>{index + 1}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
        <ol className={styles.legend}>
          {parts.map((part) => (
            <li key={part.label}>
              <strong>{part.label}</strong>
              <span>{part.note}</span>
            </li>
          ))}
        </ol>
      </figure>
    </Unstyled>
  );
}
