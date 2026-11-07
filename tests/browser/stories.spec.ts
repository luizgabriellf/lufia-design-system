import { expect, test, type Page } from "@playwright/test";

type Theme = "default" | "example-brand";
type Mode = "light" | "dark";

async function openStory(
  page: Page,
  id: string,
  theme: Theme = "default",
  mode: Mode = "light",
): Promise<void> {
  const params = new URLSearchParams({
    id,
    viewMode: "story",
    globals: `theme:${theme};mode:${mode}`,
  });
  await page.goto(`/iframe.html?${params.toString()}`);
  await expect(page.locator("html")).toHaveAttribute("data-lufia-theme", theme);
  await expect(page.locator("html")).toHaveAttribute("data-lufia-mode", mode);
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

test.describe("keyboard interactions", () => {
  test("a modal traps focus, closes on Escape, and restores opener focus", async ({ page }) => {
    await openStory(page, "components-overlays-modal--default");
    const opener = page.getByRole("button", { name: "Open modal" });
    await opener.click();

    const modal = page.getByRole("dialog", { name: "Edit project" });
    await expect(modal).toBeVisible();
    await expect(modal).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(modal.locator(":focus")).toHaveCount(1);
    await page.keyboard.press("Escape");
    await expect(modal).toHaveCount(0);
    await expect(opener).toBeFocused();
  });

  test("Escape dismisses a combobox before its parent modal", async ({ page }) => {
    await openStory(page, "components-forms-combobox--inside-dialog");
    await page.getByRole("button", { name: "Open dialog" }).click();

    const modal = page.getByRole("dialog", { name: "Where do you live?" });
    const combobox = modal.getByRole("combobox");
    await combobox.click();
    await expect(combobox).toHaveAttribute("aria-expanded", "true");

    await page.keyboard.press("Escape");
    await expect(combobox).toHaveAttribute("aria-expanded", "false");
    await expect(modal).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(modal).toHaveCount(0);
  });
});

test.describe("responsive visual captures", () => {
  const widths = [320, 390, 768, 1440] as const;
  const themes: Theme[] = ["default", "example-brand"];
  const modes: Mode[] = ["light", "dark"];

  for (const width of widths) {
    for (const theme of themes) {
      for (const mode of modes) {
        test(`buttons at ${width}px — ${theme}/${mode}`, async ({ page }, testInfo) => {
          await page.setViewportSize({ width, height: 900 });
          await openStory(page, "components-actions-button--all-variants-and-sizes", theme, mode);
          await expect(page.getByRole("button", { name: "primary", exact: true })).toBeVisible();
          const capture = await page.screenshot({ animations: "disabled", caret: "hide" });
          await testInfo.attach(`buttons-${width}-${theme}-${mode}`, {
            body: capture,
            contentType: "image/png",
          });
        });
      }
    }
  }

  for (const width of [320, 1440] as const) {
    for (const theme of themes) {
      for (const mode of modes) {
        test(`open modal at ${width}px — ${theme}/${mode}`, async ({ page }, testInfo) => {
          await page.setViewportSize({ width, height: 900 });
          await openStory(page, "components-overlays-modal--open-by-default", theme, mode);
          await expect(page.getByRole("dialog", { name: "Edit project" })).toBeVisible();
          const capture = await page.screenshot({ animations: "disabled", caret: "hide" });
          await testInfo.attach(`modal-${width}-${theme}-${mode}`, {
            body: capture,
            contentType: "image/png",
          });
        });
      }
    }
  }
});
