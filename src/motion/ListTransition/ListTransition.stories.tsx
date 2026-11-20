import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Button } from "../../components/Button";
import { ListTransition } from "./ListTransition";

type Task = { id: number; label: string };

const row = {
  padding: "0.75rem 1rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "var(--lufia-color-bg-surface)",
  borderBlockEnd: "1px solid var(--lufia-color-border-subtle)",
} as const;

function Demo({ initial }: { initial: number }) {
  const [tasks, setTasks] = useState<Task[]>(() =>
    Array.from({ length: initial }, (_, i) => ({ id: i + 1, label: `Task ${i + 1}` })),
  );
  const [next, setNext] = useState(initial + 1);
  return (
    <div style={{ display: "grid", gap: "0.75rem", inlineSize: "min(100%, 24rem)" }}>
      <Button
        onClick={() => {
          setTasks((current) => [{ id: next, label: `Task ${next}` }, ...current]);
          setNext(next + 1);
        }}
      >
        Add task
      </Button>
      <ListTransition
        items={tasks}
        getKey={(task) => task.id}
        aria-label="Tasks"
        style={{ listStyle: "none", margin: 0, padding: 0 }}
      >
        {(task) => (
          <div style={row}>
            {task.label}
            <Button
              variant="ghost"
              onClick={() => setTasks((current) => current.filter((t) => t.id !== task.id))}
            >
              Remove
            </Button>
          </div>
        )}
      </ListTransition>
    </div>
  );
}

const meta = {
  title: "Components/Motion/ListTransition",
  component: ListTransition,
  parameters: { layout: "padded" },
  render: () => <Demo initial={3} />,
} satisfies Meta<typeof ListTransition>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { items: [], getKey: () => 0, children: () => null } };
export const Empty: Story = { ...Default, render: () => <Demo initial={0} /> };
export const AllThemes: Story = {
  ...Default,
  render: () => (
    <ThemeMatrix>
      <Demo initial={3} />
    </ThemeMatrix>
  ),
};
