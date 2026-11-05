import { Unstyled } from "@storybook/addon-docs/blocks";
import { sharedGroup } from "../tokensData";
import styles from "./Foundations.module.css";

const SAMPLE = "Accessible interfaces start with readable type";

const FAMILY_NOTES: Record<string, string> = {
  display: "Headings and numbers",
  body: "Running text and controls",
  mono: "Code, identifiers and token names",
};

/** The three font-family tokens, each set large enough to judge. */
export function FamilySpecimens() {
  const families = sharedGroup("font").filter((token) => token.path[1] === "family");
  return (
    <Unstyled>
      <ul className={styles.cards}>
        {families.map((token) => {
          const role = token.path[2] ?? "";
          return (
            <li key={token.name} className={styles.card}>
              <span className={styles.big} style={{ fontFamily: `var(--${token.name})` }} aria-hidden="true">
                Aa
              </span>
              <p className={styles.cardTitle}>{role}</p>
              <p className={styles.muted}>{FAMILY_NOTES[role] ?? ""}</p>
              <code className={styles.token}>--{token.name}</code>
              <p className={styles.sampleLine} style={{ fontFamily: `var(--${token.name})` }}>
                Pack my box with five dozen liquor jugs. 0123456789
              </p>
            </li>
          );
        })}
      </ul>
    </Unstyled>
  );
}

/** The type scale as specimens: each size set in the body family with its token and computed size. */
export function ScaleSpecimens() {
  const sizes = sharedGroup("font")
    .filter((token) => token.path[1] === "size")
    .reverse();
  return (
    <Unstyled>
      <div className={styles.scale} role="list">
        {sizes.map((token) => (
          <div key={token.name} className={styles.scaleRow} role="listitem">
            <div className={styles.scaleMeta}>
              <code className={styles.token}>--{token.name}</code>
              <span className={styles.muted}>
                {token.value} · {Math.round(parseFloat(token.value) * 16)}px
              </span>
            </div>
            <p className={styles.scaleSample} style={{ fontSize: `var(--${token.name})` }}>
              {SAMPLE}
            </p>
          </div>
        ))}
      </div>
    </Unstyled>
  );
}

/** One word per weight token. */
export function WeightSpecimens() {
  const weights = sharedGroup("font").filter((token) => token.path[1] === "weight");
  return (
    <Unstyled>
      <ul className={styles.weights}>
        {weights.map((token) => (
          <li key={token.name} className={styles.weight}>
            <span className={styles.big} style={{ fontWeight: `var(--${token.name})` }} aria-hidden="true">
              Aa
            </span>
            <code className={styles.token}>--{token.name}</code>
            <span className={styles.muted}>{token.value}</span>
          </li>
        ))}
      </ul>
    </Unstyled>
  );
}

/** The same paragraph at each line-height token. */
export function LineHeightSpecimens() {
  const heights = sharedGroup("font").filter((token) => token.path[1] === "line-height");
  return (
    <Unstyled>
      <ul className={styles.cards}>
        {heights.map((token) => (
          <li key={token.name} className={styles.card}>
            <code className={styles.token}>
              --{token.name} · {token.value}
            </code>
            <p className={styles.paragraph} style={{ lineHeight: `var(--${token.name})` }}>
              Good typography is mostly spacing. The space between lines decides whether a paragraph invites
              reading or resists it, so choose it for the job, not by habit.
            </p>
          </li>
        ))}
      </ul>
    </Unstyled>
  );
}
