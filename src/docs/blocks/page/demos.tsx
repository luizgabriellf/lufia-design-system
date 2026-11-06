import { Badge } from "../../../components/Badge";
import { Button } from "../../../components/Button";
import { Card } from "../../../components/Card";
import { EmptyState } from "../../../components/EmptyState";
import { FormField } from "../../../components/FormField";
import { TextInput } from "../../../components/TextInput";
import { DocumentIcon, PlusIcon } from "../../demo";
import { Do, DoDont, Dont } from "./DoDont";
import { Variant, VariantGallery } from "./VariantGallery";
import styles from "./Diagrams.module.css";

/* Small, composed renders that component pages place inside Variants galleries and Do and Don't pairs. They use
   neutral example copy and only public components. */

export function ButtonVariants() {
  return (
    <VariantGallery label="Button variants">
      <Variant label='variant="primary"'>
        <Button variant="primary">Save changes</Button>
      </Variant>
      <Variant label='variant="secondary"'>
        <Button variant="secondary">Save draft</Button>
      </Variant>
      <Variant label='variant="ghost"'>
        <Button variant="ghost">Cancel</Button>
      </Variant>
      <Variant label='variant="danger"'>
        <Button variant="danger">Delete record</Button>
      </Variant>
    </VariantGallery>
  );
}

export function ButtonSizes() {
  return (
    <VariantGallery label="Button sizes">
      <Variant label='size="sm"'>
        <Button size="sm" variant="primary">
          Small
        </Button>
      </Variant>
      <Variant label='size="md"'>
        <Button size="md" variant="primary">
          Medium
        </Button>
      </Variant>
      <Variant label='size="lg"'>
        <Button size="lg" variant="primary">
          Large
        </Button>
      </Variant>
    </VariantGallery>
  );
}

export function BadgeTones() {
  return (
    <VariantGallery label="Badge tones">
      {(["neutral", "info", "success", "warning", "danger", "ai"] as const).map((tone) => (
        <Variant key={tone} label={`tone="${tone}"`}>
          <Badge tone={tone} dot>
            {tone === "ai" ? "Suggested" : tone[0]?.toUpperCase() + tone.slice(1)}
          </Badge>
        </Variant>
      ))}
    </VariantGallery>
  );
}

export function CardPaddings() {
  return (
    <VariantGallery label="Card padding">
      {(["sm", "md", "lg"] as const).map((padding) => (
        <Variant key={padding} label={`padding="${padding}"`}>
          <Card padding={padding} title="Title">
            <span className={styles.muted}>Body</span>
          </Card>
        </Variant>
      ))}
    </VariantGallery>
  );
}

export function ButtonDoDont() {
  return (
    <DoDont>
      <Do caption="Name the action with a verb, and use one primary button per view.">
        <div className={styles.row}>
          <Button variant="primary">Save changes</Button>
          <Button>Cancel</Button>
        </div>
      </Do>
      <Dont caption="Do not give two actions the same weight, or label them with a bare Yes or OK.">
        <div className={styles.row}>
          <Button variant="primary">Yes</Button>
          <Button variant="primary">OK</Button>
        </div>
      </Dont>
    </DoDont>
  );
}

export function IconButtonDoDont() {
  return (
    <DoDont>
      <Do caption="Pair an icon with text when the meaning is not universal.">
        <Button iconStart={<PlusIcon size={16} />}>Add member</Button>
      </Do>
      <Dont caption="Do not rely on an icon alone for an action people have to discover.">
        <Button variant="ghost" iconStart={<PlusIcon size={16} />} aria-label="Add member" />
      </Dont>
    </DoDont>
  );
}

function MiniDialog({ title, primary, secondary }: { title: string; primary: string; secondary: string }) {
  return (
    <div className={styles.miniDialog}>
      <strong>{title}</strong>
      <span className={styles.bar} />
      <span className={styles.bar} data-short />
      <div className={styles.modalFooter}>
        <Button size="sm">{secondary}</Button>
        <Button size="sm" variant="primary">
          {primary}
        </Button>
      </div>
    </div>
  );
}

