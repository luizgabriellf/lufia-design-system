import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { axe } from "../../test/axe";
import { ListField, type ListFieldHandle, type ListFieldLabels } from "./ListField";

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
