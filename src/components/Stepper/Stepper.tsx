import type { HTMLAttributes } from "react";
import styles from "./Stepper.module.css";

export type StepDef = {
  /** Stable key. */
  key: string;
  /** Short label shown under/next to the step number. */
  label: string;
};

export type StepperProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  steps: StepDef[];
  /** Index of the active step (0-based). */
  current: number;
  /** Optional: jump to an already-visited step. */
  onStepClick?: (index: number) => void;
};

/**
 * Mobile-first step indicator. On small screens it shows a compact
 * "X / N" caption with the active label plus a dot strip; from 600px
 * it expands into the full numbered row with connectors. The visually-hidden
 * status remains available at every viewport width so screen readers announce
 * each parent-driven step transition.
 */
export function Stepper({ steps, current, onStepClick, className, ...rest }: StepperProps) {
  const activeLabel = steps[current]?.label ?? "";

  return (
    <div {...rest} className={[styles.stepper, className].filter(Boolean).join(" ")}>
      <span className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">
        {current + 1} / {steps.length}: {activeLabel}
      </span>

      {/* Compact caption — visible on small screens */}
      <p className={styles.caption} aria-hidden="true">
        <span className={styles.captionCount}>
          {current + 1} / {steps.length}
        </span>
        <span className={styles.captionLabel}>{activeLabel}</span>
      </p>

      <ol className={styles.list}>
        {steps.map((step, i) => {
          const state = i < current ? "done" : i === current ? "active" : "todo";
          const mark = state === "done" ? "✓" : i + 1;
          const name = `${i + 1}. ${step.label}`;
          return (
            <li
              key={step.key}
              className={`${styles.step} ${styles[state]}`}
              aria-current={state === "active" ? "step" : undefined}
            >
              {onStepClick && i < current ? (
                <button type="button" className={styles.dot} onClick={() => onStepClick(i)} aria-label={name}>
                  {mark}
                </button>
              ) : (
                <span className={styles.dot}>
                  <span aria-hidden="true">{mark}</span>
                  <span className={styles.srOnly}>{name}</span>
                </span>
              )}
              <span className={styles.label} aria-hidden="true">
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
