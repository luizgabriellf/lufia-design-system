import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { DemoBrand, DemoFooter, demoGroups, demoLabels } from "../../docs/demo/AppShellDemo";
import { Button } from "../Button";
import { NavSheet } from "./NavSheet";
import { ShellNavigation } from "./ShellNavigation";

const meta = {
  title: "Components/Navigation/AppShell/NavSheet",
  component: NavSheet,
  parameters: { layout: "fullscreen", docs: { story: { inline: false, iframeHeight: 560 } } },
  args: { open: false, onOpenChange: () => {}, label: "Menu", children: null },
  globals: { viewport: { value: "w390", isRotated: false } },
} satisfies Meta<typeof NavSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

function Demo({
  initialOpen = false,
  swipe = true,
  renderAs,
}: {
  initialOpen?: boolean;
  swipe?: boolean;
  renderAs?: "portal" | "dialog";
}) {
  const [open, setOpen] = useState(initialOpen);
  const [openGroups, setOpenGroups] = useState<readonly string[]>(["workspace", "insights"]);
  return (
    <div style={{ padding: "1rem" }}>
      <Button onClick={() => setOpen(true)}>Open the menu</Button>
      <NavSheet
        open={open}
        onOpenChange={setOpen}
        label={demoLabels.menu}
        header={<DemoBrand />}
        footer={<DemoFooter />}
        swipeToDismiss={swipe}
        renderAs={renderAs}
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

/** Drag the grabber, the header or the top of the body down to dismiss, or press Escape, or use the close button. */
export const Default: Story = { render: () => <Demo /> };
export const OpenOnLoad: Story = { render: () => <Demo initialOpen /> };
/** A native `<dialog>` opened with `showModal()`: top layer, native backdrop, no exit animation. */
export const NativeDialog: Story = { render: () => <Demo initialOpen renderAs="dialog" /> };
export const WithoutSwipe: Story = { render: () => <Demo initialOpen swipe={false} /> };
export const SmallPhone: Story = {
  render: () => <Demo initialOpen />,
  globals: { viewport: { value: "w320", isRotated: false } },
};

/** A list taller than the sheet: scroll it, and once it is back at the top a drag down from the list closes the sheet. */
export const LongListDraggedFromBody: Story = {
  render: () => (
    <NavSheet open onOpenChange={() => {}} label="Menu" header={<DemoBrand />}>
      <nav aria-label="Long list">
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {Array.from({ length: 24 }, (_, index) => (
            <li key={index} style={{ padding: "0.75rem" }}>
              Item {index + 1}
            </li>
          ))}
        </ul>
      </nav>
    </NavSheet>
  ),
};
