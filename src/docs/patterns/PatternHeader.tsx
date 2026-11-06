import { Unstyled } from "@storybook/addon-docs/blocks";
import type { ReactNode } from "react";
import { DocsLink } from "../blocks/DocsLink";
import { docsIdFor } from "../taxonomy";
import styles from "./patterns.module.css";

/** Top of a pattern page: title, summary and the components the pattern is built from, each linking to its page. */
export function PatternHeader({
  kind = "Pattern",
  title,
  summary,
  uses = [],
}: {
  /** Shown above the title; "Pattern" for composed pages, "Foundation" for token pages. */
  kind?: string;
  title: string;
  summary: string;
  /** Names of the components used, as in the taxonomy. */
  uses?: string[];
}) {
  return (
    <Unstyled>
      <header className={styles.header}>
        <p className={styles.crumb}>{kind}</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.summary}>{summary}</p>
        {uses.length > 0 ? (
          <div className={styles.uses}>
            <span className={styles.usesLabel}>Built from</span>
            <ul className={styles.chips}>
              {uses.map((name) => (
                <li key={name}>
                  <DocsLink to={docsIdFor(name)} className={styles.chip}>
                    {name}
                  </DocsLink>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </header>
    </Unstyled>
  );
}

/** A framed, live composition. Everything inside is interactive. */
export function PatternFrame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Unstyled>
      <section className={styles.frame} aria-label={label}>
        <div className={styles.frameBar} aria-hidden="true">
          <span />
          <span />
          <span />
          <b>{label}</b>
        </div>
        <div className={styles.frameBody}>{children}</div>
      </section>
    </Unstyled>
  );
}
