import { create } from "storybook/theming/create";
import tokens from "../dist/tokens.json";

type Mode = "light" | "dark";
type TokenMap = Record<string, { value: string }>;

const themes = tokens.themes as unknown as Record<string, Record<Mode, TokenMap>>;
const shared = tokens.shared as unknown as TokenMap;

/** Reads one semantic colour of the default theme, so the Storybook chrome is derived from the package tokens. */
const colorOf = (mode: Mode, path: string): string => {
  const value = themes["default"]?.[mode]?.[`color.${path}`]?.value;
  if (!value) throw new Error(`Missing token color.${path} in default/${mode}; run "npm run tokens".`);
  return value;
};

const fontBase = shared["font.family.body"]?.value ?? "system-ui, sans-serif";
const fontCode = shared["font.family.mono"]?.value ?? "ui-monospace, monospace";

export const REPO_URL = "https://github.com/luizgabriellf/lufia-design-system";

const brand = (mode: Mode) => ({
  brandTitle: "Lufia Design System",
  brandUrl: REPO_URL,
  brandTarget: "_blank",
  brandImage: mode === "dark" ? "./logo-dark.svg" : "./logo.svg",
});

const build = (mode: Mode) =>
  create({
    base: mode,
    ...brand(mode),
    colorPrimary: colorOf(mode, "accent.default"),
    colorSecondary: colorOf(mode, "accent.default"),
    appBg: colorOf(mode, mode === "light" ? "bg.surface" : "bg.surface-solid"),
    appContentBg: colorOf(mode, "bg.canvas"),
    appPreviewBg: colorOf(mode, "bg.canvas"),
    appHoverBg: colorOf(mode, "bg.surface-raised"),
    appBorderColor: colorOf(mode, "border.subtle"),
    appBorderRadius: 11,
    fontBase,
    fontCode,
    textColor: colorOf(mode, "text.default"),
    textInverseColor: colorOf(mode, "text.on-accent"),
    textMutedColor: colorOf(mode, "text.muted"),
    barTextColor: colorOf(mode, "text.muted"),
    barHoverColor: colorOf(mode, "text.accent"),
    barSelectedColor: colorOf(mode, "text.accent"),
    barBg: colorOf(mode, mode === "light" ? "bg.surface" : "bg.surface-solid"),
    buttonBg: colorOf(mode, "bg.field"),
    buttonBorder: colorOf(mode, "border.strong"),
    booleanBg: colorOf(mode, "bg.surface-raised"),
    booleanSelectedBg: colorOf(mode, "bg.field"),
    inputBg: colorOf(mode, "bg.field"),
    inputBorder: colorOf(mode, "border.strong"),
    inputTextColor: colorOf(mode, "text.default"),
    inputBorderRadius: 9,
  });

export const lightTheme = build("light");
export const darkTheme = build("dark");

/** The mode a toolbar value selects; anything unknown falls back to light. */
export const themeFor = (mode: unknown) => (mode === "dark" ? darkTheme : lightTheme);
