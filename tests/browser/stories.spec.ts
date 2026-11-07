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
          const header = document.querySelector<HTMLElement>('[data-testid="header"]');
          const transformed = document.querySelector<HTMLElement>('[data-testid="transformed"]');
          const layer = sheet.closest<HTMLElement>('[data-lufia-part="layer"]')!;
          // The sheet is not inside the transformed ancestor, so that ancestor's stacking context cannot trap it.
          const portaled =
            !!transformed && !transformed.contains(layer) && layer.parentElement === document.body;
          const above =
            portaled &&
            Number(getComputedStyle(layer).zIndex) > Number(getComputedStyle(dock).zIndex) &&
            !!header &&
            Number(getComputedStyle(layer).zIndex) > Number(getComputedStyle(header).zIndex);
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

test.describe("page actions breakpoints", () => {
  const root = (page: Page) => page.locator('[data-lufia-part="page-actions"]');

  for (const [width, visible] of [
    [959, false],
    [960, true],
  ] as const) {
    test(`hideBelow="medium" ${visible ? "shows" : "hides"} the row at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await openStory(page, "components-actions-pageactions--hidden-below-medium");
      if (visible) await expect(root(page)).toBeVisible();
      else await expect(root(page)).toBeHidden();
    });

    test(`primaryPlacement="external" ${visible ? "shows" : "hides"} the primary at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await openStory(page, "components-actions-pageactions--external-primary");
      const primary = page.getByRole("button", { name: "New report" });
      if (visible) await expect(primary).toBeVisible();
      else await expect(primary).toBeHidden();
      await expect(page.getByRole("button", { name: "More actions" })).toBeVisible();
    });
  }

  for (const [width, visible] of [
    [767, false],
    [768, true],
  ] as const) {
    test(`secondary actions ${visible ? "stay buttons" : "collapse into the menu"} at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await openStory(page, "components-actions-pageactions--default");
      const share = page.getByRole("button", { name: "Share" });
      if (visible) await expect(share).toBeVisible();
      else await expect(share).toBeHidden();
    });
  }
});

test.describe("page actions container collapse", () => {
  for (const [story, collapsed] of [
    ["container-narrow", true],
    ["container-wide", false],
  ] as const) {
    test(`a ${collapsed ? "49rem" : "51rem"} host ${collapsed ? "collapses" : "keeps"} the secondary actions`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 800 });
      await openStory(page, `components-actions-pageactions--${story}`);
      const share = page.getByRole("button", { name: "Share" });
      const more = page.getByRole("button", { name: "More actions" });
      if (collapsed) await expect(share).toBeHidden();
      else await expect(share).toBeVisible();
      await more.click();
      const item = page.getByRole("menuitem", { name: "Share" });
      if (collapsed) await expect(item).toBeVisible();
      else await expect(item).toBeHidden();
    });
  }

  test("a narrow-only item is listed in the sheet at 390px even in a wide host", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await openStory(page, "components-actions-pageactions--container-wide");
    // The 51rem host keeps the secondary actions as buttons, yet the sheet has left the container and lists them.
    await expect(page.getByRole("button", { name: "Share", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "More actions" }).click();
    await expect(page.getByRole("menuitem", { name: "Share" })).toBeVisible();
  });
});

test.describe("introduction page", () => {
  test.use({ reducedMotion: "no-preference" });

  async function openIntroduction(page: Page) {
    await page.goto("/?path=/docs/introduction--docs");
    const preview = page.frameLocator("#storybook-preview-iframe");
    await expect(preview.getByRole("heading", { level: 1, name: "Lufia Design System" })).toBeVisible();
    return preview;
  }

  test("a pattern card selects its page in the top window, not a 404", async ({ page }) => {
    const preview = await openIntroduction(page);
    await preview.getByRole("link", { name: "Settings form" }).click();
    await expect(page).toHaveURL(/\?path=\/docs\/patterns-settings-form--docs/);
    await expect(
      page.frameLocator("#storybook-preview-iframe").getByRole("heading", { level: 1 }),
    ).toContainText("Settings form");
  });

  test("a component gallery card selects the component docs in the top window", async ({ page }) => {
    const preview = await openIntroduction(page);
    const card = preview.locator('a[href="./?path=/docs/components-actions-button--docs"]').first();
    await card.click();
    await expect(page).toHaveURL(/\?path=\/docs\/components-actions-button--docs/);
  });

  test("Get started scrolls in place and keeps the Storybook chrome", async ({ page }) => {
    const preview = await openIntroduction(page);
    await preview.getByRole("link", { name: "Get started" }).click();
    await expect(page).toHaveURL(/\?path=\/docs\/introduction--docs/);
    await expect(page.locator("#storybook-preview-iframe")).toBeVisible();
    await expect(preview.locator("#quick-start")).toBeInViewport();
  });

  test("hovering a gallery card runs its transition", async ({ page }) => {
    const preview = await openIntroduction(page);
    const card = preview.locator('a[href^="./?path=/docs/components-"]').first();
    await card.scrollIntoViewIfNeeded();
    // Record transitionrun rather than polling getAnimations(): a short transition can finish before the first poll.
    await card.evaluate((element) => {
      element.setAttribute("data-transition-runs", "0");
      element.addEventListener("transitionrun", () => {
        element.setAttribute(
          "data-transition-runs",
          String(Number(element.getAttribute("data-transition-runs")) + 1),
        );
      });
    });
    await card.hover();
    await expect.poll(async () => Number(await card.getAttribute("data-transition-runs"))).toBeGreaterThan(0);
  });
});
