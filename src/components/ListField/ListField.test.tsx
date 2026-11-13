import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { axe } from "../../test/axe";
import { ListField, type ListFieldHandle, type ListFieldLabels, type ListFieldProps } from "./ListField";

const labels: ListFieldLabels = {
  add: "Add",
  remove: (index, text) => `Remove ${index}: ${text}`,
  entry: (index) => `Entry ${index}`,
  requiredMessage: "Add one entry",
};

const hidden = (container: HTMLElement, name = "tasks") =>
  container.querySelector<HTMLInputElement>(`input[type="hidden"][name="${name}"]`)!;

describe("ListField", () => {
  it("is a group named by its label, with a named input per entry and an add input", () => {
    render(<ListField label="Tasks" labels={labels} defaultItems={["Alpha", "Beta"]} />);
    expect(screen.getByRole("group", { name: "Tasks" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Entry 1" })).toHaveValue("Alpha");
    expect(screen.getByRole("textbox", { name: "Entry 2" })).toHaveValue("Beta");
    expect(screen.getByRole("textbox", { name: "Tasks" })).toHaveValue("");
    expect(screen.getByRole("button", { name: "Remove 2: Beta" })).toBeInTheDocument();
  });

  it("names the add input with labels.addInput and keeps the group and the button named apart", () => {
    render(<ListField label="Hazards" labels={{ ...labels, addInput: "New hazard" }} required />);
    expect(screen.getByRole("group", { name: /^Hazards/ })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "New hazard" })).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: /^Hazards/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });

  it("has no axe violations with a named add input", async () => {
    const { container } = render(
      <ListField
        label="Hazards"
        labels={{ ...labels, addInput: "New hazard" }}
        required
        defaultItems={["a"]}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("submits the entries as one hidden value, joined with line feeds by default", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ListField label="Tasks" labels={labels} name="tasks" defaultItems={["a"]} />,
    );
    expect(hidden(container).value).toBe("a");
    await user.type(screen.getByRole("textbox", { name: "Tasks" }), "b{Enter}");
    expect(hidden(container).value).toBe("a\nb");
  });

  it("serializes with the given function", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ListField
        label="Tasks"
        labels={labels}
        name="tasks"
        defaultItems={["a"]}
        serialize={(items) => items.join(" | ")}
      />,
    );
    await user.type(screen.getByRole("textbox", { name: "Tasks" }), "b{Enter}");
    expect(hidden(container).value).toBe("a | b");
  });

  it("adds on Enter and never submits the surrounding form", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    const onChange = vi.fn();
    render(
      <form onSubmit={onSubmit}>
        <ListField label="Tasks" labels={labels} onChange={onChange} />
        <button type="submit">Save</button>
      </form>,
    );
    const add = screen.getByRole("textbox", { name: "Tasks" });
    await user.type(add, "Alpha{Enter}");
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenLastCalledWith(["Alpha"]);
    expect(add).toHaveValue("");
    expect(add).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("adds with the button and keeps focus in the add input", async () => {
    const user = userEvent.setup();
    render(<ListField label="Tasks" labels={labels} />);
    const add = screen.getByRole("textbox", { name: "Tasks" });
    await user.type(add, "Alpha");
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(screen.getByRole("textbox", { name: "Entry 1" })).toHaveValue("Alpha");
    expect(add).toHaveFocus();
  });

  it("edits an entry in place", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <ListField label="Tasks" labels={labels} name="tasks" defaultItems={["Alpha"]} onChange={onChange} />,
    );
    await user.type(screen.getByRole("textbox", { name: "Entry 1" }), "X");
    expect(onChange).toHaveBeenLastCalledWith(["AlphaX"]);
    expect(hidden(container).value).toBe("AlphaX");
  });

  it("removes an entry and moves focus to the add input", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <ListField label="Tasks" labels={labels} name="tasks" defaultItems={["a", "b"]} onChange={onChange} />,
    );
    await user.click(screen.getByRole("button", { name: "Remove 1: a" }));
    expect(onChange).toHaveBeenLastCalledWith(["b"]);
    expect(hidden(container).value).toBe("b");
    expect(screen.getByRole("textbox", { name: "Tasks" })).toHaveFocus();
    await waitFor(() => expect(screen.queryByRole("textbox", { name: "Entry 2" })).not.toBeInTheDocument());
    expect(screen.getByRole("textbox", { name: "Entry 1" })).toHaveValue("b");
  });

  it("drops an entry that is left empty", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ListField label="Tasks" labels={labels} defaultItems={["a", "b"]} onChange={onChange} />);
    await user.clear(screen.getByRole("textbox", { name: "Entry 1" }));
    await user.tab();
    expect(onChange).toHaveBeenLastCalledWith(["b"]);
    await waitFor(() => expect(screen.queryByRole("textbox", { name: "Entry 2" })).not.toBeInTheDocument());
  });

  it("sanitizes what is added and ignores text that is empty after it", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ListField label="Tasks" labels={labels} onChange={onChange} sanitizeItem={(text) => text.trim()} />,
    );
    const add = screen.getByRole("textbox", { name: "Tasks" });
    await user.type(add, "   {Enter}");
    expect(onChange).not.toHaveBeenCalled();
    await user.type(add, "  Alpha  {Enter}");
    expect(onChange).toHaveBeenLastCalledWith(["Alpha"]);
  });

  it("follows a controlled value and replaces the rows when it differs", async () => {
    const user = userEvent.setup();
    function Harness() {
      const [items, setItems] = useState(["a", "b"]);
      return (
        <>
          <ListField label="Tasks" labels={labels} items={items} onChange={setItems} />
          <button type="button" onClick={() => setItems(["z"])}>
            Replace
          </button>
        </>
      );
    }
    render(<Harness />);
    await user.type(screen.getByRole("textbox", { name: "Tasks" }), "c{Enter}");
    expect(screen.getByRole("textbox", { name: "Entry 3" })).toHaveValue("c");
    await user.click(screen.getByRole("button", { name: "Replace" }));
    expect(screen.getAllByRole("textbox", { name: /^Entry/ })).toHaveLength(1);
    expect(screen.getByRole("textbox", { name: "Entry 1" })).toHaveValue("z");
  });

  it("keeps showing the controlled value when the parent refuses a change", async () => {
    const user = userEvent.setup();
    render(<ListField label="Tasks" labels={labels} items={["a"]} onChange={() => {}} />);
    await user.type(screen.getByRole("textbox", { name: "Tasks" }), "b{Enter}");
    expect(screen.getAllByRole("textbox", { name: /^Entry/ })).toHaveLength(1);
  });

  it("limits the number of entries", async () => {
    const user = userEvent.setup();
    render(<ListField label="Tasks" labels={labels} defaultItems={["a", "b"]} maxItems={2} />);
    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: "Tasks" })).toHaveAttribute("maxlength", "0");
    await user.type(screen.getByRole("textbox", { name: "Tasks" }), "c{Enter}");
    expect(screen.getAllByRole("textbox", { name: /^Entry/ })).toHaveLength(2);
  });

  it("limits each entry and the serialized total", async () => {
    const user = userEvent.setup();
    render(
      <ListField
        label="Tasks"
        labels={labels}
        defaultItems={["abcd"]}
        itemMaxLength={6}
        maxTotalLength={9}
      />,
    );
    const add = screen.getByRole("textbox", { name: "Tasks" });
    // 9 - ("abcd\n" = 5) = 4 left, below the item limit of 6.
    expect(add).toHaveAttribute("maxlength", "4");
    expect(screen.getByRole("textbox", { name: "Entry 1" })).toHaveAttribute("maxlength", "6");
    await user.type(add, "wxyz{Enter}");
    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
    expect(add).toHaveAttribute("maxlength", "0");
  });

  it("needs one entry when required, through the add input's custom validity", async () => {
    const user = userEvent.setup();
    render(
      <form>
        <ListField label="Tasks" labels={labels} required />
      </form>,
    );
    const add = screen.getByRole("textbox", { name: /^Tasks/ }) as HTMLInputElement;
    expect(add.validity.customError).toBe(true);
    expect(add.validationMessage).toBe("Add one entry");
    await user.type(add, "a{Enter}");
    expect(add.validity.valid).toBe(true);
    await user.click(screen.getByRole("button", { name: "Remove 1: a" }));
    expect(add.validationMessage).toBe("Add one entry");
  });

  it("commits the pending draft through the ref, with the hidden value already updated", async () => {
    const user = userEvent.setup();
    const ref = createRef<ListFieldHandle>();
    const { container } = render(<ListField ref={ref} label="Tasks" labels={labels} name="tasks" />);
    await user.type(screen.getByRole("textbox", { name: "Tasks" }), "pending");
    let added = false;
    act(() => {
      added = ref.current!.commitDraft();
    });
    expect(added).toBe(true);
    expect(hidden(container).value).toBe("pending");
    expect(ref.current!.commitDraft()).toBe(false);
  });

  it("goes back to the default entries when the form is reset", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <form>
        <ListField label="Tasks" labels={labels} name="tasks" defaultItems={["a"]} />
        <button type="reset">Reset</button>
      </form>,
    );
    await user.type(screen.getByRole("textbox", { name: "Tasks" }), "b{Enter}");
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(hidden(container).value).toBe("a");
    expect(screen.getAllByRole("textbox", { name: /^Entry/ })).toHaveLength(1);
  });

  it("disables every control and leaves the value out of the submission", () => {
    const { container } = render(
      <ListField label="Tasks" labels={labels} name="tasks" defaultItems={["a"]} disabled />,
    );
    expect(screen.getByRole("textbox", { name: "Entry 1" })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: "Tasks" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Remove 1: a" })).toBeDisabled();
    expect(hidden(container)).toBeDisabled();
  });

  it("describes the group with the hint and the error, and shows the badge", () => {
    render(
      <ListField
        label="Tasks"
        labels={labels}
        hint="One each"
        error="Too few"
        badge={<span>Optional</span>}
      />,
    );
    const group = screen.getByRole("group", { name: "Tasks" });
    expect(group).toHaveAccessibleDescription("One each Too few");
    expect(screen.getByText("Optional")).toBeInTheDocument();
  });

  describe("includeDraft", () => {
    const submitted = (form: HTMLFormElement) => new FormData(form).get("tasks");

    it("leaves the pending draft out of the value by default", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <form>
          <ListField label="Tasks" labels={labels} name="tasks" defaultItems={["a"]} />
        </form>,
      );
      await user.type(screen.getByRole("textbox", { name: "Tasks" }), "pending");
      expect(submitted(container.querySelector("form")!)).toBe("a");
    });

    it("submits the pending draft with the entries, sanitized, in a real form", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = render(
        <form>
          <ListField
            label="Tasks"
            labels={labels}
            name="tasks"
            includeDraft
            defaultItems={["a"]}
            sanitizeItem={(text) => text.trim().replace(/\s+/g, " ")}
            onChange={onChange}
          />
        </form>,
      );
      const form = container.querySelector("form")!;
      const add = screen.getByRole("textbox", { name: "Tasks" });
      await user.type(add, "  b   c ");
      expect(submitted(form)).toBe("a\nb c");
      // Typed text is still a draft: not an entry, no onChange, still in the input.
      expect(onChange).not.toHaveBeenCalled();
      expect(add).toHaveValue("  b   c ");
      expect(screen.queryByRole("textbox", { name: "Entry 2" })).not.toBeInTheDocument();
      await user.clear(add);
      expect(submitted(form)).toBe("a");
      await user.type(add, "   ");
      expect(submitted(form)).toBe("a");
    });

    it("does not count the draft twice once it is added", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <form>
          <ListField label="Tasks" labels={labels} name="tasks" includeDraft />
        </form>,
      );
      await user.type(screen.getByRole("textbox", { name: "Tasks" }), "b{Enter}");
      expect(submitted(container.querySelector("form")!)).toBe("b");
    });

    it("leaves a draft out when maxItems or maxTotalLength leave no room for it", async () => {
      const user = userEvent.setup();
      const field = (props: { maxItems?: number; maxTotalLength?: number }) => (
        <form>
          <ListField
            label="Tasks"
            labels={labels}
            name="tasks"
            includeDraft
            defaultItems={["ab"]}
            {...props}
          />
        </form>
      );
      const { container, rerender } = render(field({ maxItems: 2 }));
      const form = container.querySelector("form")!;
      await user.type(screen.getByRole("textbox", { name: "Tasks" }), "cd");
      expect(submitted(form)).toBe("ab\ncd");
      rerender(field({ maxItems: 1 }));
      expect(submitted(form)).toBe("ab");
      rerender(field({ maxItems: 2, maxTotalLength: 5 }));
      expect(submitted(form)).toBe("ab\ncd");
      rerender(field({ maxItems: 2, maxTotalLength: 4 }));
      expect(submitted(form)).toBe("ab");
    });

    it("follows a form reset", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <form>
          <ListField label="Tasks" labels={labels} name="tasks" includeDraft defaultItems={["a"]} />
          <button type="reset">Reset</button>
        </form>,
      );
      await user.type(screen.getByRole("textbox", { name: "Tasks" }), "b");
      expect(submitted(container.querySelector("form")!)).toBe("a\nb");
      await user.click(screen.getByRole("button", { name: "Reset" }));
      expect(submitted(container.querySelector("form")!)).toBe("a");
    });

    it("lets a required field submit with only a draft, and still blocks without one", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <form>
          <ListField
            label="Tasks"
            labels={labels}
            name="tasks"
            required
            includeDraft
            sanitizeItem={(text) => text.trim()}
          />
        </form>,
      );
      const form = container.querySelector("form")!;
      const add = screen.getByRole("textbox", { name: /^Tasks/ }) as HTMLInputElement;
      expect(form.checkValidity()).toBe(false);
      expect(add.validationMessage).toBe("Add one entry");
      await user.type(add, "   ");
      expect(form.checkValidity()).toBe(false);
      await user.type(add, "x");
      expect(form.checkValidity()).toBe(true);
      expect(submitted(form)).toBe("x");
      await user.clear(add);
      expect(form.checkValidity()).toBe(false);
    });

    it("keeps the required rule blocking on a draft without includeDraft", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <form>
          <ListField label="Tasks" labels={labels} name="tasks" required />
        </form>,
      );
      await user.type(screen.getByRole("textbox", { name: /^Tasks/ }), "x");
      expect(container.querySelector("form")!.checkValidity()).toBe(false);
    });

    it("has no axe violations with a draft", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ListField label="Tasks" labels={labels} name="tasks" required includeDraft />,
      );
      await user.type(screen.getByRole("textbox", { name: /^Tasks/ }), "x");
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  it("renders nothing for the counter unless renderCount is given", () => {
    const { container } = render(<ListField label="Tasks" labels={labels} defaultItems={["a"]} />);
    expect(container.querySelector("[data-lufia-part='hint']")).toBeNull();
    expect(screen.getByRole("group", { name: "Tasks" })).not.toHaveAttribute("aria-describedby");
  });

  it("renders the counter with the counts, describes the group with it and keeps it current", async () => {
    const user = userEvent.setup();
    const renderCount = vi.fn(
      ({
        count,
        maxItems,
        length,
        maxTotalLength,
      }: Parameters<NonNullable<ListFieldProps["renderCount"]>>[0]) =>
        `${count}/${maxItems} items, ${length}/${maxTotalLength} chars`,
    );
    render(
      <ListField
        label="Tasks"
        labels={labels}
        hint="One each"
        error="Too few"
        defaultItems={["ab"]}
        maxItems={5}
        maxTotalLength={20}
        renderCount={renderCount}
      />,
    );
    const group = screen.getByRole("group", { name: "Tasks" });
    expect(group).toHaveAccessibleDescription("One each 1/5 items, 2/20 chars Too few");
    await user.type(screen.getByRole("textbox", { name: "Tasks" }), "cd{Enter}");
    expect(group).toHaveAccessibleDescription("One each 2/5 items, 5/20 chars Too few");
  });

  it("passes undefined for maxTotalLength when there is no limit, and has no axe violations", async () => {
    const { container } = render(
      <ListField
        label="Tasks"
        labels={labels}
        defaultItems={["a"]}
        renderCount={({ maxTotalLength, count }) => `${count} ${String(maxTotalLength)}`}
      />,
    );
    expect(screen.getByText("1 undefined")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <ListField
        label="Tasks"
        labels={labels}
        required
        hint="One each"
        badge={<span>Optional</span>}
        defaultItems={["a", "b"]}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
    const { container: invalid } = render(
      <ListField label="Other" labels={labels} error="Too few" disabled defaultItems={["a"]} />,
    );
    expect(await axe(invalid)).toHaveNoViolations();
  });
});
