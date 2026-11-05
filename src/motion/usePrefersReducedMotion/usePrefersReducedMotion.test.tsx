import { act, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { mockReducedMotion } from "../../test/motion";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

function Probe() {
  return <p>{usePrefersReducedMotion() ? "reduced" : "full"}</p>;
}

describe("usePrefersReducedMotion", () => {
  it("reads the current preference", () => {
    mockReducedMotion(true);
    render(<Probe />);
    expect(screen.getByText("reduced")).toBeInTheDocument();
  });

  it("follows changes while mounted", () => {
    const media = mockReducedMotion(false);
    render(<Probe />);
    expect(screen.getByText("full")).toBeInTheDocument();
    act(() => media.set(true));
    expect(screen.getByText("reduced")).toBeInTheDocument();
  });

  it("falls back to full motion without matchMedia", () => {
    vi.stubGlobal("matchMedia", undefined);
    render(<Probe />);
    expect(screen.getByText("full")).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it("renders on the server without touching window", () => {
    expect(renderToString(<Probe />)).toContain("full");
  });
});
