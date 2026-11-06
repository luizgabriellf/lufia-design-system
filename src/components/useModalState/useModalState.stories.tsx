import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, useState } from "react";
import { DemoButton } from "../../docs/demo";
import { useModalState, type ModalStateAdapter } from "./useModalState";

/** An in-memory "URL", so the demo works inside Storybook's iframe without touching its real address bar. */
function useMemoryAdapter(initial: string): { adapter: ModalStateAdapter; search: string } {
  const [search, setSearch] = useState(initial);
  const adapter = useMemo<ModalStateAdapter>(
    () => ({ get: () => new URLSearchParams(search), set: (params) => setSearch(params.toString()) }),
    [search],
  );
  return { adapter, search };
}

function Demo({ initial }: { initial: string }) {
  const { adapter, search } = useMemoryAdapter(initial);
  const { modal, id, open, close } = useModalState({ adapter });
  return (
    <div style={{ display: "grid", gap: "0.75rem", justifyItems: "start" }}>
      <code>?{search || "(empty)"}</code>
      <p style={{ margin: 0 }}>{modal ? `Open: ${modal}${id ? ` #${id}` : ""}` : "No modal is open."}</p>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <DemoButton onClick={() => open("detail", "42")}>Open detail</DemoButton>
        <DemoButton onClick={() => open("history", "42")}>Open history</DemoButton>
        <DemoButton onClick={close} disabled={!modal}>
          Close
        </DemoButton>
      </div>
    </div>
  );
}

const meta = {
  title: "Components/useModalState",
  component: Demo,
  parameters: { layout: "padded" },
  args: { initial: "" },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const OpensFromTheUrl: Story = { args: { initial: "status=open&modal=detail&id=42" } };
export const ReturnsToTheParent: Story = {
  name: "Returns to the parent",
  args: { initial: "modal=detail&id=42" },
};
