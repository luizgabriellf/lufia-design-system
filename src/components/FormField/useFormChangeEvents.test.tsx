import { startTransition, useState, useTransition } from "react";
import { createRoot, type Root } from "react-dom/client";
import { RadioGroup } from "../RadioGroup/RadioGroup";
import { SegmentedToggle } from "../SegmentedToggle/SegmentedToggle";

// No `act`: React schedules its own renders (a sync-lane render is a microtask), which is what a browser does. A
// time-based expiry of the announcement passes under `act` and loses every real event.
const options = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gamma" },
];

const wait = () => new Promise((resolve) => setTimeout(resolve, 20));

type Mode = "uncontrolled" | "controlled" | "transition";

function Parent({ kind, mode }: { kind: "radio" | "segmented"; mode: Mode }) {
  const [value, setValue] = useState("a");
  const [pending, begin] = useTransition();
  const props =
    mode === "uncontrolled"
      ? { defaultValue: "a" }
      : {
          value,
          onValueChange:
            mode === "transition"
              ? (next: string) => begin(() => setValue(next))
              : (next: string) => setValue(next),
        };
  return (
    <form name="f" data-pending={pending ? "" : undefined}>
      {kind === "radio" ? (
        <RadioGroup label="Pick" name="pick" options={options} {...props} />
      ) : (
        <SegmentedToggle label="Pick" name="pick" options={options} {...props} />
      )}
    </form>
  );
}

describe("form change events without act", () => {
  let host: HTMLDivElement;
  let root: Root;
  let previous: boolean | undefined;
  const events: string[] = [];
  const listener = (event: Event) => {
    events.push(`${event.type}:${(event.target as HTMLInputElement).value}`);
  };

  beforeEach(() => {
    previous = (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT;
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = false;
    events.length = 0;
    host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
  });

  afterEach(async () => {
    root.unmount();
    host.remove();
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = previous;
    await wait();
  });

  async function mount(kind: "radio" | "segmented", mode: Mode) {
    startTransition(() => root.render(<Parent kind={kind} mode={mode} />));
    await wait();
    host.querySelector("form")!.addEventListener("change", listener);
    host.querySelector("form")!.addEventListener("input", listener);
  }

  const radio = (name: string) =>
    [...host.querySelectorAll<HTMLElement>('[role="radio"]')].find((node) => node.textContent === name)!;

  describe.each(["radio", "segmented"] as const)("%s", (kind) => {
    describe.each(["uncontrolled", "controlled", "transition"] as const)("%s", (mode) => {
      it("fires input and change once for a click", async () => {
        await mount(kind, mode);
        radio("Beta").click();
        await wait();
        expect(events).toEqual(["input:b", "change:b"]);
      });

      it("fires input and change once for ArrowRight", async () => {
        await mount(kind, mode);
        radio("Alpha").focus();
        radio("Alpha").dispatchEvent(
          new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }),
        );
        await wait();
        expect(events).toEqual(["input:b", "change:b"]);
      });
    });
  });
});
