import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { axe } from "../../test/axe";
import { PendingSubmit } from "./PendingSubmit";

/** A promise a test settles by hand, to hold a form action in flight. */
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => (resolve = done));
  return { promise, resolve };
}

describe("PendingSubmit", () => {
  it("is a submit button with the idle label and rest props", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <PendingSubmit pendingLabel="Saving…" name="intent" value="save" ref={ref}>
        Save changes
      </PendingSubmit>,
    );
    const button = screen.getByRole("button", { name: "Save changes" });
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toHaveAttribute("name", "intent");
    expect(button).toHaveAttribute("value", "save");
    expect(button).not.toHaveAttribute("aria-busy");
    expect(ref.current).toBe(button);
  });

  it("passes className, variant, size and fullWidth through to the Button", () => {
    const { rerender } = render(<PendingSubmit pendingLabel="Saving…">Save</PendingSubmit>);
    const button = () => screen.getByRole("button", { name: "Save" });
    expect(button()).toHaveAttribute("data-variant", "primary");
    expect(button()).toHaveAttribute("data-size", "md");
    rerender(
      <PendingSubmit
        pendingLabel="Saving…"
        className="app-submit"
        variant="danger"
        size="sm"
        fullWidth
        pending
      >
        Save
      </PendingSubmit>,
    );
    expect(button()).toHaveClass("app-submit");
    expect(button()).toHaveAttribute("data-variant", "danger");
    expect(button()).toHaveAttribute("data-size", "sm");
    expect(button()).toHaveAttribute("data-full-width");
    expect(button()).toHaveAttribute("aria-busy", "true");
  });

  it("when pending, is busy, says so politely and keeps its name and focus", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<PendingSubmit pendingLabel="Saving…">Save changes</PendingSubmit>);
    await user.tab();
    rerender(
      <PendingSubmit pendingLabel="Saving…" pending>
        Save changes
      </PendingSubmit>,
    );
    const button = screen.getByRole("button", { name: "Save changes" });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).not.toBeDisabled();
    expect(button).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent("Saving…");
  });

  it("swallows a click while pending, so the form is not submitted twice", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    const onClick = vi.fn();
    render(
      <form onSubmit={onSubmit}>
        <PendingSubmit pendingLabel="Saving…" pending onClick={onClick}>
          Save
        </PendingSubmit>
      </form>,
    );
    await user.click(screen.getByRole("button"));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("swallows Enter in a field while pending, and submits when idle", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    const { rerender } = render(
      <form onSubmit={onSubmit}>
        <input aria-label="Name" />
        <PendingSubmit pendingLabel="Saving…">Save</PendingSubmit>
      </form>,
    );
    await user.type(screen.getByLabelText("Name"), "{Enter}");
    expect(onSubmit).toHaveBeenCalledTimes(1);
    rerender(
      <form onSubmit={onSubmit}>
        <input aria-label="Name" />
        <PendingSubmit pendingLabel="Saving…" pending>
          Save
        </PendingSubmit>
      </form>,
    );
    await user.type(screen.getByLabelText("Name"), "{Enter}");
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("follows the pending state of its form through useFormStatus, and submits only once", async () => {
    const user = userEvent.setup();
    const gate = deferred();
    const action = vi.fn(() => gate.promise);
    render(
      <form action={action}>
        <PendingSubmit pendingLabel="Saving…">Save changes</PendingSubmit>
      </form>,
    );
    const button = screen.getByRole("button", { name: "Save changes" });
    await user.click(button);
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toHaveTextContent("Saving…");
    await user.click(button);
    await user.click(button);
    expect(action).toHaveBeenCalledTimes(1);
    await act(async () => gate.resolve());
    expect(button).not.toHaveAttribute("aria-busy");
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("shows progress labels with their delays, the first one from the start", () => {
    render(
      <PendingSubmit
        pendingLabel="Saving…"
        pending
        progress={[
          [4000, "Still saving…"],
          [12000, "Almost there…"],
        ]}
      >
        Save
      </PendingSubmit>,
    );
    const layer = document.querySelector(".steps")!;
    const steps = Array.from(layer.children) as HTMLElement[];
    expect(steps.map((s) => s.textContent)).toEqual(["Saving…", "Still saving…", "Almost there…"]);
    expect(steps.map((s) => s.style.getPropertyValue("--on"))).toEqual(["0ms", "4000ms", "12000ms"]);
    expect(steps.map((s) => s.style.getPropertyValue("--off"))).toEqual(["4000ms", "12000ms", "86400000ms"]);
    // Only the pending label is announced; the later labels are visual.
    expect(screen.getByRole("status")).toHaveTextContent(/^Saving…$/);
  });

  it("does not time a single pending label", () => {
    render(
      <PendingSubmit pendingLabel="Saving…" pending>
        Save
      </PendingSubmit>,
    );
    const only = document.querySelector(".steps")!.firstElementChild!;
    expect(only).toHaveClass("only");
  });

  it("reserves the width of the longest label with invisible copies", () => {
    render(
      <PendingSubmit pendingLabel="Saving…" progress={[[3000, "Still saving, hang on…"]]}>
        Save
      </PendingSubmit>,
    );
    const sizers = document.querySelectorAll(".sizer");
    expect(Array.from(sizers).map((s) => s.textContent)).toEqual(["Saving…", "Still saving, hang on…"]);
    sizers.forEach((s) => expect(s).toHaveAttribute("aria-hidden", "true"));
  });

  it("can be disabled outright and runs its own onClick when idle", () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <PendingSubmit pendingLabel="Saving…" onClick={onClick}>
        Save
      </PendingSubmit>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
    rerender(
      <PendingSubmit pendingLabel="Saving…" disabled>
        Save
      </PendingSubmit>,
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("has no axe violations, idle and pending", async () => {
    const { container, rerender } = render(
      <PendingSubmit pendingLabel="Saving…">Save changes</PendingSubmit>,
    );
    expect(await axe(container)).toHaveNoViolations();
    rerender(
      <PendingSubmit pendingLabel="Saving…" pending progress={[[3000, "Still saving…"]]}>
        Save changes
      </PendingSubmit>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
