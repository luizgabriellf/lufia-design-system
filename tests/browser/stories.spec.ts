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
  test("a modal wraps Tab focus inside, closes on Escape, and restores opener focus", async ({ page }) => {
    await openStory(page, "components-overlays-modal--default");
    const opener = page.getByRole("button", { name: "Open modal" });
    await opener.click();

    const modal = page.getByRole("dialog", { name: "Edit project" });
    await expect(modal).toBeVisible();
    await expect(modal).toBeFocused();

    // The dialog's tab order is: close button, ..., Cancel, Save changes.
    const first = modal.getByRole("button", { name: "Close" });
    const last = modal.getByRole("button", { name: "Save changes" });

    // Shift+Tab from the first focusable wraps to the last one, not out to the page.
    await first.focus();
    await expect(first).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(last).toBeFocused();

    // Tab from the last focusable wraps back to the first.
    await page.keyboard.press("Tab");
    await expect(first).toBeFocused();

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

test.describe("theme and layout", () => {
  const themes: Theme[] = ["default", "example-brand"];

  for (const theme of themes) {
    test(`the modal surface follows the colour mode — ${theme}`, async ({ page }) => {
      const surface = async (mode: Mode): Promise<string> => {
        await openStory(page, "components-overlays-modal--open-by-default", theme, mode);
        const modal = page.getByRole("dialog", { name: "Edit project" });
        await expect(modal).toBeVisible();
        return modal.evaluate((element) => getComputedStyle(element).backgroundColor);
      };
      const light = await surface("light");
      const dark = await surface("dark");
      // A resolved colour, not the transparent default, and different per mode.
      expect(light).not.toBe("rgba(0, 0, 0, 0)");
      expect(dark).not.toBe("rgba(0, 0, 0, 0)");
      expect(light).not.toBe(dark);
    });
  }

  test("the primary action colour follows the theme", async ({ page }) => {
    const primaryColour = async (theme: Theme): Promise<string> => {
      await openStory(page, "components-actions-button--all-variants-and-sizes", theme, "light");
      const primary = page.getByRole("button", { name: "primary", exact: true }).first();
      await expect(primary).toBeVisible();
      return primary.evaluate((element) => getComputedStyle(element).backgroundColor);
    };
    // The example brand overrides the primary action colour.
    expect(await primaryColour("default")).not.toBe(await primaryColour("example-brand"));
  });

  for (const width of [320, 390, 768, 1440] as const) {
    test(`buttons do not overflow horizontally at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await openStory(page, "components-actions-button--all-variants-and-sizes");
      await expect(page.getByRole("button", { name: "primary", exact: true }).first()).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  for (const width of [320, 1440] as const) {
    test(`the open modal fits the viewport at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await openStory(page, "components-overlays-modal--open-by-default");
      const modal = page.getByRole("dialog", { name: "Edit project" });
      await expect(modal).toBeVisible();
      // Poll: the dialog animates in, so measure once it has settled (1px for sub-pixel layout).
      await expect
        .poll(async () => {
          const box = await modal.boundingBox();
          if (!box) return false;
          return box.x >= 0 && box.y >= 0 && box.x + box.width <= width + 1 && box.y + box.height <= 900 + 1;
        })
        .toBe(true);
    });
  }
});

test.describe("page actions sheet", () => {
  test("at 390px the backdrop covers the viewport and the sheet is above a fixed dock", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openStory(page, "components-actions-moreactions--sheet-over-dock");
    const menu = page.getByRole("menu", { name: "More actions" });
    await expect(menu).toBeVisible();
    // Poll: the sheet slides in, so measure once it has settled.
    await expect
      .poll(async () =>
        page.evaluate(() => {
          const backdrop = document.querySelector<HTMLElement>(
            '[data-lufia-part="layer"] > div[aria-hidden="true"]',
          );
          const sheet = document.querySelector<HTMLElement>('[data-lufia-part="sheet"]');
          const dock = document.querySelector<HTMLElement>('[data-testid="dock"]');
          if (!backdrop || !sheet || !dock) return "missing";
          const b = backdrop.getBoundingClientRect();
          const s = sheet.getBoundingClientRect();
          const covers = b.left <= 0 && b.top <= 0 && b.right >= innerWidth && b.bottom >= innerHeight;
          const anchored = Math.abs(s.bottom - innerHeight) <= 1 && s.width >= innerWidth - 1;
          // Painted above the dock: the page behind is inert, so a hit test cannot tell; compare the stacking order instead.
          const above =
            Number(getComputedStyle(sheet.closest<HTMLElement>('[data-lufia-part="layer"]')!).zIndex) >
            Number(getComputedStyle(dock).zIndex);
          return covers && anchored && above ? "ok" : { covers, anchored, above };
        }),
      )
      .toBe("ok");
  });

  test("a long list scrolls inside the sheet and Escape returns focus to the trigger", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openStory(page, "components-actions-moreactions--sheet-many-items");
    const menu = page.getByRole("menu", { name: "More actions" });
    await expect(menu).toBeVisible();
    const metrics = await menu.evaluate((element) => ({
      scrolls: element.scrollHeight > element.clientHeight,
      contain: getComputedStyle(element).overscrollBehaviorY,
    }));
    expect(metrics).toEqual({ scrolls: true, contain: "contain" });
    // The story opens on its own, with nothing focused before it; reopen it from the trigger, as a person would.
    await page.keyboard.press("Escape");
    await expect(menu).toHaveCount(0);
    const trigger = page.getByRole("button", { name: "More actions" });
    await trigger.click();
    await expect(menu).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
});
