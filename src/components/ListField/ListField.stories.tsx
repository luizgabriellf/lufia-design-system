import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { ListField, type ListFieldHandle, type ListFieldLabels } from "./ListField";

const labels: ListFieldLabels = {
  add: "Add",
  remove: (index, text) => `Remove entry ${index}: ${text}`,
  entry: (index) => `Entry ${index}`,
  requiredMessage: "Add at least one entry.",
};

const meta = {
  title: "Components/Forms/ListField",
  component: ListField,
  parameters: { layout: "padded" },
  args: {
    label: "Responsibilities",
    labels,
    name: "responsibilities",
    placeholder: "Type an entry and press Enter",
    defaultItems: ["Inspect the site", "File the report"],
  },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 28rem)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ListField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = { args: { defaultItems: [] } };
export const WithHintAndBadge: Story = {
  args: { hint: "One line per entry. Enter adds it.", badge: <Badge tone="info">Optional</Badge> },
};
/** The parent owns the list; the line under the field shows what it holds. */
export const Controlled: Story = {
  render: (args) => {
    const [items, setItems] = useState<string[]>(["Inspect the site", "File the report"]);
    return (
      <div style={{ display: "grid", gap: "0.75rem" }}>
        <ListField {...args} items={items} onChange={setItems} />
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <Button variant="secondary" onClick={() => setItems(["Replaced from outside"])}>
            Replace the list
          </Button>
        </div>
        <p style={{ margin: 0, fontSize: "0.875rem" }}>Held: {JSON.stringify(items)}</p>
      </div>
    );
  },
};
/** `required` needs one entry; submitting an empty field shows the message. `commitDraft()` adds typed text first. */
export const Required: Story = {
  args: { required: true, defaultItems: [] },
  render: (args) => {
    const field = useRef<ListFieldHandle>(null);
    const [sent, setSent] = useState("");
    return (
      <form
        style={{ display: "grid", gap: "0.75rem" }}
        onSubmit={(event) => {
          event.preventDefault();
          setSent(String(new FormData(event.currentTarget).get("responsibilities")));
        }}
      >
        <ListField {...args} ref={field} />
        <div>
          <Button
            type="submit"
            onClick={() => {
              field.current?.commitDraft();
            }}
          >
            Save
          </Button>
        </div>
        <p style={{ margin: 0, fontSize: "0.875rem" }}>
          Submitted: {sent ? JSON.stringify(sent) : "nothing yet"}
        </p>
      </form>
    );
  },
};
/** With `includeDraft`, text still in the add input is submitted and satisfies `required`: no `commitDraft()` call. */
export const IncludeDraft: Story = {
  args: { required: true, includeDraft: true, defaultItems: [] },
  render: (args) => {
    const [sent, setSent] = useState("");
    return (
      <form
        style={{ display: "grid", gap: "0.75rem" }}
        onSubmit={(event) => {
          event.preventDefault();
          setSent(String(new FormData(event.currentTarget).get("responsibilities")));
        }}
      >
        <ListField {...args} />
        <div>
          <Button type="submit">Save</Button>
        </div>
        <p style={{ margin: 0, fontSize: "0.875rem" }}>
          Submitted: {sent ? JSON.stringify(sent) : "nothing yet"}
        </p>
      </form>
    );
  },
};
/** `labels.addInput` names the add input apart from the group and the button. */
export const NamedAddInput: Story = {
  args: {
    label: "Hazards",
    labels: { ...labels, add: "Add", addInput: "New hazard" },
    defaultItems: ["Open trench"],
  },
};
export const Invalid: Story = {
  args: { required: true, error: "Add at least one entry.", defaultItems: [] },
};
export const Disabled: Story = { args: { disabled: true } };
/** `maxTotalLength` limits the serialized value: the add input shrinks to the room left, then adding is disabled. */
export const Full: Story = {
  args: {
    defaultItems: ["First entry", "Second entry"],
    maxTotalLength: 40,
    hint: "At most 40 characters in all.",
  },
};
export const MaxItems: Story = { args: { maxItems: 3, defaultItems: ["One", "Two", "Three"] } };
export const LongEntries: Story = {
  args: {
    defaultItems: [
      "An entry that is much too long to fit inside the box without being clipped at the end of the line",
      "Short",
      "Another long entry with enough words to run past the width of a phone screen",
    ],
  },
};
export const Phone320: Story = {
  args: { defaultItems: ["Inspect the site", "A longer entry for a narrow screen"] },
  globals: { viewport: { value: "w320", isRotated: false } },
};
export const RightToLeft: Story = {
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};
export const AllThemes: Story = {
  render: (args) => (
    <ThemeMatrix>
      <ListField {...args} />
      <div style={{ marginBlockStart: "1rem" }}>
        <ListField {...args} name={undefined} disabled />
      </div>
    </ThemeMatrix>
  ),
};
