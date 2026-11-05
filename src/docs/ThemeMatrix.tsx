import type { ReactNode } from "react";
import styles from "./ThemeMatrix.module.css";

const THEMES = ["default", "example-brand"] as const;
const MODES = ["light", "dark"] as const;

/** Renders its children once per theme and mode so a single story shows all four combinations side by side. */
export function ThemeMatrix({ children }: { children: ReactNode }) {
  return (
    <div className={styles.grid}>
      {THEMES.flatMap((theme) =>
        MODES.map((mode) => (
          <section
            key={`${theme}-${mode}`}
            className={styles.cell}
            data-lufia-theme={theme}
            data-lufia-mode={mode}
            aria-label={`${theme} ${mode}`}
          >
            <p className={styles.label}>
              {theme} / {mode}
            </p>
            {children}
          </section>
        )),
      )}
    </div>
  );
}
