import { Unstyled } from "@storybook/addon-docs/blocks";
import { DocsLink } from "./DocsLink";
import { GALLERY_ENTRIES, type GalleryEntry } from "./galleryEntries";
import { CATEGORIES, ENTRIES, docsIdFor, entryFor, type Entry } from "../taxonomy";
import styles from "./ComponentGallery.module.css";

const PREVIEWS = new Map(GALLERY_ENTRIES.map((entry) => [entry.name, entry]));

function Card({ entry, preview }: { entry: Entry; preview: GalleryEntry }) {
  return (
    <li className={styles.card}>
      {/* The live preview repeats what the linked page shows, so it is decorative and not focusable. */}
      <div className={styles.preview} aria-hidden="true" inert>
        <div className={styles.previewInner}>{preview.preview}</div>
      </div>
      <div className={styles.body}>
        <h4 className={styles.name}>
          <DocsLink to={docsIdFor(entry.name)} className={styles.link}>
            {entry.name}
          </DocsLink>
        </h4>
        <p className={styles.summary}>{entry.summary}</p>
      </div>
    </li>
  );
}

const GROUPS = [...CATEGORIES, "Hooks"] as const;

/**
 * Every component, primitive and hook, grouped like the sidebar. Entries with a live preview get a card; the rest are
 * listed beneath as compact links, so a page never shows an empty preview.
 */
export function ComponentGallery() {
  return (
    <Unstyled>
      <div className={styles.gallery}>
        {GROUPS.map((group) => {
          const entries = ENTRIES.filter((entry) => entry.category === group);
          const cards = entries.filter((entry) => PREVIEWS.has(entry.name));
          const rest = entries.filter((entry) => !PREVIEWS.has(entry.name));
          return (
            <section key={group} aria-labelledby={`gallery-${group}`}>
              <h3 id={`gallery-${group}`} className={styles.groupTitle}>
                {group}
                <span className={styles.groupCount}>{entries.length}</span>
              </h3>
              {cards.length > 0 ? (
                <ul className={styles.grid}>
                  {cards.map((entry) => (
                    <Card key={entry.name} entry={entry} preview={PREVIEWS.get(entry.name) as GalleryEntry} />
                  ))}
                </ul>
              ) : null}
              {rest.length > 0 ? (
                <ul className={styles.more}>
                  {rest.map((entry) => (
                    <li key={entry.name}>
                      <DocsLink to={docsIdFor(entry.name)} className={styles.moreLink}>
                        <span className={styles.moreName}>{entry.name}</span>
                        <span className={styles.moreSummary}>{entryFor(entry.name).summary}</span>
                      </DocsLink>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          );
        })}
      </div>
    </Unstyled>
  );
}
