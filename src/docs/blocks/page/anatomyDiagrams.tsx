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
    note: "A native button, or a link when href is set. Height runs from 2rem (sm) to 3rem (lg), and at least 2.75rem on coarse pointers.",
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
    note: "Dims the page and blocks it from pointer input; a press that begins on it dismisses unless closeOnOutsideClick is off. While busy, dismissal is refused.",
    x: 3,
    y: 10,
    side: "start",
  },
  {
    label: "Dialog",
    note: "role=dialog (alertdialog on request) with aria-modal, named by the title. Focus is contained, and starts on the container unless initialFocus says otherwise.",
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
    note: "Shown unless hideCloseButton is set, and disabled while busy. Its name is an aria-only label.",
    x: 84,
    y: 30,
    side: "top",
  },
  {
    label: "Body",
    note: "Holds the optional description and the content. It scrolls inside the dialog when it is taller than the viewport.",
    x: 62,
    y: 44,
    side: "end",
  },
  {
    label: "Footer actions",
    note: "An optional slot for the actions. Put the primary one last; ConfirmDialog focuses Cancel when it is destructive.",
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
    note: "A named region that holds the stack. Its two lists stay mounted while empty: errors go to an assertive live region, every other tone to a polite one.",
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
    note: "Optional, for example Undo. Pressing it runs the callback and dismisses the toast. Hover or focus pauses the timer.",
    x: 76,
    y: 50,
    side: "bottom",
  },
  {
    label: "Dismiss",
    note: "A close button named by the aria-only dismiss label. Escape dismisses the focused toast too.",
    x: 96,
    y: 50,
    side: "end",
  },
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
    note: "role=combobox. Typing filters; the value is the chosen option, not the text. With the clearable prop (off by default), a clear button appears once an option is chosen, and Escape clears too when the list is closed.",
    x: 30,
    y: 0,
    side: "top",
  },
  {
    label: "Toggle button",
    note: "Opens and closes the list, and carries aria-expanded.",
    x: 92,
    y: 12,
    side: "top",
  },
  {
    label: "Listbox",
    note: "Opens below the input. aria-activedescendant tracks the highlighted option while DOM focus stays in the input.",
    x: 100,
    y: 62,
    side: "end",
  },
  { label: "Option", note: "role=option; the chosen one is aria-selected.", x: 2, y: 56, side: "start" },
  {
    label: "Live status",
    note: "A visually hidden role=status region announces the result count, and the loading and empty texts.",
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
      </div>
    </Anatomy>
  );
}

const SHELL_PARTS: AnatomyPart[] = [
  {
    label: "Skip link",
    note: "The first tab stop; visible only while focused. It jumps past the navigation to the main landmark.",
    x: 3,
    y: 3,
    side: "top",
  },
  {
    label: "Sidebar",
    note: "Brand, search entry, grouped navigation and footer. It collapses to a rail; on phones it gives way to a top bar, a floating bar and a navigation sheet.",
    x: 0,
    y: 70,
    side: "start",
  },
  {
    label: "Search entry",
    note: "Opens your search or command palette. In the rail it keeps its label as the accessible name.",
    x: 22,
    y: 24,
    side: "start",
  },
  {
    label: "Nav item",
    note: "A link; the one for the current path gets aria-current=page. A badge is part of the link's text.",
    x: 22,
    y: 38,
    side: "bottom",
  },
  {
    label: "Main",
    note: "The page's one main landmark. Pages put their PageHeader and content here.",
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
          <span className={styles.search}>
            <SearchIcon size={14} /> Search
          </span>
          <span className={styles.navItem} data-current>
            <HomeIcon size={14} /> Overview
          </span>
          <span className={styles.navItem}>
            <InboxIcon size={14} /> Inbox <span className={styles.count}>3</span>
          </span>
          <span className={styles.navItem}>
            <SettingsIcon size={14} /> Settings
          </span>
        </aside>
        <div className={styles.shellContent}>
          <span className={styles.bar} data-title />
          <span className={styles.bar} />
          <span className={styles.bar} data-short />
        </div>
      </div>
    </Anatomy>
  );
}
