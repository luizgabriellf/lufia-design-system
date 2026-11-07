import { Badge } from "@lufia/design-system/components/Badge";
import { Button } from "@lufia/design-system";
import { Switch } from "@lufia/design-system/components/Switch";
import ModalDemo from "./modal-demo";

// A Server Component. Switch uses hooks (useId, useRef, state), so it only renders here if the
// package marks it "use client"; the props passed are serializable.
export default function Page() {
  return (
    <main>
      <h1>Lufia consumer smoke</h1>
      <Badge tone="success">Server badge</Badge>
      <Button variant="primary">Client button</Button>
      <Switch label="Email notifications" defaultChecked />
      <ModalDemo />
    </main>
  );
}
