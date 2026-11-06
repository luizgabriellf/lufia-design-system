import { useState } from "react";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { ToastProvider, useToast } from "../../components/Toast";
import styles from "./patterns.module.css";

function Flow() {
  const toast = useToast();
  const [deleted, setDeleted] = useState(false);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const confirm = () => {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setOpen(false);
      setDeleted(true);
      toast.info("Invoice 2041 moved to the trash.", {
        action: { label: "Undo", onAction: () => setDeleted(false) },
      });
    }, 800);
  };

  if (deleted) {
    return (
      <Card title="Invoices" padding="lg">
        <p className={styles.note}>
          The list no longer shows invoice 2041. Use Undo in the toast to restore it.
        </p>
      </Card>
    );
  }

  return (
    <>
      <Card
        title="Invoice 2041"
        padding="lg"
        headerAction={
          <Badge tone="warning" dot>
            Unpaid
          </Badge>
        }
        footer={
          <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
            Delete invoice
          </Button>
        }
      >
        <p className={styles.note}>Issued 12 Oct 2026, 1 280.00 EUR, to Example Ltd.</p>
      </Card>
      <ConfirmDialog
        open={open}
        destructive
        busy={busy}
        title="Delete invoice 2041?"
        message="It moves to the trash for 30 days, and its payment link stops working."
        confirmLabel="Delete invoice"
        cancelLabel="Keep invoice"
        closeLabel="Close"
        onConfirm={confirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}

/** Confirm, then do, then offer Undo: a destructive action with a specific question and a reversible result. */
export function ConfirmDeleteDemo() {
  return (
    <ToastProvider placement="bottom-end">
      <Flow />
    </ToastProvider>
  );
}
