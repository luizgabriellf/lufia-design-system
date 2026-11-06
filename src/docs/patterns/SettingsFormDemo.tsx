import { useState, useTransition, type FormEvent } from "react";
import { FormField } from "../../components/FormField";
import { PendingSubmit } from "../../components/PendingSubmit";
import { SegmentedToggle } from "../../components/SegmentedToggle";
import { Select } from "../../components/Select";
import { Switch } from "../../components/Switch";
import { TextInput } from "../../components/TextInput";
import { Textarea } from "../../components/Textarea";
import { Card } from "../../components/Card";
import { PageHeader } from "../../components/PageHeader";
import { ToastProvider, useToast } from "../../components/Toast";
import styles from "./patterns.module.css";

function Form() {
  const toast = useToast();
  const [pending, start] = useTransition();
  const [name, setName] = useState("Ada Example");
  const [touched, setTouched] = useState(false);
  const error = touched && name.trim() === "" ? "Enter a display name." : undefined;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (name.trim() === "") return;
    start(async () => {
      await new Promise((resolve) => setTimeout(resolve, 900));
      toast.success("Profile saved.");
    });
  };

  return (
    <form className={styles.settings} onSubmit={submit} noValidate>
      <PageHeader
        eyebrow="Settings"
        title="Profile"
        description="How you appear to the rest of your team."
        headingLevel={2}
      />
      <Card title="Identity" padding="lg">
        <div className={styles.fields}>
          <FormField label="Display name" required error={error}>
            <TextInput
              value={name}
              onChange={(event) => setName(event.target.value)}
              onBlur={() => setTouched(true)}
              autoComplete="name"
            />
          </FormField>
          <FormField label="Time zone" hint="Used for dates and reminders.">
            <Select
              defaultValue="lisbon"
              options={[
                { value: "lisbon", label: "Lisbon (GMT+0)" },
                { value: "berlin", label: "Berlin (GMT+1)" },
                { value: "newyork", label: "New York (GMT-5)" },
              ]}
            />
          </FormField>
          <FormField label="About you" hint="Optional. Up to 160 characters.">
            <Textarea rows={3} maxLength={160} />
          </FormField>
        </div>
      </Card>
      <Card title="Preferences" padding="lg">
        <div className={styles.fields}>
          <SegmentedToggle
            label="Density"
            defaultValue="comfortable"
            options={[
              { value: "comfortable", label: "Comfortable" },
              { value: "compact", label: "Compact" },
            ]}
          />
          <Switch label="Weekly summary by email" hint="Sent on Monday morning." defaultChecked />
        </div>
      </Card>
      <div className={styles.actions}>
        <PendingSubmit pending={pending} pendingLabel="Saving…" variant="primary">
          Save changes
        </PendingSubmit>
      </div>
    </form>
  );
}

/** A settings form: grouped cards, inline validation on blur, a pending submit and a toast after the save. */
export function SettingsFormDemo() {
  return (
    <ToastProvider placement="bottom-end">
      <Form />
    </ToastProvider>
  );
}
