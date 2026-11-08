import js from "@eslint/js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import storybook from "eslint-plugin-storybook";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist",
      "storybook-static",
      "coverage",
      "src/tokens/generated",
      "node_modules",
      "playwright-report",
      "test-results",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  jsxA11y.flatConfigs.recommended,
  reactHooks.configs.flat.recommended,
  ...storybook.configs["flat/recommended"],
  {
    settings: { react: { version: "detect" } },
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      "react/prop-types": "off",
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  {
    // No hand-drawn icons in components (docs/STANDARDS.md, "Icons"): use the icon set, `StatusIcon`, or `createIcon`.
    // Charts draw data, not icons, so they are exempt.
    files: ["src/components/**/*.tsx", "src/motion/**/*.tsx"],
    ignores: [
      "src/components/Icon/**",
      "src/components/StatusIcon/**",
      "src/components/Sparkline/**",
      "**/*.test.tsx",
      "**/*.stories.tsx",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXOpeningElement[name.name='svg']",
          message:
            "Hand-drawn inline SVG icon. Use a named icon or StatusIcon from components/Icon, or createIcon() for a new glyph.",
        },
        {
          selector:
            "JSXText[value=/[\\u2713\\u2714\\u2715\\u2716\\u00D7\\u2191\\u2193\\u2190\\u2192\\u203A\\u2039\\u22EE\\u26A0]/]",
          message: "Unicode glyph used as an icon. Use a named icon from components/Icon instead.",
        },
      ],
    },
  },
  {
    files: ["**/*.test.{ts,tsx}", "src/test/**"],
    languageOptions: { globals: { ...globals.vitest } },
  },
);
