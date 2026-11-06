import { create } from "storybook/theming/create";
import tokens from "../dist/tokens.json";

type Mode = "light" | "dark";
type TokenMap = Record<string, { value: string }>;

const themes = tokens.themes as unknown as Record<string, Record<Mode, TokenMap>>;
const shared = tokens.shared as unknown as TokenMap;

/**
 * Reads one semantic colour of a theme, so the Storybook chrome is derived from the package tokens. A theme that does
 * not override a token inherits the default theme's value, the same way the CSS cascade does.
 */
const colorOf = (theme: string, mode: Mode, path: string): string => {
  const key = `color.${path}`;
  const value = themes[theme]?.[mode]?.[key]?.value ?? themes["default"]?.[mode]?.[key]?.value;
  if (!value) throw new Error(`Missing token color.${path} in default/${mode}; run "npm run tokens".`);
  return value;
};

// The docs site sets its own type (self-hosted Geist, see public/fonts); the package's font tokens stay system stacks.
const fontBase = `"Geist Variable", ${shared["font.family.body"]?.value ?? "system-ui, sans-serif"}`;
const fontCode = `"Geist Mono Variable", ${shared["font.family.mono"]?.value ?? "ui-monospace, monospace"}`;

export const REPO_URL = "https://github.com/luizgabriellf/lufia-design-system";

const brand = (mode: Mode) => ({
  brandTitle: "Lufia Design System",
  brandUrl: REPO_URL,
  brandTarget: "_blank",
  brandImage: mode === "dark" ? "./logo-dark.svg" : "./logo.svg",
});

const build = (theme: string, mode: Mode) => {
  const color = (path: string) => colorOf(theme, mode, path);
  return create({
    base: mode,
    ...brand(mode),
    colorPrimary: color("accent.default"),
    colorSecondary: color("accent.default"),
    appBg: color(mode === "light" ? "bg.surface" : "bg.surface-solid"),
    appContentBg: color("bg.canvas"),
    appPreviewBg: color("bg.canvas"),
    appHoverBg: color("bg.surface-raised"),
    appBorderColor: color("border.subtle"),
    appBorderRadius: 11,
    fontBase,
    fontCode,
    textColor: color("text.default"),
    textInverseColor: color("text.on-accent"),
    textMutedColor: color("text.muted"),
    barTextColor: color("text.muted"),
    barHoverColor: color("text.accent"),
    barSelectedColor: color("text.accent"),
    barBg: color(mode === "light" ? "bg.surface" : "bg.surface-solid"),
    buttonBg: color("bg.field"),
    buttonBorder: color("border.strong"),
    booleanBg: color("bg.surface-raised"),
    booleanSelectedBg: color("bg.field"),
    inputBg: color("bg.field"),
    inputBorder: color("border.strong"),
    inputTextColor: color("text.default"),
    inputBorderRadius: 9,
  });
};

const cache = new Map<string, ReturnType<typeof build>>();

/** The chrome theme for a Theme and Mode toolbar value; anything unknown falls back to default and light. */
export const themeFor = (mode: unknown, theme?: unknown) => {
  const themeName = typeof theme === "string" && themes[theme] ? theme : "default";
  const resolved: Mode = mode === "dark" ? "dark" : "light";
  const key = `${themeName}/${resolved}`;
  let built = cache.get(key);
  if (!built) {
    built = build(themeName, resolved);
    cache.set(key, built);
  }
  return built;
};

export const lightTheme = themeFor("light");
export const darkTheme = themeFor("dark");
