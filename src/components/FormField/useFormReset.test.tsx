import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef } from "react";
import { useFormReset } from "./useFormReset";

function Probe({ form, onReset }: { form?: string; onReset: () => void }) {
  const ref = useRef<HTMLInputElement>(null);
  useFormReset(ref, onReset);
  return <input ref={ref} aria-label="Probe" form={form} />;
}

describe("useFormReset", () => {
  it("runs on reset of the enclosing form, and not after unmount", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    const { unmount } = render(
      <form>
        <Probe onReset={onReset} />
        <button type="reset">Reset</button>
      </form>,
    );
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(onReset).toHaveBeenCalledTimes(1);
    const form = document.querySelector("form")!;
    unmount();
    form.dispatchEvent(new Event("reset"));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("follows the control when its form attribute points at another form", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    const forms = (target: string) => (
      <>
        <form id="a">
          <button type="reset">Reset A</button>
        </form>
        <form id="b">
          <button type="reset">Reset B</button>
        </form>
        <Probe form={target} onReset={onReset} />
      </>
    );
    const { rerender } = render(forms("a"));
    await user.click(screen.getByRole("button", { name: "Reset A" }));
    expect(onReset).toHaveBeenCalledTimes(1);
    rerender(forms("b"));
    await user.click(screen.getByRole("button", { name: "Reset A" }));
    expect(onReset).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "Reset B" }));
    expect(onReset).toHaveBeenCalledTimes(2);
  });
});
