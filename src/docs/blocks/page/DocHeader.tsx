import { Unstyled } from "@storybook/addon-docs/blocks";
import { BookIcon, CodeIcon } from "../../demo";
import { entryFor, sourceUrlFor, type Entry } from "../../taxonomy";
import type { ComponentStatus } from "../../status";
import { REPO_URL } from "../links";
import { DocTabs } from "./DocTabs";
import type { SectionId } from "./sections";
import styles from "./DocPage.module.css";

type DocHeaderProps = {
  /** Export name; the summary, category and links come from the taxonomy. */
  name: string;
  status: ComponentStatus;
  /** Sections this page has, in order; they become the anchored tabs under the title. */
  sections: SectionId[];
};

const kindOf = (entry: Entry) =>
  entry.category === "Hooks" ? "Hook" : entry.dir === "motion" ? "Motion primitive" : "Component";

/** Top of every component page: breadcrumb, title, maturity, one-line description, reference links and the section tabs. */
export function DocHeader({ name, status, sections }: DocHeaderProps) {
  const entry = entryFor(name);
  const external = { target: "_blank", rel: "noreferrer noopener" } as const;
  return (
    <>
      <Unstyled>
        <header className={styles.header}>
          <p className={styles.crumb}>
            <span>{kindOf(entry)}</span>
            {entry.category === "Hooks" ? null : (
              <>
                <span aria-hidden="true" className={styles.crumbSep}>
                  /
                </span>
                <span>{entry.category}</span>
              </>
            )}
          </p>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{name}</h1>
            <span className={styles.status} data-status={status}>
              <span className={styles.statusDot} aria-hidden="true" />
              <span className={styles.srOnly}>Status: </span>
              {status}
            </span>
          </div>
          <p className={styles.summary}>{entry.summary}</p>
          <ul className={styles.links}>
            <li>
              <a className={styles.chip} href={sourceUrlFor(entry)} {...external}>
                <CodeIcon size={16} />
                Source on GitHub
                <span className={styles.srOnly}> (opens in a new tab)</span>
              </a>
            </li>
            {entry.apg ? (
              <li>
                <a className={styles.chip} href={entry.apg.path} {...external}>
                  <BookIcon size={16} />
                  WAI-ARIA: {entry.apg.label}
                  <span className={styles.srOnly}> (opens in a new tab)</span>
                </a>
              </li>
            ) : null}
            <li>
              <a className={styles.chip} href={`${REPO_URL}/blob/main/CHANGELOG.md`} {...external}>
                Changelog
                <span className={styles.srOnly}> (opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </header>
      </Unstyled>
      <DocTabs name={name} sections={sections} />
    </>
  );
}