export function ModalDoDont() {
  return (
    <DoDont>
      <Do caption="Title the dialog with what it does, and label the buttons with the outcomes.">
        <MiniDialog title="Rename project" primary="Save name" secondary="Cancel" />
      </Do>
      <Dont caption="Do not ask a vague question, or leave the choice to Yes and No.">
        <MiniDialog title="Are you sure?" primary="Yes" secondary="No" />
      </Dont>
    </DoDont>
  );
}

function MiniToast({ children }: { children: string }) {
  return <div className={styles.miniToast}>{children}</div>;
}

export function ToastDoDont() {
  return (
    <DoDont>
      <Do caption="Confirm in one short sentence, and offer Undo when the action can be reversed.">
        <MiniToast>Invoice moved to the trash.</MiniToast>
      </Do>
      <Dont caption="Do not put a paragraph, or the only way to continue, in something that disappears.">
        <MiniToast>
          Your export failed because the server returned an unexpected response; open settings, then billing,
          then retry.
        </MiniToast>
      </Dont>
    </DoDont>
  );
}

export function FormFieldDoDont() {
  return (
    <DoDont>
      <Do caption="Keep a visible label, and say how to fix an error.">
        <div className={styles.fieldWidth}>
          <FormField label="Work email" error="Enter an address like name@example.com.">
            <TextInput defaultValue="name@example" readOnly />
          </FormField>
        </div>
      </Do>
      <Dont caption="Do not use the placeholder as the label, or an error that only says Invalid.">
        <div className={styles.fieldWidth}>
          <TextInput
            placeholder="Work email"
            aria-label="Work email"
            aria-invalid
            defaultValue="name@example"
            readOnly
          />
          <span className={styles.errorText}>Invalid</span>
        </div>
      </Dont>
    </DoDont>
  );
}

export function CardDoDont() {
  return (
    <DoDont>
      <Do caption="Group one idea per card, and put the one action in the header or footer.">
        <div className={styles.cardWidth}>
          <Card title="Storage" footer={<span className={styles.muted}>Updated just now</span>}>
            <span className={styles.body}>14.2 of 20 GB used.</span>
          </Card>
        </div>
      </Do>
      <Dont caption="Do not nest cards inside cards; use spacing and headings to separate the parts.">
        <div className={styles.cardWidth}>
          <Card title="Storage">
            <Card title="Usage">
              <span className={styles.body}>14.2 of 20 GB used.</span>
            </Card>
          </Card>
        </div>
      </Dont>
    </DoDont>
  );
}

export function BadgeDoDont() {
  return (
    <DoDont>
      <Do caption="Use one or two words that state the status.">
        <Badge tone="warning" dot>
          Awaiting review
        </Badge>
      </Do>
      <Dont caption="Do not use a badge as a button, or write a sentence in it.">
        <Badge tone="info">Click here to review the latest changes to this record</Badge>
      </Dont>
    </DoDont>
  );
}

export function EmptyStateDoDont() {
  return (
    <DoDont>
      <Do caption="Describe the state and offer the one action that fills it.">
        <EmptyState
          icon={<DocumentIcon size={28} />}
          title="No documents yet"
          body="Upload a file to get started."
          action={<Button size="sm">Upload</Button>}
        />
      </Do>
      <Dont caption="Do not blame the person, or leave them without a next step.">
        <EmptyState
          icon={<DocumentIcon size={28} />}
          title="You have not uploaded anything"
          body="Nothing to show."
        />
      </Dont>
    </DoDont>
  );
}

export function TextInputDoDont() {
  return (
    <DoDont>
      <Do caption="Use the right type and autocomplete, so the keyboard and the browser help.">
        <div className={styles.fieldWidth}>
          <FormField label="Phone">
            <TextInput type="tel" autoComplete="tel" placeholder="+351 912 345 678" readOnly />
          </FormField>
        </div>
      </Do>
      <Dont caption="Do not use a plain text field for structured data and then reject the format.">
        <div className={styles.fieldWidth}>
          <FormField label="Phone" error="Format must be exactly 9 digits">
            <TextInput readOnly defaultValue="+351 912" />
          </FormField>
        </div>
      </Dont>
    </DoDont>
  );
}
