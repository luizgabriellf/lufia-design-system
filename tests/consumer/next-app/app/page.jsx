import { Badge } from "@lufia/design-system/components/Badge";
import { Button } from "@lufia/design-system";
import ModalDemo from "./modal-demo";

export default function Page() {
  return (
    <main>
      <h1>Lufia consumer smoke</h1>
      <Badge tone="success">Server badge</Badge>
      <Button variant="primary">Client button</Button>
      <ModalDemo />
    </main>
  );
}
