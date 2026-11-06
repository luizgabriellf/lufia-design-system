import { render, screen } from "@testing-library/react";
import { axe } from "../../test/axe";
import { FormField } from "./FormField";
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

  it("has no axe violations", async () => {
    const { container } = render(
      <FormField label="Name" hint="Hint" error="Error" required>
        {(control) => <input {...control} />}
      </FormField>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
