import { DocsContainer } from "@storybook/addon-docs/blocks";
import type { ComponentProps } from "react";
import { themeFor } from "./theme";
import { useToolbarGlobals } from "./useToolbarGlobals";

/** Docs container whose prose, code and tables take the colours of the selected Mode. */
export function LufiaDocsContainer(props: ComponentProps<typeof DocsContainer>) {
  const { mode, theme } = useToolbarGlobals();
  return <DocsContainer {...props} theme={themeFor(mode, theme)} />;
}
