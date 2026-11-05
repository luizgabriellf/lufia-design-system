import { addons } from "storybook/manager-api";
import { lightTheme, themeFor } from "./theme";

addons.setConfig({
  theme: lightTheme,
  sidebar: { showRoots: true },
  toolbar: { zoom: { hidden: false } },
});

// The manager chrome follows the "Mode" toolbar global, the same switch that drives the previews.
addons.register("lufia/chrome-mode", (api) => {
  const apply = (globals: Record<string, unknown> | undefined) =>
    api.setOptions({ theme: themeFor(globals?.["mode"]) });
  api.on(
    "globalsUpdated",
    (payload: { userGlobals?: Record<string, unknown>; globals?: Record<string, unknown> }) =>
      apply(payload.userGlobals ?? payload.globals),
  );
  apply(api.getGlobals());
});
