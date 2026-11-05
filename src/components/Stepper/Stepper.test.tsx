import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { Stepper } from "./Stepper";

const steps = [
  { key: "a", label: "Details" },
  { key: "b", label: "Review" },
  { key: "c", label: "Confirm" },
];

describe("Stepper", () => {
  it("announces the active step through a polite status region", () => {
    render(<Stepper steps={steps} current={1} />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent("2 / 3: Review");
  });

  it("marks only the active step with aria-current", () => {
    render(<Stepper steps={steps} current={1} />);
    const items = screen.getAllByRole("listitem");
    expect(items.map((item) => item.getAttribute("aria-current"))).toEqual([null, "step", null]);
  });

  it("names every step for assistive technology without exposing the visual label twice", () => {
    render(<Stepper steps={steps} current={1} />);
    expect(screen.getAllByText("2. Review")).toHaveLength(1);
  });

  it("renders only visited steps as buttons, and only when a handler is given", async () => {
    const onStepClick = vi.fn();
    const user = userEvent.setup();
    render(<Stepper steps={steps} current={2} onStepClick={onStepClick} />);
    expect(screen.getAllByRole("button").map((button) => button.getAttribute("aria-label"))).toEqual([
      "1. Details",
      "2. Review",
    ]);
    await user.click(screen.getByRole("button", { name: "2. Review" }));
    expect(onStepClick).toHaveBeenCalledWith(1);
  });

  it("renders no buttons without a handler (nothing unreachable to tab past)", () => {
    render(<Stepper steps={steps} current={2} />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("has no axe violations", async () => {
    const { container } = render(<Stepper steps={steps} current={1} onStepClick={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
