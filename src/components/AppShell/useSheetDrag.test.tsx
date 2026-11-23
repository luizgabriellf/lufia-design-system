import { fireEvent, render, screen } from "@testing-library/react";
import { useSheetDrag } from "./useSheetDrag";

function Marked({ onDismiss }: { onDismiss: () => void }) {
  const handlers = useSheetDrag(onDismiss);
  return (
    <div data-testid="outer" role="dialog" aria-label="Outer">
      <div data-testid="panel" data-sheet-panel="" data-state="open">
        <div data-testid="zone" {...handlers}>
          Grab
        </div>
      </div>
    </div>
  );
}

describe("useSheetDrag panel marker", () => {
  it("drives the nearest [data-sheet-panel] ahead of an enclosing dialog", () => {
    const onDismiss = vi.fn();
    render(<Marked onDismiss={onDismiss} />);
    const zone = screen.getByTestId("zone");
    fireEvent.pointerDown(zone, { pointerId: 1, clientY: 0, button: 0, pointerType: "touch" });
    fireEvent.pointerMove(zone, { pointerId: 1, clientY: 150, pointerType: "touch" });
    expect(screen.getByTestId("panel")).toHaveAttribute("data-dragging", "true");
    expect(screen.getByTestId("panel").style.getPropertyValue("--lufia-sheet-drag")).toBe("150px");
    expect(screen.getByTestId("outer")).not.toHaveAttribute("data-dragging");
    fireEvent.pointerUp(zone, { pointerId: 1, clientY: 150, pointerType: "touch" });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
