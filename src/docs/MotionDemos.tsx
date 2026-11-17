import { useState } from "react";
import { usePrefersReducedMotion } from "../motion/usePrefersReducedMotion";
import { Button } from "../components/Button";
import styles from "./MotionDemos.module.css";
import { sharedGroup } from "./tokensData";
import type { CSSProperties } from "react";

const short = (name: string) => name.replace("lufia-motion-", "");

/** Plays every duration (or every easing) on a track so the difference can be felt. */
export function TrackDemo({ kind }: { kind: "duration" | "easing" }) {
  const [end, setEnd] = useState(false);
  const tokens = sharedGroup("motion").filter((t) => t.path[1] === kind);
  return (
    <div className={styles.demo}>
      {tokens.map((token) => (
        <div key={token.name} className={styles.row}>
          <code>{short(token.name)}</code>
          <div className={styles.track}>
            <span
              className={styles.dot}
              data-end={end ? "" : undefined}
              style={
                {
                  "--demo-track": "9rem",
                  "--demo-duration":
                    kind === "duration" ? `var(--${token.name})` : "var(--lufia-motion-duration-medium)",
                  "--demo-easing":
                    kind === "easing" ? `var(--${token.name})` : "var(--lufia-motion-easing-out)",
                } as CSSProperties
              }
            />
          </div>
        </div>
      ))}
      <div className={styles.actions}>
        <Button variant="primary" size="sm" onClick={() => setEnd(!end)}>
          Play
        </Button>
      </div>
    </div>
  );
}

/** Moves a box by each distance token. */
export function DistanceDemo() {
  const [end, setEnd] = useState(false);
  const tokens = sharedGroup("motion").filter((t) => t.path[1] === "distance");
  return (
    <div className={styles.demo}>
      <div className={styles.actions} style={{ alignItems: "start" }}>
        {tokens.map((token) => (
          <div
            key={token.name}
            style={{ display: "grid", gap: "0.5rem", justifyItems: "center", minInlineSize: "6rem" }}
          >
            <div
              className={styles.mover}
              data-end={end ? "" : undefined}
              style={{ "--demo-distance": `var(--${token.name})` } as CSSProperties}
            />
            <code>{short(token.name)}</code>
          </div>
        ))}
      </div>
      <div className={styles.actions}>
        <Button variant="primary" size="sm" onClick={() => setEnd(!end)}>
          Play
        </Button>
      </div>
    </div>
  );
}

/** Two small elements side by side: one eases out, the other springs, over the 1.5 rem a spring is meant for. */
export function SpringDemo() {
  const [end, setEnd] = useState(false);
  return (
    <div className={styles.demo}>
      {(["out", "spring"] as const).map((easing) => (
        <div key={easing} className={styles.row}>
          <code>easing-{easing}</code>
          <div className={styles.track}>
            <span
              className={styles.dot}
              data-end={end ? "" : undefined}
              style={
                {
                  "--demo-track": "2.75rem",
                  "--demo-duration": "var(--lufia-motion-duration-fast)",
                  "--demo-easing": `var(--lufia-motion-easing-${easing})`,
                } as CSSProperties
              }
            />
          </div>
        </div>
      ))}
      <div className={styles.actions}>
        <Button variant="primary" size="sm" onClick={() => setEnd(!end)}>
          Play
        </Button>
      </div>
    </div>
  );
}

/** Hold the pointer (or Space) on each sample to feel the press scale; it stays still under reduced motion. */
export function PressDemo() {
  return (
    <div className={styles.demo}>
      <div className={styles.actions}>
        <Button variant="primary">Press</Button>
        <Button variant="secondary">Secondary</Button>
        <button type="button" className={styles.pressSubtle}>
          Press subtle
        </button>
      </div>
      <p className={styles.note}>
        Buttons and small controls use <code>--lufia-motion-scale-press</code>; rows, cards and tabs use{" "}
        <code>--lufia-motion-scale-press-subtle</code>.
      </p>
    </div>
  );
}

/** Shows the live reduced-motion state so readers can see the tokens collapse. */
export function ReducedMotionReadout() {
  const reduced = usePrefersReducedMotion();
  return (
    <p role="status">
      Your system currently reports{" "}
      <strong>{reduced ? "prefers-reduced-motion: reduce" : "no reduced-motion preference"}</strong>.{" "}
      {reduced
        ? "The demos on this page jump to their end state."
        : "Switch on reduced motion in your system settings (or the browser devtools rendering panel) and play them again."}
    </p>
  );
}
