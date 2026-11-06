import type { Decorator, Preview } from "@storybook/react-vite";
import { useEffect, type ReactNode } from "react";
import "../dist/tokens.css";
import "../dist/themes/default.css";
import "../dist/themes/example-brand.css";
import "./preview.css";
import "./docs.css";
import { LufiaDocsContainer } from "./DocsContainer";
import { ProseTable } from "./ProseTable";

const THEMES = ["default", "example-brand"] as const;
const MODES = ["light", "dark"] as const;

function ThemeBridge({
  theme,
  mode,
  docs,
  children,
}: {
  theme: string;
  mode: string;
  docs: boolean;
  children: ReactNode;
}) {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.lufiaTheme = theme;
    root.dataset.lufiaMode = mode;
  }, [theme, mode]);

  return (
    <div className="sb-surface" data-lufia-theme={theme} data-lufia-mode={mode} data-docs={docs || undefined}>
      {children}
    </div>
  );
}

const withTheme: Decorator = (Story, context) => (
  <ThemeBridge
    theme={(context.globals.theme as string) ?? "default"}
    mode={(context.globals.mode as string) ?? "light"}
    docs={context.viewMode === "docs"}
  >
    <Story />
  </ThemeBridge>
);

const preview: Preview = {
  decorators: [withTheme],
  initialGlobals: { theme: "default", mode: "light" },
  globalTypes: {
    theme: {
      description: "Theme",
      toolbar: { title: "Theme", icon: "paintbrush", items: [...THEMES], dynamicTitle: true },
    },
    mode: {
      description: "Colour mode",
      toolbar: { title: "Mode", icon: "circlehollow", items: [...MODES], dynamicTitle: true },
    },
  },
  parameters: {
    layout: "centered",
    controls: { expanded: true },
    docs: { container: LufiaDocsContainer, components: { table: ProseTable } },
    a11y: { test: "error" },
    backgrounds: { disabled: true },
    viewport: {
      options: {
        w320: { name: "320 · small phone", styles: { width: "320px", height: "640px" }, type: "mobile" },
        w390: { name: "390 · phone", styles: { width: "390px", height: "844px" }, type: "mobile" },
        w768: { name: "768 · tablet", styles: { width: "768px", height: "1024px" }, type: "tablet" },
        w1440: { name: "1440 · desktop", styles: { width: "1440px", height: "900px" }, type: "desktop" },
      },
    },
    options: {
      storySort: {
        method: "alphabetical",
        order: [
          "Introduction",
          "Foundations",
          [
            "Colors",
            "Typography",
            "Spacing",
            "Radius and borders",
            "Elevation",
            "Motion",
            "Creating a theme",
          ],
          "Components",
          ["Actions", "Forms", "Overlays", "Navigation", "Data display", "Feedback", "Motion", "Utilities"],
          "Patterns",
          "Hooks",
        ],
      },
    },
  },
};

export default preview;
