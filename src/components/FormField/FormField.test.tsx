import { render, screen } from "@testing-library/react";
import { axe } from "../../test/axe";
import { LufiaProvider } from "../LufiaProvider";
import { FormField } from "./FormField";
import { TextInput } from "../TextInput";
import { Combobox } from "../Combobox";
import { SearchInput } from "../SearchInput";
import { useFormFieldControl } from "./useFormFieldControl";

function Probe(props: { "aria-describedby"?: string; required?: boolean }) {
  const control = useFormFieldControl(props);
  return <input data-testid="probe" {...control} />;
}

describe("FormField", () => {
  it("names the control with the label", () => {
    render(<FormField label="Project name">{(control) => <input {...control} />}</FormField>);
    expect(screen.getByLabelText("Project name")).toBeInTheDocument();
  });

  it("describes the control with the hint, then the error, and marks it invalid", () => {
    render(
      <FormField label="Name" hint="Up to 40 characters." error="Enter a name.">
        {(control) => <input {...control} />}
      </FormField>,
    );
    const input = screen.getByLabelText("Name");
    expect(input).toHaveAccessibleDescription("Up to 40 characters. Enter a name.");
    expect(input).toBeInvalid();
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a name.");
  });

  it("sets neither aria-describedby nor aria-invalid when there is no hint or error", () => {
    render(<FormField label="Name">{(control) => <input {...control} />}</FormField>);
    const input = screen.getByLabelText("Name");
    expect(input).not.toHaveAttribute("aria-describedby");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("states a required field in text, not only with a mark", () => {
    render(
      <FormField label="Name" required requiredLabel="obrigatório">
        {(control) => <input {...control} />}
      </FormField>,
    );
    const input = screen.getByRole("textbox", { name: /Name.*\(obrigatório\)/ });
    expect(input).toBeRequired();
  });

  it("passes disabled to the control", () => {
    render(
      <FormField label="Name" disabled>
        {(control) => <input {...control} />}
      </FormField>,
    );
    expect(screen.getByLabelText("Name")).toBeDisabled();
  });

  it("uses the given id as the base of the hint and error ids", () => {
    render(
      <FormField label="Name" id="project" hint="Hint" error="Error">
        {(control) => <input {...control} />}
      </FormField>,
    );
    expect(screen.getByLabelText("Name")).toHaveAttribute("id", "project");
    expect(screen.getByLabelText("Name")).toHaveAttribute("aria-describedby", "project-hint project-error");
  });

  it("reaches controls through context", () => {
    render(
      <FormField label="Name" hint="Hint" required>
        <Probe aria-describedby="extra" />
      </FormField>,
    );
    const probe = screen.getByTestId("probe");
    expect(probe.getAttribute("aria-describedby")).toMatch(/-hint extra$/);
    expect(probe).toBeRequired();
    expect(probe.id).toBe(screen.getByText("Name").closest("label")!.getAttribute("for"));
  });

  it("leaves a control outside a field untouched", () => {
    render(<Probe required />);
    const probe = screen.getByTestId("probe");
    expect(probe).toBeRequired();
    expect(probe).not.toHaveAttribute("id");
  });

  it("passes className and rest props to the root", () => {
    render(
      <FormField label="Name" className="extra" data-testid="root">
        {(control) => <input {...control} />}
      </FormField>,
    );
    expect(screen.getByTestId("root")).toHaveClass("root", "extra");
  });

  it("exposes stable data-lufia-part hooks", () => {
    render(
      <FormField label="Name" hint="Hint" error="Error" data-testid="root">
        {(control) => <input {...control} />}
      </FormField>,
    );
    const part = (name: string) => document.querySelectorAll(`[data-lufia-part="${name}"]`);
    expect(screen.getByTestId("root")).toHaveAttribute("data-lufia-part", "field");
    expect(part("label")).toHaveLength(1);
    expect(part("label")[0]!.tagName).toBe("LABEL");
    expect(part("hint")[0]).toHaveTextContent("Hint");
    expect(part("error")[0]).toHaveTextContent("Error");
    expect(part("control")).toHaveLength(1);
    expect(part("control")[0]!.contains(screen.getByRole("textbox"))).toBe(true);
  });

  it("omits the hint and error hooks when there is neither", () => {
    render(<FormField label="Name">{(control) => <input {...control} />}</FormField>);
    expect(document.querySelector('[data-lufia-part="hint"]')).toBeNull();
    expect(document.querySelector('[data-lufia-part="error"]')).toBeNull();
  });

  it("takes the required text from LufiaProvider labels, and an explicit prop wins", () => {
    render(
      <LufiaProvider labels={{ required: "obrigatório" }}>
        <FormField label="Name" required>
          {(control) => <input {...control} />}
        </FormField>
        <FormField label="Email" required requiredLabel="a preencher">
          {(control) => <input {...control} />}
        </FormField>
      </LufiaProvider>,
    );
    expect(screen.getByRole("textbox", { name: "Name(obrigatório)" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Email(a preencher)" })).toBeInTheDocument();
  });

  it("falls back to the English word without a provider", () => {
    render(
      <FormField label="Name" required>
        {(control) => <input {...control} />}
      </FormField>,
    );
    expect(screen.getByRole("textbox", { name: "Name(required)" })).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <FormField label="Name" hint="Hint" error="Error" required>
        {(control) => <input {...control} />}
      </FormField>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("lists each described-by id once, in order, when the control repeats the error id", () => {
    render(
      <FormField label="Name" id="x" hint="Hint" error="Error">
        <TextInput aria-describedby="x-error  extra  x-hint " />
      </FormField>,
    );
    expect(screen.getByLabelText("Name")).toHaveAttribute("aria-describedby", "x-hint x-error extra");
  });

  it("sets no aria-describedby when every token is empty", () => {
    render(<TextInput aria-label="Name" aria-describedby="  " />);
    expect(screen.getByLabelText("Name")).not.toHaveAttribute("aria-describedby");
  });

  it("puts native required on the control by default", () => {
    render(
      <FormField label="Name" required>
        <TextInput />
      </FormField>,
    );
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("required");
    expect(input).not.toHaveAttribute("aria-required");
  });

  it("gives aria-required and no native required with nativeRequired={false}", () => {
    render(
      <FormField label="Name" required nativeRequired={false}>
        <TextInput />
      </FormField>,
    );
    const input = screen.getByRole("textbox");
    expect(input).not.toHaveAttribute("required");
    expect(input).toHaveAttribute("aria-required", "true");
    expect(input).toBeValid();
  });

  it("keeps the mark and text of a required field with nativeRequired={false}", () => {
    render(
      <FormField label="Name" required nativeRequired={false} requiredLabel="obrigatório">
        <TextInput />
      </FormField>,
    );
    expect(screen.getByRole("textbox", { name: /Name.*\(obrigatório\)/ })).toBeInTheDocument();
  });

  it("marks a Combobox aria-required, without blocking submit, with nativeRequired={false}", () => {
    render(
      <FormField label="City" required nativeRequired={false}>
        <Combobox options={[{ value: "a", label: "A" }]} loadingLabel="Loading" emptyLabel="None" />
      </FormField>,
    );
    const input = screen.getByRole("combobox");
    expect(input).toHaveAttribute("aria-required", "true");
    expect((input as HTMLInputElement).validity.valid).toBe(true);
  });

  it("does not turn a control's own required into aria-only", () => {
    render(
      <FormField label="Name" required nativeRequired={false}>
        <TextInput required />
      </FormField>,
    );
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("required");
    expect(input).not.toHaveAttribute("aria-required");
  });
  describe("ids", () => {
    it("keeps an explicit id on the control and points the label at it", () => {
      render(
        <FormField label="Name" hint="Hint">
          <TextInput id="own-id" />
        </FormField>,
      );
      const input = screen.getByRole("textbox", { name: "Name" });
      expect(input).toHaveAttribute("id", "own-id");
      expect(screen.getByText("Name").closest("label")).toHaveAttribute("for", "own-id");
      expect(input).toHaveAccessibleDescription("Hint");
    });

    it("never gives two controls in one field the same id", () => {
      render(
        <FormField label="Range">
          <TextInput aria-label="From" />
          <TextInput aria-label="To" />
        </FormField>,
      );
      const [from, to] = screen.getAllByRole("textbox");
      expect(from!.id).toBeTruthy();
      expect(to!.id).toBeTruthy();
      expect(from!.id).not.toBe(to!.id);
      const ids = [...document.querySelectorAll("[id]")].map((node) => node.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("names only the first control, and the second keeps its own id", () => {
      render(
        <FormField label="Range">
          <TextInput />
          <TextInput id="second" aria-label="To" />
        </FormField>,
      );
      const [first, second] = screen.getAllByRole("textbox");
      expect(second).toHaveAttribute("id", "second");
      expect(screen.getByText("Range").closest("label")).toHaveAttribute("for", first!.id);
      expect(first).toHaveAccessibleName("Range");
      expect(second).toHaveAccessibleName("To");
    });

    it("lets a later control with an explicit id stay out of the label when an earlier one owns the field", () => {
      render(
        <FormField label="Name">
          <TextInput />
          <SearchInput id="q" aria-label="Find" />
        </FormField>,
      );
      expect(screen.getByRole("searchbox")).toHaveAttribute("id", "q");
      expect(screen.getByRole("textbox", { name: "Name" })).toBeInTheDocument();
    });

    it("keeps single-control behaviour: the field id is the control id", () => {
      render(
        <FormField label="Name" id="project">
          <TextInput />
        </FormField>,
      );
      expect(screen.getByRole("textbox")).toHaveAttribute("id", "project");
      expect(screen.getByText("Name").closest("label")).toHaveAttribute("for", "project");
    });

    it("has no axe violations with an explicit id or two controls", async () => {
      const { container } = render(
        <FormField label="Range">
          <TextInput id="from" />
          <TextInput aria-label="To" />
        </FormField>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
