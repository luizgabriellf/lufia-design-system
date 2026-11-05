import { configureAxe } from "vitest-axe";

/** axe with colour-contrast off: jsdom has no layout or computed theme, contrast is covered by `npm run contrast`. */
export const axe = configureAxe({ rules: { "color-contrast": { enabled: false } } });
