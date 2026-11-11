/** The order of the component categories in every generated index (llms.txt, the agent index). */
export const CATEGORY_ORDER = [
  "Actions",
  "Forms",
  "Overlays",
  "Navigation",
  "Data display",
  "Feedback",
  "Motion",
  "Utilities",
  "Hooks",
];

/** Components grouped by category in `CATEGORY_ORDER`; an unknown category goes last, empty ones are dropped. */
export function groupByCategory(components) {
  const groups = new Map(CATEGORY_ORDER.map((name) => [name, []]));
  for (const c of components) (groups.get(c.category) ?? groups.set(c.category, []).get(c.category)).push(c);
  return [...groups].filter(([, list]) => list.length > 0);
}
