import { readFileSync } from "node:fs";
import { globSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { axe } from "../../../test/axe";
import { ConfirmDeleteDemo } from "../../patterns/ConfirmDeleteDemo";
import { DetailPageDemo } from "../../patterns/DetailPageDemo";
import { ListPageDemo } from "../../patterns/ListPageDemo";
import { PatternHeader } from "../../patterns/PatternHeader";
import { SettingsFormDemo } from "../../patterns/SettingsFormDemo";
import { ENTRIES, docsIdFor, entryFor, titleFor } from "../../taxonomy";
import {
  AppShellAnatomy,
  BadgeDoDont,
  BadgeTones,
  ButtonAnatomy,
  ButtonDoDont,
  ButtonSizes,
  ButtonVariants,
  CardAnatomy,
  CardDoDont,
  ComboboxAnatomy,
  DocHeader,
  EmptyStateDoDont,
  FormFieldAnatomy,
  FormFieldDoDont,
  ModalAnatomy,
  ModalDoDont,
  ToastAnatomy,
  ToastDoDont,
} from "./index";

describe("docs page template", () => {
  it.each([
    ["ButtonAnatomy", <ButtonAnatomy key="1" />],
    ["FormFieldAnatomy", <FormFieldAnatomy key="2" />],
    ["CardAnatomy", <CardAnatomy key="3" />],
    ["ModalAnatomy", <ModalAnatomy key="4" />],
    ["ToastAnatomy", <ToastAnatomy key="5" />],
    ["ComboboxAnatomy", <ComboboxAnatomy key="6" />],
    ["AppShellAnatomy", <AppShellAnatomy key="7" />],
    ["ButtonDoDont", <ButtonDoDont key="8" />],
    ["ModalDoDont", <ModalDoDont key="9" />],
    ["ToastDoDont", <ToastDoDont key="10" />],
    ["FormFieldDoDont", <FormFieldDoDont key="11" />],
    ["CardDoDont", <CardDoDont key="12" />],
    ["BadgeDoDont", <BadgeDoDont key="13" />],
    ["EmptyStateDoDont", <EmptyStateDoDont key="14" />],
    ["ButtonVariants", <ButtonVariants key="15" />],
    ["ButtonSizes", <ButtonSizes key="16" />],
    ["BadgeTones", <BadgeTones key="17" />],
    ["DocHeader", <DocHeader key="18" name="Button" status="beta" sections={["overview", "props"]} />],
    ["PatternHeader", <PatternHeader key="19" title="Settings form" summary="A form." uses={["Button"]} />],
    ["SettingsFormDemo", <SettingsFormDemo key="20" />],
    ["ListPageDemo", <ListPageDemo key="21" />],
    ["ConfirmDeleteDemo", <ConfirmDeleteDemo key="22" />],
    ["DetailPageDemo", <DetailPageDemo key="23" />],
  ])("%s has no axe violations", async (_name, element) => {
    const { container } = render(element);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("gives an anatomy figure one legend item per pin, with the pins hidden from assistive technology", () => {
    const { container } = render(<ModalAnatomy />);
    const legend = screen.getAllByRole("listitem");
    expect(legend).toHaveLength(6);
    expect(container.querySelectorAll("[aria-hidden='true'] [data-side]")).toHaveLength(6);
  });

  it("states Do and Don't in words, so the live renders can stay decorative", () => {
    render(<ButtonDoDont />);
    expect(screen.getByText("Do")).toBeInTheDocument();
    expect(screen.getByText("Don't")).toBeInTheDocument();
  });

  it("shows the status as text and links the source, the WAI-ARIA pattern and each section", () => {
    render(<DocHeader name="Modal" status="beta" sections={["overview", "accessibility"]} />);
    expect(screen.getByText(/Status:/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Source on GitHub/ })).toHaveAttribute(
      "href",
      expect.stringContaining("/src/components/Modal"),
    );
    expect(screen.getByRole("link", { name: /Dialog \(modal\)/ })).toHaveAttribute(
      "href",
      expect.stringContaining("w3.org/WAI/ARIA/apg/patterns/dialog-modal"),
    );
    expect(screen.getByRole("link", { name: "Accessibility" })).toHaveAttribute(
      "href",
      "#section-accessibility",
    );
  });

  it("opens a section tab on its anchor", () => {
    render(<DocHeader name="Button" status="stable" sections={["overview", "props"]} />);
    expect(screen.getByRole("link", { name: "Props" })).toHaveAttribute("href", "#section-props");
  });
});

describe("taxonomy", () => {
  it("has unique names and docs ids", () => {
    expect(new Set(ENTRIES.map((entry) => entry.name)).size).toBe(ENTRIES.length);
    expect(new Set(ENTRIES.map((entry) => docsIdFor(entry.name))).size).toBe(ENTRIES.length);
  });

  it("matches the title of every component's stories, so sidebar groups and links cannot drift", () => {
    const files = globSync("src/{components,motion}/*/*.stories.tsx").filter(
      (file) => !/(Sidebar|MobileFloatBar|NavSheet|Forms)\.stories/.test(file),
    );
    expect(files.length).toBeGreaterThan(40);
    for (const file of files) {
      const name = file.split("/").at(-2) as string;
      const title = /^ {2}title: "((?:Components|Hooks)\/[^"]+)",$/m.exec(readFileSync(file, "utf8"))?.[1];
      expect(title, file).toBe(titleFor(entryFor(name)));
    }
  });

  it("documents every component page with a header that names its entry", () => {
    const pages = globSync("src/{components,motion}/*/*.mdx");
    expect(pages.length).toBe(ENTRIES.length);
    for (const file of pages) {
      const name = file.split("/").at(-2) as string;
      expect(readFileSync(file, "utf8"), file).toMatch(new RegExp(`<DocHeader\\s+name="${name}"`));
    }
  });
});
