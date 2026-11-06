import { createElement, type ReactNode } from "react";

/** 24x24 stroke paths, one per sidebar section. Decorative: the label next to them is the name. */
const PATHS: Record<string, string> = {
  Introduction: "M4 11l8-7 8 7M6 10v10h12V10M10 20v-5h4v5",
  Foundations: "m12 3 9 5-9 5-9-5zM3 13l9 5 9-5",
  Components: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  Patterns: "M4 5h16v14H4zM4 10h16M10 10v9",
  Hooks: "m8 8-5 4 5 4M16 8l5 4-5 4M14 5l-4 14",
  Actions: "M13 3 5 14h6l-1 7 8-11h-6z",
  Forms: "M5 6h14M5 12h14M5 18h8",
  Overlays: "M4 8h16v12H4zM8 8V5h12v12h-3",
  Navigation: "m12 3 3 6 6 3-6 3-3 6-3-6-6-3 6-3z",
  "Data display": "M4 5h16v14H4zM4 10h16M4 15h16M10 5v14",
  Feedback: "M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20h4",
  Motion: "M8 5v14l11-7z",
  Utilities: "M14 6a4 4 0 0 0 5 5l-9 9-3-3 9-9z",
  Colors: "M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.8 1.5-1.8-.4-1.3.3-2.2 1.5-2.2H17a4 4 0 0 0 4-4c0-5-4-10-9-10z",
  Typography: "M5 7V5h14v2M12 5v14M9 19h6",
  Spacing: "M4 6v12M20 6v12M4 12h16M7 9l-3 3 3 3M17 9l3 3-3 3",
  Elevation: "m12 3 9 5-9 5-9-5zM3 12l9 5 9-5M3 16l9 5 9-5",
  "Radius and borders": "M5 19V9a4 4 0 0 1 4-4h10",
  "Creating a theme": "M4 20l6-6M14 4l6 6-8 8-6-6z",
};

/** Sidebar label with the section's icon in front; sections without an icon keep a plain label. */
export function labelWithIcon(name: string): ReactNode {
  const path = PATHS[name];
  if (!path) return name;
  const icon = createElement(
    "svg",
    {
      width: 14,
      height: 14,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.8,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": true,
      focusable: false,
      style: { flex: "none" },
    },
    createElement("path", { d: path }),
  );
  return createElement(
    "span",
    { style: { display: "inline-flex", gap: "0.5em", alignItems: "center" } },
    icon,
    name,
  );
}
