import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { axe } from "../../test/axe";
import { FormField } from "../FormField";
import { FileField, type FileFieldProps } from "./FileField";
import { formatFileSize, matchesAccept } from "./fileUtils";

const file = (name: string, size = 1200, type = "application/pdf") => {
  const created = new File(["x"], name, { type });
  Object.defineProperty(created, "size", { value: size });
  return created;
};

const formatRejection: FileFieldProps["formatRejection"] = ({ file: rejected, reason }, limits) =>
  ({
    type: `${rejected.name} is not an accepted type (${limits.accept}).`,
    size: `${rejected.name} is larger than ${formatFileSize(limits.maxSize ?? 0, "en")}.`,
    count: `${rejected.name} was not added: at most ${limits.maxFiles} files.`,
  })[reason];

function renderField(props: Partial<FileFieldProps> = {}) {
  return render(
    <FormField label="Attachments">
      <FileField chooseLabel="Choose files" formatRejection={formatRejection} {...props} />
    </FormField>,
  );
}

const input = () => screen.getByLabelText(/Attachments/) as HTMLInputElement;

describe("fileUtils", () => {
  it("formats sizes by unit and locale", () => {
    expect(formatFileSize(820, "en")).toBe("820 B");
    expect(formatFileSize(12 * 1024, "en")).toBe("12 KB");
    expect(formatFileSize(1.4 * 1024 * 1024, "en")).toBe("1.4 MB");
    expect(formatFileSize(1.4 * 1024 * 1024, "pt-PT")).toMatch(/^1,4/);
  });

  it("matches extensions, MIME types and wildcards", () => {
    expect(matchesAccept({ name: "a.PDF", type: "" }, ".pdf, .png")).toBe(true);
    expect(matchesAccept({ name: "a.txt", type: "text/plain" }, "application/pdf")).toBe(false);
    expect(matchesAccept({ name: "a.png", type: "image/png" }, "image/*")).toBe(true);
    expect(matchesAccept({ name: "a.png", type: "image/png" }, undefined)).toBe(true);
  });
});

