import { renderHook } from "@testing-library/react";
import { useStepDirection } from "./useStepDirection";

describe("useStepDirection", () => {
  it("is undefined until the first change", () => {
    const { result } = renderHook(({ step }) => useStepDirection(step), { initialProps: { step: 0 } });
    expect(result.current).toBeUndefined();
  });

  it("reports next when the step grows and back when it shrinks", () => {
    const { result, rerender } = renderHook(({ step }) => useStepDirection(step), {
      initialProps: { step: 0 },
    });
    rerender({ step: 1 });
    expect(result.current).toBe("next");
    rerender({ step: 2 });
    expect(result.current).toBe("next");
    rerender({ step: 1 });
    expect(result.current).toBe("back");
  });

  it("resets once the flow is no longer active", () => {
    const { result, rerender } = renderHook(({ step, active }) => useStepDirection(step, active), {
      initialProps: { step: 0, active: true },
    });
    rerender({ step: 1, active: true });
    expect(result.current).toBe("next");
    rerender({ step: 1, active: false });
    expect(result.current).toBeUndefined();
  });
});
