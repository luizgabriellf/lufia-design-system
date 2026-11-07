import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Button } from "../../components/Button";
import { RouteTransition, type RouteTransitionProps } from "./RouteTransition";

const PAGES = ["/overview", "/reports", "/settings"] as const;

const panel = {
  padding: "1rem",
  background: "var(--lufia-color-bg-surface)",
  border: "1px solid var(--lufia-color-border-subtle)",
  borderRadius: "var(--lufia-radius-card)",
} as const;

function Demo(args: RouteTransitionProps) {
  const [page, setPage] = useState<string>(PAGES[0]);
  return (
    <div style={{ display: "grid", gap: "0.75rem", inlineSize: "min(100%, 28rem)" }}>
      <nav aria-label="Pages" style={{ display: "flex", gap: "0.5rem" }}>
        {PAGES.map((path) => (
          <Button key={path} size="sm" aria-pressed={page === path} onClick={() => setPage(path)}>
            {path}
          </Button>
        ))}
      </nav>
      <RouteTransition {...args} transitionKey={page}>
        <aside data-route-static="" style={panel}>
          Persistent banner: never animates.
        </aside>
        <main style={panel}>
          <h2 style={{ margin: 0 }}>{page}</h2>
          <p>The page content enters when the key changes.</p>
        </main>
      </RouteTransition>
    </div>
  );
}

const meta = {
  title: "Components/Motion/RouteTransition",
  component: RouteTransition,
  parameters: { layout: "padded" },
  args: { transitionKey: "/overview" },
  argTypes: { variant: { control: "inline-radio", options: ["rise", "fade"] } },
} satisfies Meta<typeof RouteTransition>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Rise: Story = { render: (args) => <Demo {...args} /> };
export const Fade: Story = { args: { variant: "fade" }, render: (args) => <Demo {...args} /> };
export const AllThemes: Story = {
  render: (args) => (
    <ThemeMatrix>
      <RouteTransition {...args}>
        <main style={panel}>Page content</main>
      </RouteTransition>
    </ThemeMatrix>
  ),
};
