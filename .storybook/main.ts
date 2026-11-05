import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  typescript: { reactDocgen: "react-docgen-typescript" },
  viteFinal: async (viteConfig) => {
    // GitHub Pages serves the site from /<repo>/; STORYBOOK_BASE is set by the deploy workflow.
    viteConfig.base = process.env.STORYBOOK_BASE ?? "/";
    return viteConfig;
  },
};

export default config;
