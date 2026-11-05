import { Unstyled } from "@storybook/addon-docs/blocks";
import { sharedGroup } from "../tokensData";
import styles from "./Foundations.module.css";

/** Each radius token as a square, with the component it is meant for. */
export function RadiusDemo() {
  return (
    <Unstyled>
      <ul className={styles.tiles}>
        {sharedGroup("radius").map((token) => (
          <li key={token.name} className={styles.tile}>
            <span className={styles.shape} style={{ borderRadius: `var(--${token.name})` }} />
            <code className={styles.token}>--{token.name}</code>
            <span className={styles.muted}>{token.value}</span>
          </li>
        ))}
      </ul>
    </Unstyled>
  );
}

/** The two border widths, drawn as the lines components use. */
export function BorderDemo() {
  return (
    <Unstyled>
      <ul className={styles.tiles}>
        {sharedGroup("border-width").map((token) => (
          <li key={token.name} className={styles.tile}>
            <span
              className={styles.shape}
              style={{
                borderWidth: `var(--${token.name})`,
                borderStyle: "solid",
                borderColor: "var(--lufia-color-accent-default)",
                borderRadius: "var(--lufia-radius-control)",
              }}
            />
            <code className={styles.token}>--{token.name}</code>
            <span className={styles.muted}>{token.value}</span>
          </li>
        ))}
      </ul>
    </Unstyled>
  );
}

/** Shadow tokens on raised surfaces, shown on a canvas so the lift is visible in every mode. */
export function ElevationDemo() {
  return (
    <Unstyled>
      <ul className={styles.elevation}>
        {sharedGroup("shadow").map((token) => (
          <li key={token.name} className={styles.tile}>
            <span className={styles.lifted} style={{ boxShadow: `var(--${token.name})` }} />
            <code className={styles.token}>--{token.name}</code>
            <span className={styles.muted}>{token.value}</span>
          </li>
        ))}
      </ul>
    </Unstyled>
  );
}

/** The z-index scale as a stack, lowest layer at the bottom. */
export function LayerStack() {
  const layers = sharedGroup("z");
  return (
    <Unstyled>
      <ol className={styles.stack}>
        {[...layers].reverse().map((token, index) => (
          <li
            key={token.name}
            className={styles.layer}
            style={{ marginInlineStart: `${(layers.length - 1 - index) * 1.25}rem` }}
          >
            <code className={styles.token}>--{token.name}</code>
            <span className={styles.muted}>{token.value}</span>
          </li>
        ))}
      </ol>
    </Unstyled>
  );
}
