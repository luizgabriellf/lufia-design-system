import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { ColumnChart, type ColumnChartColumn, type ColumnChartSeries } from "./ColumnChart";

const series: ColumnChartSeries[] = [{ key: "done", label: "Deliveries" }];
const week: ColumnChartColumn[] = [
  { key: "mon", label: "Mon", values: [4] },
  { key: "tue", label: "Tue", values: [8] },
  { key: "wed", label: "Wed", values: [6] },
  { key: "thu", label: "Thu", values: [0] },
  { key: "fri", label: "Fri", values: [9] },
  { key: "sat", label: "Sat", values: [2] },
  { key: "sun", label: "Sun", values: [0] },
];

const stackedSeries: ColumnChartSeries[] = [
  { key: "ok", label: "On time", tone: "success" },
  { key: "late", label: "Late", tone: "danger" },
  { key: "open", label: "Still open", tone: "neutral" },
];
const stackedColumns: ColumnChartColumn[] = [
  { key: "w1", label: "Week 1", values: [6, 2, 1] },
  { key: "w2", label: "Week 2", values: [8, 1, 2] },
  { key: "w3", label: "Week 3", values: [3, 4, 3] },
  { key: "w4", label: "Week 4", values: [7, 0, 1] },
];

const meta = {
  title: "Components/Data display/ColumnChart",
  component: ColumnChart,
  parameters: { layout: "padded" },
  args: { title: "Deliveries this week", summary: "Friday is the busiest day.", series, columns: week },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 26rem)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ColumnChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WeeklyStrip: Story = {};
export const Stacked: Story = {
  args: { title: "Orders by delivery state", series: stackedSeries, columns: stackedColumns },
};
export const FormattedValues: Story = {
  args: { formatValue: (value: number) => `${value} h`, title: "Hours worked" },
};
export const HiddenLegend: Story = { args: { ...Stacked.args, legend: "hidden" } };
export const HiddenTitle: Story = { args: { titleVisibility: "hidden" } };
export const Tones: Story = {
  args: {
    title: "One series per tone",
    series: [
      { key: "a", label: "Accent", tone: "accent" },
      { key: "b", label: "Success", tone: "success" },
      { key: "c", label: "Warning", tone: "warning" },
      { key: "d", label: "Danger", tone: "danger" },
      { key: "e", label: "Neutral", tone: "neutral" },
    ],
    columns: [
      { key: "x", label: "A", values: [1, 2, 3, 2, 1] },
      { key: "y", label: "B", values: [2, 1, 1, 3, 2] },
    ],
  },
};
export const ZeroColumns: Story = {
  args: { columns: week.map((column) => ({ ...column, values: [0] })), summary: "No deliveries yet." },
};
export const SingleColumn: Story = { args: { columns: [week[0]!] } };
export const TwelveColumns: Story = {
  args: {
    title: "Entregas por mês",
    columns: Array.from({ length: 12 }, (_, index) => ({
      key: `m${index}`,
      label: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][index],
      values: [[3, 5, 4, 8, 6, 9, 12, 7, 0, 5, 6, 10][index]!],
    })),
  },
};
export const LongPortugueseText: Story = {
  args: {
    title: "Pedidos por semana, agrupados por estado de entrega e por zona de distribuição",
    summary: "A maior parte das entregas foi concluída dentro do prazo acordado com os clientes.",
    series: [
      { key: "ok", label: "Entregue dentro do prazo acordado", tone: "success" },
      { key: "late", label: "Entregue fora do prazo", tone: "danger" },
    ],
    columns: [
      { key: "a", label: "Segunda-feira", values: [6, 2] },
      { key: "b", label: "Terça-feira", values: [3, 1] },
      { key: "c", label: "Quarta-feira", values: [5, 0] },
      { key: "d", label: "Quinta-feira", values: [4, 3] },
      { key: "e", label: "Sexta-feira", values: [7, 1] },
    ],
  },
};
export const Phone320: Story = {
  args: { title: "Orders by delivery state", series: stackedSeries, columns: stackedColumns },
  globals: { viewport: { value: "w320", isRotated: false } },
};
export const LowerPlot: Story = {
  decorators: [
    (Story) => (
      <div
        style={
          { "--lufia-column-chart-plot-height": "4rem", inlineSize: "min(100%, 26rem)" } as CSSProperties
        }
      >
        <Story />
      </div>
    ),
  ],
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
      <div style={{ display: "grid", gap: "1rem" }}>
        <ColumnChart {...args} />
        <ColumnChart
          {...args}
          title="Orders by delivery state"
          series={stackedSeries}
          columns={stackedColumns}
        />
      </div>
    </ThemeMatrix>
  ),
};
