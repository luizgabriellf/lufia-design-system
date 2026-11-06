/** The anchored sections every component page is built from, in reading order. */
export const SECTIONS = {
  overview: "Overview",
  examples: "Examples",
  props: "Props",
  accessibility: "Accessibility",
  guidelines: "Guidelines",
} as const;

export type SectionId = keyof typeof SECTIONS;
