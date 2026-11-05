import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { ColorExplorer } from "./ColorExplorer";
import { ComponentGallery } from "./ComponentGallery";
import { DocTable } from "./DocTable";
import { FeatureGrid } from "./FeatureGrid";
import { Hero } from "./Hero";
import { ResourceLinks } from "./ResourceLinks";
import { SpacingRuler } from "./SpacingRuler";
import { ThemeShowcase } from "./ThemeShowcase";
import { ElevationDemo, LayerStack, RadiusDemo } from "./ShapeDemos";
import { FamilySpecimens, ScaleSpecimens } from "./TypeSpecimens";

// Docs-only blocks: they never ship in the package, but the docs site is held to the same accessibility bar.
describe("docs blocks", () => {
  it.each([
    ["Hero", <Hero key="h" />],
    ["FeatureGrid", <FeatureGrid key="f" />],
    ["ComponentGallery", <ComponentGallery key="g" />],
    ["ThemeShowcase", <ThemeShowcase key="t" />],
    ["ResourceLinks", <ResourceLinks key="r" />],
    ["ColorExplorer", <ColorExplorer key="c" />],
    ["SpacingRuler", <SpacingRuler key="s" />],
    ["RadiusDemo", <RadiusDemo key="rd" />],
    ["ElevationDemo", <ElevationDemo key="e" />],
    ["LayerStack", <LayerStack key="l" />],
    ["FamilySpecimens", <FamilySpecimens key="ff" />],
    ["ScaleSpecimens", <ScaleSpecimens key="ss" />],
    ["DocTable", <DocTable key="d" label="Demo" head={["A", "B"]} rows={[["`x`", "y"]]} />],
  ])("%s has no axe violations", async (_name, element) => {
    const { container } = render(element);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("hides the live gallery previews from assistive technology and the tab order", () => {
    const { container } = render(<ComponentGallery />);
    const previews = container.querySelectorAll("[aria-hidden='true'][inert]");
    expect(previews.length).toBeGreaterThanOrEqual(16);
    // Each card exposes exactly one link: the component name.
    expect(screen.getAllByRole("link")).toHaveLength(previews.length);
  });

  it("links every gallery card to a docs page", () => {
    render(<ComponentGallery />);
    const link = screen.getByRole("link", { name: "EmptyState" });
    expect(link).toHaveAttribute("href", "./?path=/docs/components-emptystate--docs");
  });

  it("opens external links safely and says so", () => {
    render(<ResourceLinks />);
    for (const link of screen.getAllByRole("link")) {
      expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
      expect(link).toHaveAccessibleName(/opens in a new tab/);
    }
  });

  it("passes every contrast pair it rates in the default theme, light and dark", async () => {
    const user = userEvent.setup();
    render(<ColorExplorer />);
    for (const mode of ["light", "dark"]) {
      await user.click(screen.getByRole("button", { name: mode }));
      const group = screen.getByRole("heading", { name: /Accent and focus/ }).closest("section")!;
      // The focus ring is rated against the canvas, not against itself.
      const ring = within(group).getByText("focus.ring").closest("li")!;
      expect(ring).toHaveTextContent(/(?<![\d.])([3-9]|1\d)\.\d\d:1 · AA/);
      expect(document.body).not.toHaveTextContent(/· Fail/);
    }
  });
});
