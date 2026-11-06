import { Unstyled } from "@storybook/addon-docs/blocks";
import { ScrollTable } from "../ScrollTable";
import { sharedGroup } from "../tokensData";
import styles from "./Foundations.module.css";

const ZOOM = 3;

/** Every space token as a bar on a ruler, drawn at 3x so neighbouring steps are easy to tell apart. */
export function SpacingRuler() {
  const steps = sharedGroup("space");
  const ticks = [0, 16, 32, 48, 64];
  return (
    <Unstyled>
      <ScrollTable label="Spacing ruler">
        <div className={styles.ruler}>
          <p className={styles.muted}>Drawn at {ZOOM}x. Ticks are every 16px of real size.</p>
          <div className={styles.axis} aria-hidden="true">
            {ticks.map((tick) => (
              <span
                key={tick}
                className={styles.tick}
                style={{ insetInlineStart: `calc(${tick * ZOOM} * 1px)` }}
              >
                {tick}
              </span>
            ))}
          </div>
          <ul className={styles.rulerList}>
            {steps.map((token) => (
              <li key={token.name} className={styles.rulerRow}>
                <code className={styles.token}>--{token.name}</code>
                <span className={styles.muted}>{token.value}</span>
                <span className={styles.rulerTrack}>
                  <span
                    className={styles.rulerBar}
                    style={{ inlineSize: `calc(var(--${token.name}) * ${ZOOM})` }}
                  />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </ScrollTable>
    </Unstyled>
  );
}
