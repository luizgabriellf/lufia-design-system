import { Button } from "../../../components/Button";
import { Card } from "../../../components/Card";
import { Combobox } from "../../../components/Combobox";
import { FormField } from "../../../components/FormField";
import { TextInput } from "../../../components/TextInput";
import { CheckIcon, CrossIcon, HomeIcon, InboxIcon, PlusIcon, SearchIcon, SettingsIcon } from "../../demo";
import { Anatomy, type AnatomyPart } from "./Anatomy";
import styles from "./Diagrams.module.css";

/* Anatomy figures for the key components. Button, FormField, Card and the closed Combobox are live renders; the
   overlays and the shell are schematic mock-ups built from the same tokens, because a live Modal, Toast or
   AppShell is positioned against the viewport and cannot sit inside a figure. */

const noop = () => {};

const BUTTON_PARTS: AnatomyPart[] = [
  {
    label: "Container",
    note: "A native button, or a link when href is set. Minimum target of 2rem, 2.75rem on coarse pointers.",
    x: 50,
    y: 0,
  },
  {
    label: "Start icon",
    note: "Optional and decorative. The label is the accessible name.",
    x: 16,
    y: 100,
    side: "bottom",
  },
  {
    label: "Label",
    note: "A verb, one to three words. It stays in the layout while loading.",
    x: 56,
    y: 100,
    side: "bottom",
  },
];

export function ButtonAnatomy() {
  return (
    <Anatomy label="Anatomy of a Button" parts={BUTTON_PARTS}>
      <Button variant="primary" size="lg" iconStart={<PlusIcon size={18} />} onClick={noop}>
        New report
      </Button>
    </Anatomy>
  );
}

const FIELD_PARTS: AnatomyPart[] = [
  {
    label: "Label",
    note: "Always visible. It is the control's accessible name, with the required mark in text.",
    x: 8,
    y: 6,
    side: "start",
  },
  {
    label: "Control",
    note: "Any control of the package, or any other through the render prop. It receives id, aria-describedby and aria-invalid.",
    x: 50,
    y: 52,
    side: "end",
  },
  { label: "Hint", note: "Help text linked with aria-describedby.", x: 14, y: 100, side: "bottom" },
];

export function FormFieldAnatomy() {
  return (
    <Anatomy label="Anatomy of a FormField" parts={FIELD_PARTS}>
      <div className={styles.fieldWidth}>
        <FormField label="Work email" hint="We only use it to send receipts." required>
          <TextInput placeholder="name@example.com" readOnly />
        </FormField>
      </div>
    </Anatomy>
  );
}

const CARD_PARTS: AnatomyPart[] = [
  {
    label: "Surface",
    note: "Bordered, tokenised and the same in every theme and mode.",
    x: 100,
    y: 50,
    side: "end",
  },
  {
    label: "Title",
    note: "A real heading; choose its level with headingLevel.",
    x: 14,
    y: 12,
    side: "start",
  },
  { label: "Header action", note: "A control that applies to the whole card.", x: 90, y: 12, side: "top" },
  { label: "Body", note: "Any content. Padding is none, sm, md or lg.", x: 40, y: 50, side: "start" },
  {
    label: "Footer",
    note: "Secondary text or actions, separated by a hairline.",
    x: 20,
    y: 90,
    side: "bottom",
  },
];

export function CardAnatomy() {
  return (
    <Anatomy label="Anatomy of a Card" parts={CARD_PARTS}>
      <div className={styles.cardWidth}>
        <Card
          title="Storage"
          headerAction={
            <Button size="sm" variant="ghost">
              Manage
            </Button>
          }
          footer={<span className={styles.muted}>Updated 2 minutes ago</span>}
        >
          <p className={styles.body}>14.2 of 20 GB used across all projects.</p>
        </Card>
      </div>
    </Anatomy>
  );
}

const MODAL_PARTS: AnatomyPart[] = [
  {
    label: "Backdrop",
    note: "Dims the page and blocks it from pointer input; a press on it can dismiss, depending on the policy.",
    x: 3,
    y: 10,
    side: "start",
  },
  {
    label: "Dialog",
    note: "role=dialog with aria-modal and a name from the title. Focus is trapped inside.",
    x: 50,
    y: 20,
    side: "top",
  },
  {
    label: "Title",
    note: "Names the dialog and says what it is for.",
    x: 10,
    y: 30,
    side: "start",
  },
  {
    label: "Close button",
    note: "Always present unless the dialog is busy. Its name is an aria-only label.",
    x: 84,
    y: 30,
    side: "top",
  },
  {
    label: "Body",
    note: "Scrolls inside the dialog when it is taller than the viewport.",
    x: 62,
    y: 44,
    side: "end",
  },
  {
    label: "Footer actions",
    note: "One primary action, and a way out. Focus lands on the least destructive one.",
    x: 81,
    y: 74,
    side: "bottom",
  },
];

