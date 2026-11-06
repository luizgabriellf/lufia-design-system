import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import styles from "./useSlidingIndicator.stories.module.css";
import { useSlidingIndicator } from "./useSlidingIndicator";

const TABS = ["Overview", "Activity", "Settings and preferences"];

function Demo({ stretch = false }: { stretch?: boolean }) {
  const [active, setActive] = useState(TABS[0]);
  const nav = useRef<HTMLDivElement>(null);
  const indicator = useSlidingIndicator(nav, `[data-tab="${active}"]`, active, { stretch });
  return (
    <div ref={nav} className={styles.nav} role="group" aria-label="Sliding indicator demo">
      {TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          data-tab={tab}
          aria-pressed={tab === active}
          className={styles.tab}
          onClick={() => setActive(tab)}
        >
          {tab}
        </button>
      ))}
      <span ref={indicator} className={styles.indicator} hidden aria-hidden="true" />
    </div>
  );
}

const meta = {
  title: "Components/useSlidingIndicator",
  component: Demo,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Stretch: Story = { args: { stretch: true } };
export const AllThemes: Story = {
  render: () => (
    <ThemeMatrix>
      <Demo />
    </ThemeMatrix>
  ),
};
