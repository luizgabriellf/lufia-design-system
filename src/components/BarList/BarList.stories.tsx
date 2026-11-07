import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { BarList, type BarListRow } from "./BarList";

const rows: BarListRow[] = [
  { key: "north", name: "North", note: "12 sites", value: "1,240", amount: 1240 },
  { key: "south", name: "South", note: "9 sites", value: "860", amount: 860 },
  {
    key: "east",
    name: "East",
    note: "4 sites",
    value: "310",
    detail: "-8% vs last month",
    amount: 310,
    tone: "warning",
  },
  { key: "west", name: "West", note: "0 sites", value: "0", amount: 0, tone: "neutral" },
];

const meta = {
  title: "Components/Data display/BarList",
  component: BarList,
  parameters: { layout: "padded" },
  args: { title: "Items by region", summary: "North has the most items, West has none.", rows },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 26rem)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BarList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithTotal: Story = { args: { total: { label: "Total", value: "2,410" } } };
export const Tones: Story = {
  args: {
    rows: [
      { key: "a", name: "Accent", value: "5", amount: 5 },
      { key: "b", name: "Success", value: "4", amount: 4, tone: "success" },
      { key: "c", name: "Warning", value: "3", amount: 3, tone: "warning" },
      { key: "d", name: "Danger", value: "2", amount: 2, tone: "danger" },
      { key: "e", name: "Neutral", value: "1", amount: 1, tone: "neutral" },
    ],
  },
};
export const LongNames: Story = {
  args: {
    rows: [
      {
        key: "a",
        name: "A very long region name that has to wrap instead of pushing the value away",
        value: "1,240,000",
        amount: 1240,
      },
      { key: "b", name: "Short", value: "20", amount: 20 },
    ],
  },
};
export const LongValues: Story = {
  args: {
    valueWrap: true,
    rows: [
      {
        key: "a",
        name: "Norte",
        value: "12 de 40 instalações verificadas, 3 com pendências críticas",
        detail: "Atualizado ontem às 18:30, falta a vistoria de duas instalações",
        amount: 12,
      },
      { key: "b", name: "Sul", value: "8 de 40", amount: 8 },
      { key: "c", name: "Nome de região muito longo que tem de quebrar linha", value: "0", amount: 0 },
    ],
  },
};
export const LongValuesPhone320: Story = {
  args: LongValues.args,
  globals: { viewport: { value: "w320", isRotated: false } },
};
export const WithReference: Story = {
  args: { reference: { amount: 800, label: "Target: 800 per region" } },
};
export const ReferenceAboveEveryBar: Story = {
  args: { reference: { amount: 2000, label: "Target: 2,000 per region" } },
};
export const ReferenceLongText: Story = {
  args: {
    reference: {
      amount: 800,
      label: "Meta mensal acordada com a administração para cada região, revista no início de cada trimestre",
    },
  },
};
export const HiddenTitle: Story = { args: { titleVisibility: "hidden" } };
export const AllZero: Story = { args: { rows: [{ key: "a", name: "Nothing yet", value: "0", amount: 0 }] } };
export const Empty: Story = { args: { rows: [] } };
export const Phone320: Story = {
  args: { reference: { amount: 800, label: "Target: 800 per region" } },
  globals: { viewport: { value: "w320", isRotated: false } },
};
export const RightToLeft: Story = {
  decorators: [
    (Story) => (
      <div dir="rtl" style={{ inlineSize: "min(100%, 26rem)" }}>
        <Story />
      </div>
    ),
  ],
};
export const AllThemes: Story = {
  decorators: [],
  render: (args) => (
    <ThemeMatrix>
      <BarList {...args} total={{ label: "Total", value: "2,410" }} />
    </ThemeMatrix>
  ),
};
