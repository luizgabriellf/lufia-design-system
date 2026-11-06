import { Unstyled } from "@storybook/addon-docs/blocks";
import { DocsLink } from "../blocks/DocsLink";
import styles from "./patterns.module.css";

const PATTERNS = [
  {
    id: "patterns-settings-form",
    title: "Settings form",
    body: "Grouped fields, validation on blur, a pending submit and a toast.",
  },
  {
    id: "patterns-list-page",
    title: "List page",
    body: "Header, peer navigation, toolbar, pagination and an empty state.",
  },
  {
    id: "patterns-confirm-delete",
    title: "Confirm delete",
    body: "One specific question, progress, then Undo instead of a second prompt.",
  },
  {
    id: "patterns-detail-page",
    title: "Detail page",
    body: "Attention first, then the facts, then the history.",
  },
];

/** Cards that lead from the landing page to each pattern. */
export function PatternLinks() {
  return (
    <Unstyled>
      <ul className={styles.patternGrid}>
        {PATTERNS.map((pattern) => (
          <li key={pattern.id} className={styles.patternCard}>
            <h4 className={styles.patternTitle}>
              <DocsLink to={pattern.id} className={styles.patternLink}>
                {pattern.title}
              </DocsLink>
            </h4>
            <p className={styles.patternBody}>{pattern.body}</p>
          </li>
        ))}
      </ul>
    </Unstyled>
  );
}
