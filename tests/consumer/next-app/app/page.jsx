import { Badge } from "@lufia/design-system/components/Badge";
import { Button } from "@lufia/design-system";
import { Switch } from "@lufia/design-system/components/Switch";
import { parseShellState } from "@lufia/design-system/app-shell-state";
import ModalDemo from "./modal-demo";

// A Server Component. Switch uses hooks (useId, useRef, state), so it only renders here if the
// package marks it "use client"; the props passed are serializable.
// The shell state helpers run here, in the server layer, as an app reads its cookie before the first paint.
export default function Page() {
  const shell = parseShellState("c=1&s=1&g=reports");
  return (
    <main>
      <h1>Lufia consumer smoke</h1>
      <Badge tone="success">Server badge</Badge>
      <Button variant="primary">Client button</Button>
      <Switch label="Email notifications" defaultChecked />
      <p>{`Shell state: ${shell.collapsed ? "rail" : "open"}`}</p>
      <ModalDemo />
    </main>
  );
}
