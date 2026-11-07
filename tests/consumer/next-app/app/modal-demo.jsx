"use client";

import { useState } from "react";
import { Button } from "@lufia/design-system/components/Button";
import { Modal } from "@lufia/design-system/components/Modal";

export default function ModalDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Consumer modal">
        <p>Modal rendered by the package.</p>
      </Modal>
    </>
  );
}
