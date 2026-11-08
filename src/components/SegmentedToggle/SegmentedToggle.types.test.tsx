import type { ComponentProps } from "react";
import { SegmentedToggle, type SegmentedToggleOption, type SegmentedToggleProps } from "./SegmentedToggle";

const options: SegmentedToggleOption[] = [{ value: "a", label: "A", tone: "success" }];

// These are compile-time checks (`npm run typecheck`): wrappers around the props must keep compiling.
interface Wrapped extends SegmentedToggleProps {
  extra?: boolean;
}

type WithoutLabel = Omit<SegmentedToggleProps, "label">;

function Wrapper(props: WithoutLabel & Pick<Wrapped, "extra">) {
  return <SegmentedToggle label="Wrapped" {...props} />;
}

function FromComponentProps(props: ComponentProps<typeof SegmentedToggle>) {
  return <SegmentedToggle {...props} />;
}

function Driven({ flag }: { flag: boolean }) {
  return (
    <SegmentedToggle
      label="Driven"
      options={options}
      value={null}
      allowDeselect={flag}
      onValueChange={(value) => value.toUpperCase()}
      onDeselect={() => undefined}
    />
  );
}

describe("SegmentedToggle prop types", () => {
  it("compiles for wrappers, Omit, ComponentProps and a boolean allowDeselect", () => {
    expect([Wrapper, FromComponentProps, Driven]).toHaveLength(3);
  });

  it("types onValueChange as string only, so null never reaches it", () => {
    const handler: NonNullable<SegmentedToggleProps["onValueChange"]> = (value: string) => value;
    // @ts-expect-error a handler that needs a null-able value is not assignable
    const bad: SegmentedToggleProps["onValueChange"] = (value: null) => value;
    expect([handler, bad]).toHaveLength(2);
  });
});
