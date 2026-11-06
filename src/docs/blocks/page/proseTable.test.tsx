import { render, screen } from "@testing-library/react";
import { axe } from "../../../test/axe";
import { ProseTable } from "../../../../.storybook/ProseTable";

// What a component page's Markdown tables become: two tables under headings, inside the docs content frame.
function Page() {
  return (
    <div className="sbdocs-content">
      <h2>Props</h2>
      <ProseTable>
        <thead>
          <tr>
            <th>Prop</th>
            <th>Use</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>a</td>
            <td>b</td>
          </tr>
        </tbody>
      </ProseTable>
      <h2>Keyboard</h2>
      <ProseTable>
        <thead>
          <tr>
            <th>Key</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Tab</td>
            <td>Moves focus</td>
          </tr>
        </tbody>
      </ProseTable>
    </div>
  );
}

const original = { sw: Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollWidth") };
function overflow(on: boolean) {
  Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
    configurable: true,
    get: () => (on ? 500 : 100),
  });
  Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => 100 });
}

describe("ProseTable", () => {
  beforeEach(() => {
    globalThis.ResizeObserver = class {
      constructor(private callback: () => void) {}
      observe() {
        this.callback();
      }
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  });
  afterEach(() => {
    if (original.sw) Object.defineProperty(HTMLElement.prototype, "scrollWidth", original.sw);
    else Reflect.deleteProperty(HTMLElement.prototype, "scrollWidth");
    Reflect.deleteProperty(HTMLElement.prototype, "clientWidth");
  });

  it("adds no tab stop or landmark to tables that fit", async () => {
    overflow(false);
    const { container } = render(<Page />);
    expect(screen.queryAllByRole("region")).toHaveLength(0);
    expect(container.querySelector("[tabindex]")).toBeNull();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("makes each overflowing table a focusable region with its own name", async () => {
    overflow(true);
    const { container } = render(<Page />);
    const regions = screen.getAllByRole("region");
    expect(regions.map((region) => region.getAttribute("aria-label"))).toEqual([
      "Props table 1, scrollable",
      "Keyboard table 2, scrollable",
    ]);
    for (const region of regions) expect(region).toHaveAttribute("tabindex", "0");
    expect(await axe(container)).toHaveNoViolations();
  });
});
