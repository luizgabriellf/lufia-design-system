import { Unstyled } from "@storybook/addon-docs/blocks";
import { Button } from "../../components/Button";
import styles from "./ThemeShowcase.module.css";

const THEMES = ["default", "example-brand"] as const;
const MODES = ["light", "dark"] as const;

/** One small card rendered under each theme and mode, to show that the same markup is re-skinned by attributes alone. */
export function ThemeShowcase() {
  return (
    <Unstyled>
      <div className={styles.grid}>
        {THEMES.flatMap((theme) =>
          MODES.map((mode) => (
            <figure
              key={`${theme}-${mode}`}
              className={styles.tile}
              data-lufia-theme={theme}
              data-lufia-mode={mode}
              aria-label={`${theme} theme, ${mode} mode`}
            >
              <figcaption className={styles.caption}>
                <code>{`data-lufia-theme="${theme}"`}</code>
                <code>{`data-lufia-mode="${mode}"`}</code>
              </figcaption>
              <p className={styles.heading}>Quarterly review</p>
              <p className={styles.text}>Everything on this card reads semantic tokens.</p>
              <span className={styles.chips}>
                <span className={styles.chip} data-tone="ok">
                  On track
                </span>
                <span className={styles.chip} data-tone="warn">
                  Due soon
                </span>
              </span>
              <Button variant="primary" size="sm" tabIndex={-1}>
                Continue
              </Button>
            </figure>
          )),
        )}
      </div>
    </Unstyled>
  );
}
