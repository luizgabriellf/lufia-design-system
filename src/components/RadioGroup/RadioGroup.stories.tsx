import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { RadioGroup, type RadioOption } from "./RadioGroup";

const options: RadioOption[] = [
  { value: "card", label: "Card", description: "Charged today." },
  { value: "transfer", label: "Bank transfer", description: "Confirmed in one to two working days." },
  { value: "invoice", label: "Invoice", description: "Not available for new accounts.", disabled: true },
  { value: "cash", label: "Cash on delivery" },
];

const meta = {
  title: "Components/Forms/RadioGroup",
  component: RadioGroup,
  parameters: { layout: "padded" },
  args: { label: "Payment method", options, defaultValue: "card" },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 28rem)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const NothingChosen: Story = { args: { defaultValue: undefined } };
export const WithHint: Story = { args: { hint: "You can change this later in settings." } };
export const Required: Story = { args: { required: true, defaultValue: undefined } };
export const Invalid: Story = {
  args: { required: true, defaultValue: undefined, error: "Choose a payment method to continue." },
};
const plans: RadioOption[] = [
  {
    value: "basic",
    label: "Basic",
    description: "For a single site.",
    meta: "9 / month",
    content: "Two seats, e-mail support.",
  },
  {
    value: "team",
    label: "Team",
    description: "For several sites that share one team.",
    meta: "29 / month",
    content: "Ten seats, priority support.",
  },
  { value: "enterprise", label: "Enterprise", description: "Contact sales.", disabled: true },
  { value: "free", label: "Free" },
];
export const CardVariant: Story = {
  args: { label: "Plan", options: plans, variant: "card", defaultValue: "team" },
};
export const CardHorizontal: Story = {
  args: { label: "Plan", options: plans, variant: "card", orientation: "horizontal", defaultValue: "basic" },
};
export const CardInvalid: Story = {
  args: {
    label: "Plan",
    options: plans,
    variant: "card",
    required: true,
    defaultValue: undefined,
    error: "Choose a plan to continue.",
  },
};
export const CardLongText: Story = {
  args: {
    label: "Plano de subscrição",
    variant: "card",
    options: [
      {
        value: "a",
        label: "Plano anual com faturação única e renovação automática no final de cada período",
        description:
          "Inclui todas as funcionalidades, atualizações e suporte prioritário por e-mail e telefone.",
        meta: "1.290,00 € / ano",
        content: "Cancelável até trinta dias antes da renovação.",
      },
      { value: "b", label: "Mensal", meta: "129 € / mês" },
    ],
  },
};
export const CardPhone320: Story = {
  args: { label: "Plan", options: plans, variant: "card", defaultValue: "team" },
  globals: { viewport: { value: "w320", isRotated: false } },
};
export const Disabled: Story = { args: { disabled: true } };
export const Horizontal: Story = {
  args: {
    orientation: "horizontal",
    options: options.map(({ value, label, disabled }) => ({ value, label, disabled })),
  },
};
export const LongText: Story = {
  args: {
    label: "A considerably longer group label that has to wrap onto a second line on narrow screens",
    options: [
      {
        value: "a",
        label: "An option whose label is long enough to wrap beside its circle on a narrow screen",
        description: "And a description that goes on for just as long, to show how the lines align.",
      },
      { value: "b", label: "Short" },
    ],
  },
};
export const Phone320: Story = { globals: { viewport: { value: "w320", isRotated: false } } };
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
      <RadioGroup {...args} />
      <div style={{ marginBlockStart: "1rem" }}>
        <RadioGroup {...args} label="Invalid" defaultValue={undefined} error="Choose one to continue." />
      </div>
      <div style={{ marginBlockStart: "1rem" }}>
        <RadioGroup {...args} label="Plan" options={plans} variant="card" defaultValue="team" />
      </div>
    </ThemeMatrix>
  ),
};
