import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { DemoBrand, DemoFooter, demoGroups, demoLabels } from "../../docs/demo/AppShellDemo";
import { Button } from "../Button";
import { NavSheet } from "./NavSheet";
import { ShellNavigation } from "./ShellNavigation";
import type { SheetDragThreshold } from "./useSheetDrag";

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
  dragThreshold,
}: {
  initialOpen?: boolean;
  swipe?: boolean;
  renderAs?: "portal" | "dialog";
  dragThreshold?: SheetDragThreshold;
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
        dragThreshold={dragThreshold}
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
/**
 * `dragThreshold`: a release dismisses after 30% of the sheet's height (kept between 96 and 200 pixels), and only a
 * faster flick counts. Fields left out keep their defaults.
 */
export const CustomDragThreshold: Story = {
  render: () => <Demo initialOpen dragThreshold={{ ratio: 0.3, min: 96, max: 200, flickVelocity: 1 }} />,
};
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

function BrandLinkDemo() {
  const [open, setOpen] = useState(true);
  const [followed, setFollowed] = useState(0);
  return (
    <div style={{ padding: "1rem", display: "grid", gap: "0.75rem", justifyItems: "start" }}>
      <Button onClick={() => setOpen(true)}>Open the menu</Button>
      <p data-followed={followed} style={{ margin: 0 }}>
        Brand link followed {followed} {followed === 1 ? "time" : "times"}
      </p>
      <NavSheet
        open={open}
        onOpenChange={setOpen}
        label={demoLabels.menu}
        header={
          <a
            href="#home"
            style={{ color: "inherit", textDecoration: "none" }}
            onClick={(event) => {
              event.preventDefault();
              setFollowed((count) => count + 1);
            }}
          >
            <DemoBrand />
          </a>
        }
      >
        <nav aria-label={demoLabels.navigation}>
          <ShellNavigation
            groups={demoGroups}
            currentPath="/inbox"
            openGroups={["insights"]}
            onToggleGroup={() => {}}
          />
        </nav>
      </NavSheet>
    </div>
  );
}

/**
 * The header is a brand link that fills most of it. A drag that starts on the link still dismisses the sheet (past a short
 * slop), and the link is not followed; a plain tap follows it.
 */
export const DragFromBrandLink: Story = { render: () => <BrandLinkDemo /> };
