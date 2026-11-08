import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Icon, createIcon } from "./Icon";
import { CheckIcon, CloseIcon, ICONS, SearchIcon, SettingsIcon, WarningIcon } from "./icons";

const meta = {
  title: "Components/Utilities/Icon",
  component: SettingsIcon,
  args: { size: "md" },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg", "1em", 32] },
    title: { control: "text" },
  },
} satisfies Meta<typeof SettingsIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(8.5rem, 1fr))",
  gap: "0.25rem",
  listStyle: "none",
  margin: 0,
  padding: 0,
} as const;

const cell = {
  display: "grid",
  justifyItems: "center",
  gap: "0.5rem",
  padding: "0.875rem 0.5rem",
  borderRadius: "var(--lufia-radius-md)",
  background: "var(--lufia-color-bg-surface)",
  color: "var(--lufia-color-text-default)",
  fontSize: "0.75rem",
  fontFamily: "var(--lufia-font-family-mono)",
  textAlign: "center",
  overflowWrap: "anywhere",
} as const;

/** Every icon of the set, by export name. */
export const Gallery: Story = {
  parameters: { layout: "padded" },
  render: (args) => (
    <ul style={grid} aria-label="Icon set">
      {Object.entries(ICONS).map(([name, Component]) => (
        <li key={name} style={cell}>
          <Component {...args} />
          {name}
        </li>
      ))}
    </ul>
  ),
};

/** `sm`, `md` and `lg`, side by side: the small size takes `--lufia-icon-stroke-sm`, so the weight reads the same. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "1rem", color: "var(--lufia-color-text-default)" }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <code style={{ inlineSize: "2rem" }}>{size}</code>
          <CloseIcon size={size} />
          <CheckIcon size={size} />
          <SearchIcon size={size} />
          <WarningIcon size={size} />
          <SettingsIcon size={size} />
        </div>
      ))}
    </div>
  ),
};

/** `size="1em"` follows the text it sits in. */
export const InlineWithText: Story = {
  render: () => (
    <p style={{ fontSize: "1.25rem", color: "var(--lufia-color-text-default)" }}>
      <WarningIcon size="1em" /> Inline at the size of the text
    </p>
  ),
};

/** A title (or an aria-label) turns the icon into an image with an accessible name. */
export const Meaningful: Story = { args: { title: "Settings", size: "lg" } };

const RouteIcon = createIcon("route", [
  "M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  "M18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  "M8 17h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7",
]);

/** An app's own glyph with `createIcon`: same grid, stroke, sizes and accessibility rules as the set. */
export const AppIcon: Story = {
  render: () => (
    <div
      style={{ display: "flex", gap: "1rem", alignItems: "center", color: "var(--lufia-color-text-default)" }}
    >
      <RouteIcon size="sm" />
      <RouteIcon />
      <RouteIcon size="lg" />
      <Icon size="lg">
        <rect x="4" y="4" width="16" height="16" rx="3" />
      </Icon>
    </div>
  ),
};

export const AllThemes: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <ThemeMatrix>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, color: "var(--lufia-color-text-default)" }}>
        {Object.entries(ICONS)
          .slice(0, 16)
          .map(([name, Component]) => (
            <Component key={name} />
          ))}
      </div>
    </ThemeMatrix>
  ),
};
