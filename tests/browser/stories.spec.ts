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

test.describe("more actions popover", () => {
  for (const [story, side] of [
    ["in-clipping-card-near-bottom", "top"],
    ["in-clipping-card-near-top", "bottom"],
  ] as const) {
    test(`inside an overflow-hidden card the last item is visible and clickable (${side})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await openStory(page, `components-actions-moreactions--${story}`);
      const menu = page.getByRole("menu", { name: "More actions" });
      await expect(menu).toBeVisible();
      const last = menu.getByRole("menuitem", { name: "Delete record" });
      // Poll: the menu fades in, so measure once it has settled.
      await expect
        .poll(async () =>
          page.evaluate(() => {
            const item = [...document.querySelectorAll<HTMLElement>('[role="menuitem"]')].at(-1);
            const menuElement = item?.closest<HTMLElement>('[role="menu"]');
            if (!item || !menuElement) return "missing";
            const box = item.getBoundingClientRect();
            const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
            const inViewport =
              box.top >= 0 && box.bottom <= innerHeight && box.left >= 0 && box.right <= innerWidth;
            const card = document.querySelector('[data-testid="clipping-card"]');
            return {
              hit: !!hit && item.contains(hit),
              inViewport,
              escaped: !!card && !card.contains(menuElement),
              side: menuElement.getAttribute("data-side"),
            };
          }),
        )
        .toEqual({ hit: true, inViewport: true, escaped: true, side });
      await last.click();
      await expect(menu).toHaveCount(0);
      await expect(page.getByRole("button", { name: "More actions" })).toBeFocused();
    });
  }
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
    // Assert the hover end state and a non-zero transition rather than catching the transition mid-flight: polling
    // getAnimations() raced short transitions, and WebKit does not fire transitionrun reliably here.
    const cardStyle = () =>
      card.evaluate((element) => {
        const box = element.closest("li");
        if (box === null) throw new Error("gallery card without a list item");
        const style = getComputedStyle(box);
        return {
          transform: style.transform,
          longestTransition: Math.max(
            ...style.transitionDuration.split(",").map((value) => parseFloat(value)),
          ),
        };
      });
    const before = await cardStyle();
    expect(before.longestTransition).toBeGreaterThan(0);
    await card.hover();
    await expect.poll(async () => (await cardStyle()).transform).not.toBe(before.transform);
  });
});

test.describe("notification center", () => {
  const id = (story: string) => `components-overlays-notificationcenter--${story}`;

  test("at 1440px the bell opens a popover, tabs switch, and Escape returns focus", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openStory(page, id("default"));
    const bell = page.getByRole("button", { name: "Notifications, 5 unread" });
    await expect(bell).toHaveAttribute("aria-expanded", "false");
    await bell.click();
    const dialog = page.getByRole("dialog", { name: "Notifications" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toBeFocused();
    await expect(bell).toHaveAttribute("aria-expanded", "true");
    // The popover hangs from the bell: its right edge lines up with the bell's.
    const fits = await dialog.evaluate((element) => {
      const box = element.getBoundingClientRect();
      return box.left >= 0 && box.right <= innerWidth;
    });
    expect(fits).toBe(true);

    await expect(page.getByRole("tab", { name: /^All/ })).toHaveAttribute("aria-selected", "true");
    await page.getByRole("tab", { name: /^Stock/ }).click();
    await expect(page.getByRole("tab", { name: /^Stock/ })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText("Safety gloves are below the reorder level")).toBeVisible();
    await expect(page.getByText("Supplier proposal needs your review")).toHaveCount(0);

    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(bell).toBeFocused();
  });

  test("at 390px the panel is a sheet above a fixed dock, and Escape returns focus", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openStory(page, id("sheet-over-dock"));
    const dialog = page.getByRole("dialog", { name: "Notifications" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute("aria-modal", "true");
    // Poll: the sheet slides in, so measure once it has settled.
    await expect
      .poll(async () =>
        page.evaluate(() => {
          const layer = document.querySelector<HTMLElement>('[data-lufia-part="notification-layer"]');
          const sheet = document.querySelector<HTMLElement>('[data-lufia-part="notification-sheet"]');
          const dock = document.querySelector<HTMLElement>('[data-testid="dock"]');
          const header = document.querySelector<HTMLElement>('[data-testid="header"]');
          if (!layer || !sheet || !dock || !header) return "missing";
          const s = sheet.getBoundingClientRect();
          const anchored = Math.abs(s.bottom - innerHeight) <= 1 && s.width >= innerWidth - 1;
          const above =
            layer.parentElement === document.body &&
            Number(getComputedStyle(layer).zIndex) > Number(getComputedStyle(dock).zIndex) &&
            Number(getComputedStyle(layer).zIndex) > Number(getComputedStyle(header).zIndex);
          return anchored && above ? "ok" : { anchored, above };
        }),
      )
      .toBe("ok");

    await page.getByRole("tab", { name: /^Agents/ }).click();
    await expect(page.getByRole("tab", { name: /^Agents/ })).toHaveAttribute("aria-selected", "true");
    // The story opens on its own, with nothing focused before it; reopen it from the bell, as a person would.
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    const bell = page.getByRole("button", { name: /^Notifications/ });
    await bell.click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(bell).toBeFocused();
  });

  test("activating a row closes the panel and leaves focus on the bell", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openStory(page, id("default"));
    const bell = page.getByRole("button", { name: /^Notifications/ });
    await bell.click();
    await page.getByRole("link", { name: /Supplier proposal needs your review/ }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(bell).toBeFocused();
  });

  test("the mark-all action never wraps: text at 390px, an icon with the same name at 320px", async ({
    page,
  }) => {
    const measure = async (width: number) => {
      await page.setViewportSize({ width, height: 700 });
      await openStory(page, id(`sheet-phone-${width}`));
      const mark = page.getByRole("button", { name: "Mark all as read" });
      await expect(mark).toBeVisible();
      await page.waitForFunction(() => document.getAnimations().length === 0);
      return mark.evaluate((element) => {
        const box = element.getBoundingClientRect();
        const text = element
          .querySelector<HTMLElement>('span[class*="markAllText"]')!
          .getBoundingClientRect();
        return { width: box.width, height: box.height, textWidth: text.width };
      });
    };
    const wide = await measure(390);
    expect(wide.height).toBeLessThan(40);
    expect(wide.textWidth).toBeGreaterThan(60);
    const narrow = await measure(320);
    expect(narrow.height).toBeLessThan(40);
    expect(narrow.textWidth).toBeLessThanOrEqual(1);
    expect(narrow.width).toBeLessThan(50);
  });

  test("at 320px the tab row fades the edge that hides more tabs", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await openStory(page, id("sheet-phone-320"));
    const tabs = page.getByRole("tablist");
    await expect(tabs).toHaveAttribute("data-more", "end");
    await tabs.evaluate((element) => {
      element.scrollLeft = element.scrollWidth;
    });
    await expect(tabs).toHaveAttribute("data-more", "start");
  });

  test("a long list scrolls inside the panel while the footer stays put", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openStory(page, id("many-items"));
    const scroller = page.locator('[data-lufia-part="notification-panel"] > div').nth(1);
    const footer = page.getByRole("link", { name: "Notification settings" });
    // The footer rises in with the rest of the first view: measure once every entrance has finished.
    await page.waitForFunction(() => document.getAnimations().length === 0);
    const before = await footer.boundingBox();
    await scroller.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    const after = await footer.boundingBox();
    // Poll-free: the panel is still settling its entrance scale, so allow a sub-pixel difference.
    expect(Math.abs((after?.y ?? 0) - (before?.y ?? 0))).toBeLessThan(1);
    expect(await scroller.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  });

  test("the panel animates in, and not at all under reduced motion", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const animationName = async (reducedMotion: "no-preference" | "reduce") => {
      await page.emulateMedia({ reducedMotion });
      await openStory(page, id("default"));
      await page.getByRole("button", { name: /^Notifications/ }).click();
      const dialog = page.getByRole("dialog", { name: "Notifications" });
      await expect(dialog).toBeVisible();
      return dialog.evaluate((element) => getComputedStyle(element).animationName);
    };
    expect(await animationName("no-preference")).toContain("popover-in");
    expect(await animationName("reduce")).toBe("none");
  });

  test("marking everything read fades the dots and keeps the bell's count in step", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openStory(page, id("interactive"));
    await page.getByRole("button", { name: "Notifications, 5 unread" }).click();
    await page.getByRole("button", { name: "Mark all as read" }).click();
    await expect(page.getByRole("button", { name: "Notifications", exact: true })).toBeVisible();
    await expect(page.locator('[data-lufia-part="notification-panel"] [data-on]')).toHaveCount(0);
  });
});

test.describe("badge", () => {
  test("a badge in a squeezed table column keeps its word on one line", async ({ page }) => {
    await openStory(page, "components-data-display-badge--in-narrow-table-cell");
    const lines = await page.getByTestId("badge-cell").evaluate((cell) => {
      const walker = cell.ownerDocument.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node !== null && node.textContent?.trim() !== "Active") node = walker.nextNode();
      if (node === null) throw new Error("badge text not found");
      const range = cell.ownerDocument.createRange();
      range.selectNodeContents(node);
      return new Set([...range.getClientRects()].map((rect) => Math.round(rect.top))).size;
    });
    expect(lines).toBe(1);
  });
});
