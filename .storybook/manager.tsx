import { addons } from "storybook/manager-api";
import { labelWithIcon } from "./sidebarIcons";
import { lightTheme, themeFor } from "./theme";

addons.setConfig({
  theme: lightTheme,
  sidebar: {
    showRoots: true,
    // Icons on the top-level sections and on the groups of Components; leaves keep a plain label.
    renderLabel: (item) =>
      item.type === "root" || item.type === "group" || item.depth === 0
        ? labelWithIcon(item.name)
        : item.name,
  },
  toolbar: { zoom: { hidden: false } },
});

// The manager chrome follows the "Mode" toolbar global, the same switch that drives the previews.
addons.register("lufia/chrome-mode", (api) => {
  const apply = (globals: Record<string, unknown> | undefined) =>
    api.setOptions({ theme: themeFor(globals?.["mode"], globals?.["theme"]) });
  api.on(
    "globalsUpdated",
    (payload: { userGlobals?: Record<string, unknown>; globals?: Record<string, unknown> }) =>
      apply(payload.userGlobals ?? payload.globals),
  );
  apply(api.getGlobals());
});
