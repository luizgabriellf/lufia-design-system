import { useEffect, useState } from "react";
import { addons } from "storybook/preview-api";

export type ToolbarGlobals = { theme: string; mode: string };

/** Sets the theme attributes the tokens read. MDX-only pages have no story decorator, so docs call this too. */
export function applyToolbarGlobals({ theme, mode }: ToolbarGlobals) {
  const root = document.documentElement;
  root.dataset.lufiaTheme = theme;
  root.dataset.lufiaMode = mode;
}

/** `?globals=mode:dark;theme:example-brand` is how Storybook hands the toolbar state to a freshly loaded iframe. */
function fromUrl(): ToolbarGlobals {
  const found: ToolbarGlobals = { theme: "default", mode: "light" };
  const raw = new URLSearchParams(window.location.search).get("globals");
  for (const pair of raw?.split(";") ?? []) {
    const [key, value] = pair.split(":");
    if ((key === "theme" || key === "mode") && value) found[key] = value;
  }
  return found;
}

/** Tracks the Theme and Mode toolbar globals, for docs pages that render outside a story. */
export function useToolbarGlobals(): ToolbarGlobals {
  const [globals, setGlobals] = useState<ToolbarGlobals>(() =>
    typeof window === "undefined" ? { theme: "default", mode: "light" } : fromUrl(),
  );

  useEffect(() => {
    const channel = addons.getChannel();
    const onChange = (payload: {
      userGlobals?: Record<string, unknown>;
      globals?: Record<string, unknown>;
    }) => {
      const next = payload.userGlobals ?? payload.globals;
      if (!next) return;
      setGlobals((current) => ({
        theme: typeof next["theme"] === "string" ? next["theme"] : current.theme,
        mode: typeof next["mode"] === "string" ? next["mode"] : current.mode,
      }));
    };
    channel.on("globalsUpdated", onChange);
    channel.on("setGlobals", onChange);
    return () => {
      channel.off("globalsUpdated", onChange);
      channel.off("setGlobals", onChange);
    };
  }, []);

  useEffect(() => applyToolbarGlobals(globals), [globals]);
  return globals;
}