export function ModalAnatomy() {
  return (
    <Anatomy label="Anatomy of a Modal" parts={MODAL_PARTS}>
      <div className={styles.modalBackdrop}>
        <div className={styles.modalPanel}>
          <div className={styles.modalHeader}>
            <strong>Rename project</strong>
            <span className={styles.closeMock}>
              <CrossIcon size={16} />
            </span>
          </div>
          <div className={styles.modalBody}>
            <span className={styles.bar} />
            <span className={styles.bar} data-short />
          </div>
          <div className={styles.modalFooter}>
            <Button size="sm">Cancel</Button>
            <Button size="sm" variant="primary">
              Save
            </Button>
          </div>
        </div>
      </div>
    </Anatomy>
  );
}

const TOAST_PARTS: AnatomyPart[] = [
  {
    label: "Region",
    note: "A polite live region that holds the stack; it exists before the first toast, so the message is announced.",
    x: 50,
    y: 0,
    side: "top",
  },
  {
    label: "Tone mark",
    note: "Icon and colour for success, error, warning or info. The message never relies on them.",
    x: 8,
    y: 50,
    side: "bottom",
  },
  { label: "Message", note: "One short sentence that says what happened.", x: 40, y: 100, side: "bottom" },
  {
    label: "Action",
    note: "Optional, for example Undo. The toast pauses while it is focused.",
    x: 76,
    y: 50,
    side: "bottom",
  },
  { label: "Dismiss", note: "A close button with an aria-only label.", x: 96, y: 50, side: "end" },
];

export function ToastAnatomy() {
  return (
    <Anatomy label="Anatomy of a Toast" parts={TOAST_PARTS}>
      <div className={styles.toast}>
        <span className={styles.toastMark}>
          <CheckIcon size={16} />
        </span>
        <span className={styles.toastMessage}>Invoice moved to the trash.</span>
        <Button size="sm" variant="ghost">
          Undo
        </Button>
        <span className={styles.closeMock}>
          <CrossIcon size={14} />
        </span>
      </div>
    </Anatomy>
  );
}

const COMBOBOX_PARTS: AnatomyPart[] = [
  {
    label: "Input",
    note: "role=combobox. Typing filters; the value is the chosen option, not the text.",
    x: 30,
    y: 0,
    side: "top",
  },
  {
    label: "Clear button",
    note: "Optional. Escape clears too, when the list is closed.",
    x: 92,
    y: 12,
    side: "top",
  },
  {
    label: "Listbox",
    note: "Opens below the input; aria-activedescendant tracks the highlighted option while focus stays in the input.",
    x: 100,
    y: 62,
    side: "end",
  },
  { label: "Option", note: "role=option; the chosen one is aria-selected.", x: 2, y: 56, side: "start" },
  {
    label: "Status line",
    note: "Loading, empty and result counts are announced in a live region.",
    x: 50,
    y: 100,
    side: "bottom",
  },
];

export function ComboboxAnatomy() {
  return (
    <Anatomy label="Anatomy of a Combobox" parts={COMBOBOX_PARTS}>
      <div className={styles.comboWidth}>
        <Combobox
          aria-label="Country"
          options={[]}
          defaultValue={null}
          clearable
          readOnly
          placeholder="Search countries"
          loadingLabel="Loading"
          emptyLabel="No match"
        />
        <ul className={styles.list}>
          <li>Portugal</li>
          <li data-active>Poland</li>
          <li>Panama</li>
        </ul>
        <span className={styles.status}>3 results</span>
      </div>
    </Anatomy>
  );
}

const SHELL_PARTS: AnatomyPart[] = [
  {
    label: "Skip link",
    note: "The first tab stop. It jumps past the navigation to the content.",
    x: 3,
    y: 3,
    side: "top",
  },
  {
    label: "Sidebar",
    note: "Grouped navigation. It collapses to a rail, and becomes a sheet on phones.",
    x: 0,
    y: 55,
    side: "start",
  },
  {
    label: "Nav item",
    note: "A link with aria-current=page on the active route; a badge is read with its label.",
    x: 22,
    y: 33,
    side: "start",
  },
  {
    label: "Top bar",
    note: "Page-level slots such as search and the account menu.",
    x: 62,
    y: 6,
    side: "top",
  },
  {
    label: "Main",
    note: "The one main landmark. Pages put their PageHeader and content here.",
    x: 100,
    y: 62,
    side: "end",
  },
];

export function AppShellAnatomy() {
  return (
    <Anatomy label="Anatomy of an AppShell" parts={SHELL_PARTS}>
      <div className={styles.shell}>
        <span className={styles.skip}>Skip to content</span>
        <aside className={styles.shellSide}>
          <span className={styles.brand} />
          <span className={styles.navItem} data-current>
            <HomeIcon size={14} /> Overview
          </span>
          <span className={styles.navItem}>
            <InboxIcon size={14} /> Inbox
          </span>
          <span className={styles.navItem}>
            <SettingsIcon size={14} /> Settings
          </span>
        </aside>
        <div className={styles.shellMain}>
          <div className={styles.shellTop}>
            <span className={styles.search}>
              <SearchIcon size={14} /> Search
            </span>
          </div>
          <div className={styles.shellContent}>
            <span className={styles.bar} data-title />
            <span className={styles.bar} />
            <span className={styles.bar} data-short />
          </div>
        </div>
      </div>
    </Anatomy>
  );
}
