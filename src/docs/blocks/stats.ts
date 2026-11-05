import { tokensData } from "../tokensData";
import { GALLERY_ENTRIES } from "./galleryEntries";

/** Figures shown on the landing page, computed from the real token build so they cannot drift. */
export function landingStats() {
  const themeNames = Object.keys(tokensData.themes);
  const modes = new Set(themeNames.flatMap((name) => Object.keys(tokensData.themes[name] ?? {})));
  const colourTokens = Object.keys(tokensData.themes[themeNames[0] ?? "default"]?.["light"] ?? {}).length;
  return {
    components: GALLERY_ENTRIES.length,
    tokens: Object.keys(tokensData.shared).length + colourTokens,
    themes: themeNames.length,
    modes: modes.size,
  };
}