describe("FileField", () => {
  it("renders the native file input, named by the field, with a visible button", () => {
    renderField({ accept: ".pdf", name: "attachments", multiple: true });
    expect(input()).toHaveAttribute("type", "file");
    expect(input()).toHaveAttribute("name", "attachments");
    expect(input()).toHaveAttribute("accept", ".pdf");
    expect(input()).toBeInTheDocument();
    expect(screen.getByText("Choose files")).toBeInTheDocument();
  });

  it("lists chosen files with their size and reports them", async () => {
    const user = userEvent.setup();
    const onFilesChange = vi.fn();
    renderField({ multiple: true, locale: "en", onFilesChange });
    await user.upload(input(), [file("report.pdf", 12 * 1024), file("notes.pdf", 800)]);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("report.pdf");
    expect(items[0]).toHaveTextContent("12 KB");
    expect(items[1]).toHaveTextContent("800 B");
    expect(onFilesChange).toHaveBeenCalledTimes(1);
    expect(onFilesChange.mock.calls[0]![0]).toHaveLength(2);
  });

  it("adds to the list on a second pick when multiple, and ignores a duplicate", async () => {
    const user = userEvent.setup();
    renderField({ multiple: true });
    const a = file("a.pdf");
    await user.upload(input(), a);
    await user.upload(input(), [a, file("b.pdf")]);
    expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual([
      expect.stringContaining("a.pdf"),
      expect.stringContaining("b.pdf"),
    ]);
  });

  it("replaces the file when single, and changes the button text", async () => {
    const user = userEvent.setup();
    renderField({ replaceLabel: "Replace file" });
    await user.upload(input(), file("a.pdf"));
    expect(screen.getByText("Replace file")).toBeInTheDocument();
    await user.upload(input(), file("b.pdf"));
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByRole("listitem")).toHaveTextContent("b.pdf");
  });

  it("removes a file with its button, names the button after the file and returns focus to the input", async () => {
    const user = userEvent.setup();
    const onFilesChange = vi.fn();
    renderField({ multiple: true, onFilesChange, removeLabel: (f) => `Remove ${f.name} now` });
    await user.upload(input(), [file("a.pdf"), file("b.pdf")]);
    await user.click(screen.getByRole("button", { name: "Remove a.pdf now" }));
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByRole("listitem")).toHaveTextContent("b.pdf");
    expect(input()).toHaveFocus();
    expect(onFilesChange).toHaveBeenLastCalledWith([expect.objectContaining({ name: "b.pdf" })]);
  });

  it("shows the empty text until a file is chosen", async () => {
    const user = userEvent.setup();
    renderField({ emptyLabel: "No file chosen" });
    expect(screen.getByText("No file chosen")).toBeInTheDocument();
    await user.upload(input(), file("a.pdf"));
    expect(screen.queryByText("No file chosen")).not.toBeInTheDocument();
  });

  describe("validation", () => {
    it("rejects a file of the wrong type with the message from props", async () => {
      const user = userEvent.setup({ applyAccept: false });
      const onReject = vi.fn();
      renderField({ accept: ".pdf", onReject });
      await user.upload(input(), file("photo.png", 100, "image/png"));
      expect(screen.getByRole("alert")).toHaveTextContent("photo.png is not an accepted type (.pdf).");
      expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
      expect(input()).toBeInvalid();
      expect(input()).toHaveAccessibleDescription("photo.png is not an accepted type (.pdf).");
      expect(onReject).toHaveBeenCalledWith([expect.objectContaining({ reason: "type" })]);
    });

    it("rejects a file over the size limit", async () => {
      const user = userEvent.setup();
      renderField({ maxSize: 1024 * 1024 });
      await user.upload(input(), file("big.pdf", 2 * 1024 * 1024));
      expect(screen.getByRole("alert")).toHaveTextContent("big.pdf is larger than 1 MB.");
    });

    it("rejects files beyond the count limit and keeps the ones that fit", async () => {
      const user = userEvent.setup();
      renderField({ multiple: true, maxFiles: 2 });
      await user.upload(input(), [file("a.pdf"), file("b.pdf"), file("c.pdf")]);
      expect(screen.getAllByRole("listitem")).toHaveLength(2);
      expect(screen.getByRole("alert")).toHaveTextContent("c.pdf was not added: at most 2 files.");
    });

    it("lists several rejections and clears them on the next pick", async () => {
      const user = userEvent.setup({ applyAccept: false });
      renderField({ multiple: true, accept: ".pdf" });
      await user.upload(input(), [file("a.png", 1, "image/png"), file("b.png", 1, "image/png")]);
      expect(within(screen.getByRole("alert")).getAllByRole("listitem")).toHaveLength(2);
      await user.upload(input(), file("ok.pdf"));
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("drag and drop", () => {
    const zone = () => input().parentElement!;
    const drop = (files: File[]) => fireEvent.drop(zone(), { dataTransfer: { types: ["Files"], files } });

    it("marks the zone while files are dragged over it, and clears on leave", () => {
      renderField();
      fireEvent.dragOver(zone(), { dataTransfer: { types: ["Files"] } });
      expect(zone()).toHaveAttribute("data-dragging");
      fireEvent.dragLeave(zone(), { relatedTarget: document.body });
      expect(zone()).not.toHaveAttribute("data-dragging");
    });

    it("ignores drags that are not files", () => {
      renderField();
      fireEvent.dragOver(zone(), { dataTransfer: { types: ["text/plain"] } });
      expect(zone()).not.toHaveAttribute("data-dragging");
    });

    it("accepts dropped files and applies the same limits", () => {
      renderField({ multiple: true, accept: ".pdf" });
      drop([file("a.pdf"), file("b.png", 10, "image/png")]);
      expect(screen.getAllByRole("listitem")).toHaveLength(1);
      expect(screen.getByRole("alert")).toHaveTextContent("b.png is not an accepted type");
    });

    it("takes only the first dropped file when single", () => {
      renderField();
      drop([file("a.pdf"), file("b.pdf")]);
      expect(screen.getAllByRole("listitem")).toHaveLength(1);
    });

    it("ignores a drop while disabled", () => {
      renderField({ disabled: true });
      drop([file("a.pdf")]);
      expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
    });
  });

  it("works controlled", async () => {
    const user = userEvent.setup();
    function Harness() {
      const [files, setFiles] = useState<File[]>([file("start.pdf")]);
      return (
        <FormField label="Attachments">
          <FileField
            chooseLabel="Choose"
            formatRejection={formatRejection}
            files={files}
            onFilesChange={setFiles}
          />
        </FormField>
      );
    }
    render(<Harness />);
    expect(screen.getByRole("listitem")).toHaveTextContent("start.pdf");
    await user.click(screen.getByRole("button", { name: "Remove start.pdf" }));
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("announces the chosen files when describeFiles is given", async () => {
    const user = userEvent.setup();
    renderField({ multiple: true, describeFiles: (files) => `${files.length} files chosen` });
    await user.upload(input(), [file("a.pdf"), file("b.pdf")]);
    expect(screen.getByRole("status")).toHaveTextContent("2 files chosen");
  });

  it("takes required, disabled and the error from a FormField", () => {
    render(
      <FormField label="Attachments" hint="PDF only." error="Attach a file." required disabled>
        <FileField chooseLabel="Choose" formatRejection={formatRejection} />
      </FormField>,
    );
    expect(input()).toBeRequired();
    expect(input()).toBeDisabled();
    expect(input()).toBeInvalid();
    expect(input()).toHaveAccessibleDescription("PDF only. Attach a file.");
  });

  it("has no axe violations, empty, with files and with a rejection", async () => {
    const user = userEvent.setup({ applyAccept: false });
    const { container } = renderField({ multiple: true, accept: ".pdf", dropLabel: "or drop files here" });
    expect(await axe(container)).toHaveNoViolations();
    await user.upload(input(), [file("a.pdf"), file("b.png", 1, "image/png")]);
    expect(await axe(container)).toHaveNoViolations();
  });
});
