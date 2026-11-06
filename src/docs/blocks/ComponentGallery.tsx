import { DocsLink } from "./DocsLink";
import { docsIdFor } from "../taxonomy";
import { GALLERY_ENTRIES, type GalleryEntry } from "./galleryEntries";
import { Unstyled } from "@storybook/addon-docs/blocks";
import styles from "./ComponentGallery.module.css";

const GROUP_LABELS = { Components: "Interface", Motion: "Motion primitives" } as const;

function Card({ entry }: { entry: GalleryEntry }) {
  return (
    <li className={styles.card}>
      {/* The live preview repeats what the linked page shows, so it is decorative and not focusable. */}
      <div className={styles.preview} aria-hidden="true" inert>
        <div className={styles.previewInner}>{entry.preview}</div>
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

/** Cards with a live mini-preview of every component and primitive, each linking to its docs page. */
export function ComponentGallery() {
  const groups = ["Components", "Motion"] as const;
  return (
    <Unstyled>
      <div className={styles.gallery}>
        {groups.map((group) => (
          <section key={group} aria-labelledby={`gallery-${group}`}>
            <h3 id={`gallery-${group}`} className={styles.groupTitle}>
              {GROUP_LABELS[group]}
            </h3>
            <ul className={styles.grid}>
              {GALLERY_ENTRIES.filter((entry) => entry.group === group).map((entry) => (
                <Card key={entry.name} entry={entry} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Unstyled>
  );
}
