import { useState } from "react";
import { usePrefersReducedMotion } from "../motion/usePrefersReducedMotion";
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
        <button type="button" onClick={() => setEnd(!end)}>
          Play
        </button>
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
        <button type="button" onClick={() => setEnd(!end)}>
          Play
        </button>
      </div>
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
