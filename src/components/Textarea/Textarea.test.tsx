import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { FormField } from "../FormField";
import { useState } from "react";
import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("renders a labelled textarea with rows and forwards rest props", () => {
    render(<Textarea aria-label="Notes" name="notes" rows={6} />);
    const box = screen.getByRole("textbox", { name: "Notes" });
    expect(box.tagName).toBe("TEXTAREA");
    expect(box).toHaveAttribute("rows", "6");
    expect(box).toHaveAttribute("name", "notes");
  });

  it("puts rootClassName on the root and className on the box", () => {
    render(<Textarea aria-label="Notes" className="box-extra" rootClassName="root-extra" />);
    const box = screen.getByRole("textbox", { name: "Notes" });
    expect(box.parentElement).toHaveClass("box-extra");
    expect(box.parentElement?.parentElement).toHaveClass("root-extra");
    expect(box.parentElement?.parentElement).not.toHaveClass("box-extra");
  });

  it("is not required and shows no mark when it is read-only", () => {
    render(
      <FormField label="Notes" required>
        <Textarea readOnly defaultValue="Fixed" />
      </FormField>,
    );
    const box = screen.getByRole("textbox");
    expect(box).not.toBeRequired();
    expect(box).not.toHaveAttribute("aria-required");
    expect(screen.queryByText("*")).toBeNull();
    expect(screen.queryByText(/\(required\)/)).toBeNull();
  });

  it("takes its ids and states from a FormField", () => {
    render(
      <FormField label="Notes" hint="Hint" error="Error" required>
        <Textarea />
      </FormField>,
    );
    const box = screen.getByLabelText(/Notes/);
    expect(box).toBeRequired();
    expect(box).toBeInvalid();
    expect(box).toHaveAccessibleDescription("Hint Error");
  });

  it("counts characters against the limit and describes the control with the count", async () => {
    const user = userEvent.setup();
    render(<Textarea aria-label="Notes" showCount maxLength={20} />);
    const box = screen.getByRole("textbox");
    expect(box).toHaveAccessibleDescription("0 / 20");
    await user.type(box, "Hello");
    expect(box).toHaveAccessibleDescription("5 / 20");
  });

  it("counts a controlled value", () => {
    render(<Textarea aria-label="Notes" showCount value="abc" readOnly />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("starts from the default value", () => {
    render(<Textarea aria-label="Notes" showCount maxLength={50} defaultValue="Hello" />);
    expect(screen.getByText("5 / 50")).toBeInTheDocument();
  });

  it("uses a custom count format", () => {
    render(
      <Textarea aria-label="Notes" showCount maxLength={10} formatCount={(n, max) => `${max! - n} left`} />,
    );
    expect(screen.getByText("10 left")).toBeInTheDocument();
  });

  it("announces the count only close to the limit", async () => {
    const user = userEvent.setup();
    render(<Textarea aria-label="Notes" showCount maxLength={10} />);
    const status = screen.getByRole("status");
    await user.type(screen.getByRole("textbox"), "12345678");
    expect(status).toBeEmptyDOMElement();
    await user.type(screen.getByRole("textbox"), "9");
    expect(status).toHaveTextContent("9 of 10 characters");
    expect(screen.getByText("9 / 10")).toHaveAttribute("data-near");
  });

  it("shows no count unless asked", () => {
    render(<Textarea aria-label="Notes" maxLength={10} />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("resets the count with the form", async () => {
    const user = userEvent.setup();
    render(
      <form>
        <Textarea aria-label="Notes" showCount maxLength={50} defaultValue="Hi" />
        <button type="reset">Reset</button>
      </form>,
    );
    await user.type(screen.getByRole("textbox"), " there");
    expect(screen.getByText("8 / 50")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByText("2 / 50")).toBeInTheDocument();
  });

  it("does not re-run a callback ref on every render", async () => {
    const user = userEvent.setup();
    const ref = vi.fn();
    render(<Textarea aria-label="Notes" ref={ref} showCount />);
    const calls = ref.mock.calls.length;
    await user.type(screen.getByRole("textbox"), "abc");
    expect(ref.mock.calls.length).toBe(calls);
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <FormField label="Notes" hint="Hint" error="Error">
        <Textarea showCount maxLength={100} />
      </FormField>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  describe("autoSize", () => {
    const scrollHeight = vi.spyOn(HTMLTextAreaElement.prototype, "scrollHeight", "get");
    const stubSupport = (supported: boolean) =>
      vi.stubGlobal("CSS", { supports: (property: string) => supported && property === "field-sizing" });

    afterEach(() => {
      scrollHeight.mockReset();
      vi.unstubAllGlobals();
    });

    it("is off by default: no marker, no custom properties, no measured height", () => {
      stubSupport(false);
      scrollHeight.mockReturnValue(200);
      const { container } = render(<Textarea aria-label="Notes" />);
      const box = screen.getByRole("textbox");
      expect(container.querySelector("[data-autosize]")).toBeNull();
      expect(box.style.getPropertyValue("--textarea-rows")).toBe("");
      expect(box.style.blockSize).toBe("");
    });

    it("hands rows and maxRows to the stylesheet, and never lets the maximum fall below the minimum", () => {
      stubSupport(true);
      const { container, rerender } = render(<Textarea aria-label="Notes" autoSize rows={2} maxRows={8} />);
      const box = screen.getByRole("textbox");
      expect(container.querySelector("[data-autosize][data-max-rows]")).not.toBeNull();
      expect(box.style.getPropertyValue("--textarea-rows")).toBe("2");
      expect(box.style.getPropertyValue("--textarea-max-rows")).toBe("8");
      rerender(<Textarea aria-label="Notes" autoSize rows={6} maxRows={3} />);
      expect(box.style.getPropertyValue("--textarea-max-rows")).toBe("6");
      rerender(<Textarea aria-label="Notes" autoSize rows={2} />);
      expect(container.querySelector("[data-max-rows]")).toBeNull();
    });

    it("keeps the caller's style next to its own", () => {
      stubSupport(true);
      render(<Textarea aria-label="Notes" autoSize style={{ color: "red" }} />);
      expect(screen.getByRole("textbox").style.color).toBe("red");
    });

    it("leaves the height to the browser where field-sizing is supported", async () => {
      const user = userEvent.setup();
      stubSupport(true);
      scrollHeight.mockReturnValue(200);
      render(<Textarea aria-label="Notes" autoSize />);
      await user.type(screen.getByRole("textbox"), "a");
      expect(screen.getByRole("textbox").style.blockSize).toBe("");
    });

    it("measures the content where field-sizing is missing, uncontrolled", async () => {
      const user = userEvent.setup();
      stubSupport(false);
      scrollHeight.mockReturnValue(90);
      render(<Textarea aria-label="Notes" autoSize />);
      const box = screen.getByRole("textbox");
      expect(box.style.blockSize).toBe("90px");
      scrollHeight.mockReturnValue(140);
      await user.type(box, "a");
      expect(box.style.blockSize).toBe("140px");
    });

    it("measures the content where field-sizing is missing, controlled, when the value changes from outside", () => {
      stubSupport(false);
      scrollHeight.mockReturnValue(90);
      function Controlled() {
        const [value, setValue] = useState("one");
        return (
          <>
            <Textarea aria-label="Notes" autoSize value={value} onChange={(e) => setValue(e.target.value)} />
            <button onClick={() => setValue("one\ntwo\nthree")}>Fill</button>
          </>
        );
      }
      render(<Controlled />);
      const box = screen.getByRole("textbox");
      expect(box.style.blockSize).toBe("90px");
      scrollHeight.mockReturnValue(160);
      act(() => screen.getByRole("button", { name: "Fill" }).click());
      expect(box.style.blockSize).toBe("160px");
    });

    it("measures again after the form is reset", async () => {
      const user = userEvent.setup();
      stubSupport(false);
      scrollHeight.mockReturnValue(90);
      render(
        <form>
          <Textarea aria-label="Notes" autoSize defaultValue="one" />
          <button type="reset">Reset</button>
        </form>,
      );
      const box = screen.getByRole("textbox");
      scrollHeight.mockReturnValue(200);
      await user.type(box, "more");
      expect(box.style.blockSize).toBe("200px");
      scrollHeight.mockReturnValue(90);
      await user.click(screen.getByRole("button", { name: "Reset" }));
      await vi.waitFor(() => expect(box.style.blockSize).toBe("90px"));
    });

    it("drops a measured height when autoSize is turned off", () => {
      stubSupport(false);
      scrollHeight.mockReturnValue(90);
      const { rerender } = render(<Textarea aria-label="Notes" autoSize />);
      expect(screen.getByRole("textbox").style.blockSize).toBe("90px");
      rerender(<Textarea aria-label="Notes" />);
      expect(screen.getByRole("textbox").style.blockSize).toBe("");
    });

    it("has no axe violations", async () => {
      stubSupport(false);
      const { container } = render(
        <FormField label="Notes" hint="Hint">
          <Textarea autoSize rows={2} maxRows={6} showCount />
        </FormField>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
