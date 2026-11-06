import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { DemoBrand, DemoFooter, demoGroups, demoLabels } from "../../docs/demo/AppShellDemo";
import { DemoButton } from "../../docs/demo";
import { NavSheet } from "./NavSheet";
import { ShellNavigation } from "./ShellNavigation";

const meta = {
  title: "Components/AppShell/NavSheet",
  component: NavSheet,
  parameters: { layout: "fullscreen", docs: { story: { inline: false, iframeHeight: 560 } } },
  args: { open: false, onOpenChange: () => {}, label: "Menu", children: null },
  globals: { viewport: { value: "w390", isRotated: false } },
} satisfies Meta<typeof NavSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

function Demo({ initialOpen = false, swipe = true }: { initialOpen?: boolean; swipe?: boolean }) {
  const [open, setOpen] = useState(initialOpen);
  const [openGroups, setOpenGroups] = useState<readonly string[]>(["workspace", "insights"]);
  return (
    <div style={{ padding: "1rem" }}>
      <DemoButton onClick={() => setOpen(true)}>Open the menu</DemoButton>
      <NavSheet
        open={open}
        onOpenChange={setOpen}
        label={demoLabels.menu}
        header={<DemoBrand />}
        footer={<DemoFooter />}
        swipeToDismiss={swipe}
      >
        <nav aria-label={demoLabels.navigation}>
          <ShellNavigation
            groups={demoGroups}
            currentPath="/inbox"
            openGroups={openGroups}
            onToggleGroup={(key, next) =>
              setOpenGroups((keys) => (next ? [...keys, key] : keys.filter((k) => k !== key)))
            }
            onItemChoose={() => setOpen(false)}
          />
        </nav>
      </NavSheet>
    </div>
  );
}

/** Drag the grabber or the header down to dismiss, or press Escape, or use the close button. */
export const Default: Story = { render: () => <Demo /> };
export const OpenOnLoad: Story = { render: () => <Demo initialOpen /> };
export const WithoutSwipe: Story = { render: () => <Demo initialOpen swipe={false} /> };
export const SmallPhone: Story = {
  render: () => <Demo initialOpen />,
  globals: { viewport: { value: "w320", isRotated: false } },
};
