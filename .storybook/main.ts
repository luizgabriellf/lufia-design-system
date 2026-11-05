import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  // Browser tab title; the manager appends "Storybook", which manager-head.html rewrites to the brand.
  title: "Lufia Design System",
  framework: "@storybook/react-vite",
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  // favicon, logos and the share image; Storybook picks up favicon.svg from here.
  staticDirs: ["./public"],
  typescript: { reactDocgen: "react-docgen-typescript" },
  viteFinal: async (viteConfig) => {
    // GitHub Pages serves the site from /<repo>/; STORYBOOK_BASE is set by the deploy workflow.
    viteConfig.base = process.env.STORYBOOK_BASE ?? "/";
    return viteConfig;
  },
};

export default config;
