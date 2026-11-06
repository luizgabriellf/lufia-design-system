import { Unstyled } from "@storybook/addon-docs/blocks";
import { useEffect, useState } from "react";
import { SECTIONS, type SectionId } from "./sections";
import styles from "./DocPage.module.css";

/** Sticky anchor tabs. The one whose section is in view is marked `aria-current="location"`. */
export function DocTabs({ name, sections }: { name: string; sections: SectionId[] }) {
  const [active, setActive] = useState<SectionId>(sections[0] ?? "overview");

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        // The section nearest the top of the viewport wins.
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id as SectionId);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    for (const id of sections) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [sections]);

  return (
    <Unstyled>
      <nav className={styles.tabs} data-doc-tabs aria-label={`${name} sections`}>
        <ul>
          {sections.map((id) => (
            <li key={id}>
              <a href={`#${id}`} aria-current={active === id ? "location" : undefined}>
                {SECTIONS[id]}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </Unstyled>
  );
}
