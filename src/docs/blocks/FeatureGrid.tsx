import { Unstyled } from "@storybook/addon-docs/blocks";
import type { ComponentType } from "react";
import { ShieldIcon, SlidersIcon, WaveIcon, DocumentIcon } from "../demo";
import styles from "./FeatureGrid.module.css";

type Feature = { title: string; body: string; Icon: ComponentType<{ size?: number }> };

const FEATURES: Feature[] = [
  {
    title: "Accessible by default",
    body: "Every component has an axe test and documented keyboard behaviour. Contrast is checked against WCAG 2.2 AA in every theme and mode, from 320 to 1440 px.",
    Icon: ShieldIcon,
  },
  {
    title: "Themeable with W3C tokens",
    body: "Tokens are written in the DTCG format and built into --lufia-* custom properties. Components read semantic tokens only, so a brand is a file, not a fork.",
    Icon: SlidersIcon,
  },
  {
    title: "Motion that respects people",
    body: "Duration, easing and distance tokens collapse under prefers-reduced-motion. Motion primitives, plus a CLI that checks your own source against the rules.",
    Icon: WaveIcon,
  },
  {
    title: "No app coupling",
    body: "Every user-facing string is a prop and styling is plain CSS Modules. No router, i18n or data layer inside a component, and static ones render in Server Components.",
    Icon: DocumentIcon,
  },
];

/** The four things the package promises, as a grid of short cards. */
export function FeatureGrid() {
  return (
    <Unstyled>
      <ul className={styles.grid}>
        {FEATURES.map(({ title, body, Icon }) => (
          <li key={title} className={styles.card}>
            <span className={styles.icon}>
              <Icon size={22} />
            </span>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.body}>{body}</p>
          </li>
        ))}
      </ul>
    </Unstyled>
  );
}
