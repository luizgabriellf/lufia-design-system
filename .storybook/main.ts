import type { StorybookConfig } from "@storybook/react-vite";
import remarkGfm from "remark-gfm";

const config: StorybookConfig = {
  // Browser tab title; the manager appends "Storybook", which manager-head.html rewrites to the brand.
  title: "Lufia Design System",
  framework: "@storybook/react-vite",
  // Native Storybook component metadata for agents; distinct from docs/ai/components.json.
  features: { componentsManifest: true },
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  addons: [
    {
      name: "@storybook/addon-docs",
      // GitHub-flavoured Markdown, so the pipe tables in the component pages render as tables.
      options: { mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } } },
    },
    "@storybook/addon-a11y",
    // Live MCP server for local coding agents. Published GitHub Pages stays static.
    {
      name: "@storybook/addon-mcp",
      options: { toolsets: { docs: true, dev: true, test: false } },
    },
  ],
  // favicon, logos and the share image; Storybook picks up favicon.svg from here.
  staticDirs: ["./public"],
  typescript: { reactDocgen: "react-docgen-typescript" },
  viteFinal: async (viteConfig) => {
    // GitHub Pages serves the site from /<repo>/; STORYBOOK_BASE is set by the deploy workflow.
    viteConfig.base = process.env.STORYBOOK_BASE ?? "/";
    // Keep `:dir()` as written. Against the default CSS target the minifier rewrites `:dir(rtl)` into a list of
    // `:lang()` selectors, which never match an element that only sets `dir`, so the right-to-left stories would
    // show left-to-right behaviour that the package itself does not have.
    viteConfig.build = {
      ...viteConfig.build,
      cssTarget: ["chrome120", "edge120", "firefox115", "safari16.4"],
    };
    return viteConfig;
  },
};

export default config;
