import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Button } from "../Button";
import { LufiaLink, LufiaProvider, useLufia, type LinkComponent } from "./LufiaProvider";

/** Stands in for a router link: it intercepts the click and reports the target instead of leaving the page. */
function useRouterLink(onNavigate: (href: string) => void): LinkComponent {
  return function RouterLink({ href, onClick, children, ...rest }) {
    return (
      <a
        {...rest}
        href={href}
        onClick={(event) => {
          onClick?.(event);
          event.preventDefault();
          onNavigate(href);
        }}
      >
        {children}
      </a>
    );
  };
}

function LabelsReadout() {
  const { labels } = useLufia();
  return (
    <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.25rem 1rem" }}>
      {Object.entries(labels).map(([key, value]) => (
        <div key={key} style={{ display: "contents" }}>
          <dt style={{ color: "var(--lufia-color-text-muted)" }}>{key}</dt>
          <dd style={{ margin: 0 }}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Demo({ translated }: { translated: boolean }) {
  const [last, setLast] = useState<string | null>(null);
  const RouterLink = useRouterLink(setLast);
  return (
    <LufiaProvider
      linkComponent={RouterLink}
      labels={
        translated ? { close: "Fechar", dismiss: "Dispensar", notifications: "Notificações" } : undefined
      }
    >
      <div style={{ display: "grid", gap: "1rem", inlineSize: "min(100%, 24rem)" }}>
        <LabelsReadout />
        <LufiaLink href="/reports">Open reports</LufiaLink>
        <p style={{ margin: 0 }} aria-live="polite">
          {last
            ? `Router navigated to ${last}`
            : "Activate the link: the adapter handles it, the page does not reload."}
        </p>
        {last ? <Button onClick={() => setLast(null)}>Reset</Button> : null}
      </div>
    </LufiaProvider>
  );
}

const meta = {
  title: "Components/LufiaProvider",
  component: Demo,
  parameters: { layout: "padded" },
  args: { translated: false },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const TranslatedLabels: Story = { args: { translated: true } };
export const AllThemes: Story = {
  render: (args) => (
    <ThemeMatrix>
      <Demo {...args} />
    </ThemeMatrix>
  ),
};
