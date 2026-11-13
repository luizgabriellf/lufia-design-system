import { createRequire } from "node:module";
import { expect, test, type Page } from "@playwright/test";

const axePath = createRequire(import.meta.url).resolve("axe-core/axe.min.js");

/**
 * Runs axe-core on one element of the story and returns its violations as "id: count". Storybook's a11y addon runs its
 * own axe in the same frame after every render, and axe refuses a second run while one is in flight ("Axe is already
 * running"), which made these checks flaky in WebKit. This waits for that run to finish by retrying on that one error.
 */
async function runAxe(
  page: Page,
  selector: string,
  options: Record<string, unknown> = {},
): Promise<string[]> {
  await page.addScriptTag({ path: axePath });
  const deadline = Date.now() + 15_000;
  for (;;) {
    const outcome = await page.evaluate(
      async ({ selector, options }) => {
        const axe = (
          window as unknown as {
            axe: { run: (...args: unknown[]) => Promise<{ violations: { id: string; nodes: unknown[] }[] }> };
          }
        ).axe;
        try {
          const result = await axe.run(document.querySelector(selector), options);
          return {
            violations: result.violations.map((violation) => `${violation.id}: ${violation.nodes.length}`),
          };
        } catch (error) {
          return { error: error instanceof Error ? error.message : String(error) };
        }
      },
      { selector, options },
    );
    if (outcome.violations) return outcome.violations;
    const message = outcome.error ?? "axe returned no result";
    if (!/already running/i.test(message) || Date.now() > deadline) throw new Error(message);
    await page.waitForTimeout(200);
  }
}

type Theme = "default" | "example-brand";
type Mode = "light" | "dark";

async function openStory(
  page: Page,
  id: string,
  theme: Theme = "default",
  mode: Mode = "light",
  dir: "ltr" | "rtl" = "ltr",
): Promise<void> {
  const params = new URLSearchParams({
    id,
    viewMode: "story",
    globals: `theme:${theme};mode:${mode};dir:${dir}`,
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

test.describe("right-to-left", () => {
  // The connector line of a timeline node is placed with `inset-inline-start`, so it must sit on the opposite physical side.
  const connectorOffsets = (page: Page) =>
    page
      .locator("li[data-state]")
      .first()
      .evaluate((node) => {
        const style = getComputedStyle(node, "::after");
        return { left: parseFloat(style.left), right: parseFloat(style.right) };
      });

  test("the status timeline connector mirrors under dir=rtl", async ({ page }) => {
    await openStory(page, "components-data-display-statustimeline--default");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    const ltr = await connectorOffsets(page);
    expect(ltr.left).toBeLessThan(ltr.right);

    await openStory(page, "components-data-display-statustimeline--default", "default", "light", "rtl");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    const rtl = await connectorOffsets(page);
    expect(rtl.right).toBeLessThan(rtl.left);
  });
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

test.describe("more actions container scope", () => {
  test("in a narrow host on a wide page the narrow-only item is visible, focused and clickable on first open", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 800 });
    await openStory(page, "components-actions-moreactions--container-scope-narrow-host");
    const trigger = page.getByRole("button", { name: "More actions" });
    await trigger.focus();
    await page.keyboard.press("ArrowDown");
    const menu = page.getByRole("menu", { name: "More actions" });
    const share = menu.getByRole("menuitem", { name: "Share" });
    await expect(share).toBeVisible();
    await expect(share).toBeFocused();
    await expect
      .poll(async () =>
        share.evaluate((item) => {
          const box = item.getBoundingClientRect();
          const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
          return !!hit && item.contains(hit);
        }),
      )
      .toBe(true);
    await share.click();
    await expect(menu).toHaveCount(0);
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
        return { width: box.width, height: box.height, textWidth: text.width, textHeight: text.height };
      });
    };
    const wide = await measure(390);
    // The button is finger-sized here (44px); one line of text is what proves it did not wrap.
    expect(wide.height).toBeLessThanOrEqual(44);
    expect(wide.textHeight).toBeLessThan(24);
    expect(wide.textWidth).toBeGreaterThan(60);
    const narrow = await measure(320);
    expect(narrow.height).toBeLessThanOrEqual(44);
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

test.describe("stat tile as filters", () => {
  test("clicking a tile moves aria-pressed and the selected look", async ({ page }) => {
    await openStory(page, "components-data-display-stattile--as-filters");
    const open = page.getByRole("button", { name: "Open items" });
    const overdue = page.getByRole("button", { name: "Overdue" });
    const look = (tile: typeof open) =>
      tile.evaluate((button) => {
        const root = button.closest("[data-interactive]")!;
        const style = getComputedStyle(root);
        return { border: style.borderTopColor, background: style.backgroundColor, shadow: style.boxShadow };
      });

    await expect(open).toHaveAttribute("aria-pressed", "true");
    await expect(overdue).toHaveAttribute("aria-pressed", "false");
    const pressedLook = await look(open);
    const idleLook = await look(overdue);
    expect(pressedLook.background).not.toBe(idleLook.background);
    expect(pressedLook.shadow).not.toBe("none");

    await overdue.click();
    await page.mouse.move(0, 0);
    await expect(overdue).toHaveAttribute("aria-pressed", "true");
    await expect(open).toHaveAttribute("aria-pressed", "false");
    await expect.poll(async () => (await look(overdue)).shadow).not.toBe("none");
    // Both tiles transition their background; poll so the read is not taken mid-transition.
    await expect
      .poll(async () => (await look(open)).background !== (await look(overdue)).background)
      .toBe(true);
  });
});

test.describe("stat tile calm grid", () => {
  for (const mode of ["light", "dark"] as const) {
    test(`figures sit on one line, tones keep the plain card, and a zero stays readable (${mode})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1024, height: 700 });
      await openStory(page, "components-data-display-stattile--calm-grid", "default", mode);
      const tiles = page.locator("[data-tone]");
      await expect(tiles).toHaveCount(4);
      const facts = await tiles.evaluateAll((roots) =>
        roots.map((root) => {
          const value = root.querySelector('[id$="-value"]')!;
          return {
            top: Math.round(value.getBoundingClientRect().top),
            background: getComputedStyle(root).backgroundColor,
            valueColor: getComputedStyle(value).color,
          };
        }),
      );
      expect(new Set(facts.map((fact) => fact.top)).size).toBe(1);
      expect(new Set(facts.map((fact) => fact.background)).size).toBe(1);
      expect(facts[3]!.valueColor).not.toBe(facts[0]!.valueColor);
      expect(await runAxe(page, "#storybook-root")).toEqual([]);
    });
  }

  test("a long uppercase word in a narrow tile hyphenates inside the tile", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await openStory(page, "components-data-display-stattile--narrow-labels-phone-320");
    const overflow = await page
      .locator('[class*="label"]')
      .evaluateAll((labels) => labels.map((label) => label.scrollWidth - label.clientWidth));
    expect(overflow.every((extra) => extra <= 0)).toBe(true);
  });
});

test.describe("segmented toggle status picker", () => {
  for (const [theme, mode] of [
    ["default", "light"],
    ["default", "dark"],
    ["example-brand", "light"],
    ["example-brand", "dark"],
  ] as const) {
    test(`an unset row shows no checked radio or indicator, and a tone colours the chosen one (${theme}, ${mode})`, async ({
      page,
    }) => {
      await openStory(page, "components-forms-segmentedtoggle--status-picker", theme, mode);
      const rows = page.getByTestId("status-row");
      const unset = rows.nth(1);
      await expect(unset.getByRole("radio", { checked: true })).toHaveCount(0);
      await expect(unset.locator('[class*="indicator"]')).toBeHidden();

      const indicatorBackground = (row: typeof unset) =>
        row.locator('[class*="indicator"]').evaluate((el) => getComputedStyle(el).backgroundColor);
      const passBackground = await indicatorBackground(rows.nth(0));

      await unset.getByRole("radio", { name: "Fail" }).click();
      await expect(unset.getByRole("radio", { name: "Fail" })).toBeChecked();
      await expect(unset.locator('[class*="indicator"]')).toBeVisible();
      expect(await indicatorBackground(unset)).not.toBe(passBackground);

      await unset.getByRole("radio", { name: "Fail" }).click();
      await expect(unset.getByRole("radio", { checked: true })).toHaveCount(0);
    });
  }
});

test.describe("command palette server search", () => {
  test("shows the searching row while loading and keeps the arrows working beside a notice", async ({
    page,
  }) => {
    await openStory(page, "components-overlays-commandpalette--server-search-with-status");
    const field = page.getByRole("combobox", { name: "Search or run a command" });
    await field.fill("ab");
    await expect(page.locator("[data-loading-row]")).toBeVisible();
    await expect(page.locator("[data-loading-row]")).toHaveText("Searching…");
    await expect(page.locator("[data-loading-row]")).toBeHidden({ timeout: 5000 });

    await field.fill("fail");
    await expect(page.getByRole("alert")).toContainText("Search is unavailable", { timeout: 5000 });
    const options = page.getByRole("option");
    await expect(options.first()).toHaveAttribute("aria-selected", "true");
    await field.press("ArrowDown");
    await expect(options.nth(1)).toHaveAttribute("aria-selected", "true");
    await expect(options.first()).toHaveAttribute("aria-selected", "false");
  });
});

test.describe("app shell navigation", () => {
  for (const mode of ["light", "dark"] as const) {
    test(`success badges and counts pass axe colour contrast (${mode})`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openStory(page, "components-navigation-appshell--counts-and-badges", "default", mode);
      const nav = page.getByRole("navigation", { name: "Main navigation" });
      await expect(nav.getByText("Healthy")).toHaveAttribute("data-tone", "success");
      await expect(nav.getByText("12", { exact: true })).toHaveAttribute("data-tone", "success");
      const violations = await runAxe(page, "nav", { runOnly: ["color-contrast"] });
      expect(violations).toEqual([]);
    });
  }

  test("on a short page at 390px the shell paints down to the bottom of the viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openStory(page, "components-navigation-appshell--phone-short-page");
    await expect(page.getByText("Nothing else on this page.")).toBeVisible();
    const { bottom, viewport } = await page
      .locator("header")
      .first()
      .evaluate((header) => ({
        bottom: header.parentElement!.getBoundingClientRect().bottom,
        viewport: window.innerHeight,
      }));
    expect(bottom).toBeGreaterThanOrEqual(viewport);
  });

  test("sub-items: one aria-current page, keyboard order, and query sections", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openStory(page, "components-navigation-appshell--nested-navigation");
    const nav = page.getByRole("navigation", { name: "Main navigation" });
    const roles = nav.getByRole("link", { name: "Roles" });
    await expect(roles).toHaveAttribute("aria-current", "page");
    await expect(nav.locator("[aria-current]")).toHaveCount(1);
    await expect(nav.getByRole("link", { name: "Administration" })).toHaveAttribute("data-branch");
    // The folded branch is out of the tab order.
    await expect(nav.getByRole("link", { name: "Archived" })).toBeHidden();

    await roles.focus();
    await page.keyboard.press("Tab");
    await expect(nav.getByRole("link", { name: /Audit log/ })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(nav.getByRole("link", { name: /Audit log/ })).toHaveAttribute("aria-current", "page");
    await expect(nav.locator("[aria-current]")).toHaveCount(1);

    await nav.getByRole("link", { name: "Teams" }).click();
    await expect(nav.getByRole("link", { name: "Archived" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "People" })).toBeHidden();
  });

  test("sub-items in the rail: hidden, and their item is current within the set", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openStory(page, "components-navigation-appshell--nested-navigation-rail");
    const nav = page.getByRole("navigation", { name: "Main navigation" });
    await expect(nav.getByRole("link", { name: "Roles" })).toHaveCount(0);
    const admin = nav.getByRole("link", { name: "Administration" });
    await expect(admin).toHaveAttribute("aria-current", "true");
    await expect(admin).toHaveAttribute("data-active");
  });
});

test.describe("icons", () => {
  for (const mode of ["light", "dark"] as const) {
    test(`the icon gallery passes axe and every glyph sits centred on the grid (${mode})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openStory(page, "components-utilities-icon--gallery", "default", mode);
      const icons = page.locator("svg[data-lufia-icon]");
      expect(await icons.count()).toBeGreaterThan(40);
      // The centre of each drawing's bounding box stays within 1.5 units of the grid centre (12, 12).
      const offCentre = await icons.evaluateAll((nodes) =>
        nodes
          .map((node) => {
            const box = (node as SVGSVGElement).getBBox();
            const dx = box.x + box.width / 2 - 12;
            const dy = box.y + box.height / 2 - 12;
            return { name: node.getAttribute("data-lufia-icon"), off: Math.hypot(dx, dy) };
          })
          .filter((icon) => icon.off > 1.5),
      );
      expect(offCentre).toEqual([]);
      const violations = await runAxe(page, "#storybook-root");
      expect(violations).toEqual([]);
    });
  }

  test("the size tokens render 16, 20 and 24px with the stroke tokens", async ({ page }) => {
    await openStory(page, "components-utilities-icon--sizes");
    const measure = (size: string) =>
      page
        .locator(`svg[data-size="${size}"]`)
        .first()
        .evaluate((node) => {
          const style = getComputedStyle(node);
          return { width: node.getBoundingClientRect().width, stroke: style.strokeWidth };
        });
    expect(await measure("sm")).toEqual({ width: 16, stroke: "2px" });
    expect(await measure("md")).toEqual({ width: 20, stroke: "1.75px" });
    expect(await measure("lg")).toEqual({ width: 24, stroke: "1.75px" });
  });

  for (const mode of ["light", "dark"] as const) {
    test(`status icons pass axe in every tone and variant (${mode})`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 900 });
      await openStory(page, "components-feedback-statusicon--tones", "default", mode);
      await expect(page.locator("[data-variant='ring']")).toHaveCount(7);
      const violations = await runAxe(page, "#storybook-root");
      expect(violations).toEqual([]);
    });
  }

  test("a stepper scrolled under a modal's sticky header stays under it", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 700 });
    await openStory(page, "components-navigation-stepper--in-scrolled-modal");
    const header = page.locator('[data-lufia-part="header"]');
    await expect(header).toBeVisible();
    const panel = page.locator('[data-lufia-part="panel"]');
    // Scroll so the step dots sit right under the header, whatever the play function managed.
    await panel.evaluate((node) => {
      const head = node.querySelector('[data-lufia-part="header"]')!.getBoundingClientRect();
      const dot = node.querySelector(
        '[data-testid="stepper-in-modal"] ol li span, [data-testid="stepper-in-modal"] ol li button',
      )!;
      node.scrollTop += dot.getBoundingClientRect().top - head.top - 4;
    });
    const covered = await page.evaluate(() => {
      const head = document.querySelector('[data-lufia-part="header"]')!.getBoundingClientRect();
      const dots = Array.from(
        document.querySelectorAll('[data-testid="stepper-in-modal"] ol li > :first-child'),
      ).map((dot) => dot.getBoundingClientRect());
      const under = dots.filter((rect) => rect.top < head.bottom && rect.bottom > head.top);
      return {
        count: under.length,
        inHeader: under.every((rect) => {
          const y = Math.min(Math.max(rect.top + 4, head.top + 1), head.bottom - 1);
          const hit = document.elementFromPoint(rect.left + rect.width / 2, y);
          return Boolean(hit?.closest('[data-lufia-part="header"]'));
        }),
      };
    });
    expect(covered.count).toBeGreaterThan(0);
    expect(covered.inHeader).toBe(true);
  });

  test("the phone sheet takes the dark mode of a scoped wrapper", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await openStory(page, "components-navigation-appshell--sheet-in-scoped-dark-mode");
    const layer = page.locator('[data-lufia-part="nav-sheet-layer"]');
    await expect(layer).toHaveAttribute("data-lufia-mode", "dark");
    await expect(layer).toHaveAttribute("data-demo", "scoped-sheet");
    const luminance = await page.locator('[data-lufia-part="nav-sheet"]').evaluate((node) => {
      const [r, g, b] = getComputedStyle(node)
        .backgroundColor.match(/[\d.]+/g)!
        .map(Number);
      return (0.2126 * r! + 0.7152 * g! + 0.0722 * b!) / 255;
    });
    expect(luminance).toBeLessThan(0.3);
  });
});

test.describe("docs pages", () => {
  for (const width of [390, 1440]) {
    test(`the code bar sits below the canvas and the copy button below the code at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/iframe.html?viewMode=docs&id=components-data-display-badge--docs");
      const preview = page.locator(".sbdocs-preview").first();
      const actions = page.locator(".sbdocs-preview-actions").first();
      await expect(actions).toBeVisible();
      const p = (await preview.boundingBox())!;
      const a = (await actions.boundingBox())!;
      expect(a.y).toBeGreaterThanOrEqual(p.y + p.height - 1);
      // The bar is the canvas's footer: exactly as wide as the frame above it.
      expect(Math.abs(a.x - p.x)).toBeLessThanOrEqual(1);
      expect(Math.abs(a.x + a.width - (p.x + p.width))).toBeLessThanOrEqual(1);

      const source = page.locator(".sbdocs-content .docblock-source").first();
      const s = (await source.boundingBox())!;
      const code = (await source.locator("[data-radix-scroll-area-viewport]").boundingBox())!;
      const copy = (await source.getByRole("button", { name: /copy/i }).boundingBox())!;
      // Below the code on a phone, beside it when the block is wide: never on top of it.
      const overlaps =
        copy.x < code.x + code.width - 1 &&
        copy.x + copy.width > code.x + 1 &&
        copy.y < code.y + code.height - 1 &&
        copy.y + copy.height > code.y + 1;
      expect(overlaps).toBe(false);
      expect(copy.x + copy.width).toBeLessThanOrEqual(s.x + s.width - 4);
      expect(copy.y + copy.height).toBeLessThanOrEqual(s.y + s.height - 4);
    });
  }
});

test.describe("route progress from code", () => {
  test("startRouteProgress shows the bar and doneRouteProgress ends it, alongside routePending", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openStory(page, "components-navigation-appshell--route-progress-from-code");
    const bar = page.locator("[data-route-progress]");
    await page.getByRole("button", { name: "startRouteProgress()" }).click();
    await expect(bar).toBeVisible();
    await page.getByRole("button", { name: "doneRouteProgress()" }).click();
    await expect(bar).toHaveCount(0);

    // Code and routePending together: the bar stays until both are done.
    await page.getByRole("button", { name: "startRouteProgress()" }).click();
    await page.getByRole("button", { name: "routePending: off" }).click();
    await expect(bar).toBeVisible();
    await page.getByRole("button", { name: "doneRouteProgress()" }).click();
    await page.waitForTimeout(400);
    await expect(bar).toBeVisible();
    await page.getByRole("button", { name: "routePending: on" }).click();
    await expect(bar).toHaveCount(0);
  });
});

test.describe("shell primary action", () => {
  test("the palette lists the page's registered action with its description", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openStory(page, "components-navigation-appshell--primary-action-in-palette");
    await expect(page.getByRole("main").getByRole("button", { name: "New order" })).toBeVisible();
    await page.getByRole("button", { name: "Open the palette" }).click();
    const option = page.getByRole("option", { name: /New order/ });
    await expect(option).toBeVisible();
    await expect(option).toContainText("Start an order for a customer");
  });

  test("an owner mark keeps the shell's default hidden on the phone bar, its place kept", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openStory(page, "components-navigation-appshell--primary-action-owner-mark");
    const bar = page.getByRole("group", { name: "Quick navigation" });
    const fallback = bar.locator("[data-fallback]");
    await expect(fallback).toHaveCount(1);
    await expect(fallback).toBeHidden();
    await expect(fallback).toHaveCSS("visibility", "hidden");
    await expect(bar.getByRole("button", { name: "Menu" })).toBeVisible();
  });
});

test.describe("nav sheet drag threshold", () => {
  test("a custom minimum keeps the sheet open on a short drag and closes it on a long one", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openStory(page, "components-navigation-appshell-navsheet--custom-drag-threshold");
    const sheet = page.getByRole("dialog", { name: "Menu" });
    await expect(sheet).toBeVisible();
    // Let the sheet finish rising, so the grabber is where the pointer goes.
    await sheet.evaluate((element) =>
      Promise.all(element.getAnimations({ subtree: true }).map((animation) => animation.finished)),
    );
    const grabber = sheet.locator("[data-swipe]");
    const box = (await grabber.boundingBox())!;
    const x = box.x + box.width / 2;
    const y = box.y + 8;
    const drag = async (distance: number) => {
      await page.mouse.move(x, y);
      await page.mouse.down();
      for (let step = 1; step <= 10; step += 1) {
        await page.mouse.move(x, y + (distance * step) / 10);
        await page.waitForTimeout(30);
      }
      await page.waitForTimeout(120);
      await page.mouse.up();
    };
    // 90px would pass the default 64px floor; the story asks for at least 96.
    await drag(90);
    await expect(sheet).toBeVisible();
    await expect(sheet).not.toHaveAttribute("data-dragging");
    // Let it spring back before the next drag.
    await page.waitForTimeout(400);
    await drag(260);
    await expect(sheet).toHaveCount(0);
  });
});

test.describe("modal footer stack breakpoint", () => {
  test('footerStackAt="sheet" stacks at 540px where the default stack is still a row', async ({ page }) => {
    await page.setViewportSize({ width: 540, height: 800 });
    await openStory(page, "components-overlays-modal--sheet-footer-stacked");
    const footer = page.locator("[data-lufia-part='footer']");
    await expect(footer).toHaveCSS("flex-direction", "column-reverse");
    await openStory(page, "components-overlays-modal--phone-footer-stacked");
    await expect(page.locator("[data-lufia-part='footer']")).not.toHaveCSS(
      "flex-direction",
      "column-reverse",
    );
    await page.setViewportSize({ width: 390, height: 800 });
    await expect(page.locator("[data-lufia-part='footer']")).toHaveCSS("flex-direction", "column-reverse");
  });
});

test.describe("command palette two-step Escape", () => {
  test("the first Escape clears the text, the second closes", async ({ page }) => {
    await openStory(page, "components-overlays-commandpalette--escape-clears-query");
    const field = page.getByRole("combobox", { name: "Search or run a command" });
    await field.fill("set");
    await page.keyboard.press("Escape");
    await expect(field).toHaveValue("");
    await expect(field).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
});

test.describe("file field preview", () => {
  test("chosen images get a loaded, decorative thumbnail; other files do not", async ({ page }) => {
    await openStory(page, "components-forms-filefield--with-preview");
    const thumbs = page.locator("[data-lufia-part='preview']");
    await expect(thumbs).toHaveCount(2);
    await expect
      .poll(() => thumbs.first().evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth))
      .toBeGreaterThan(0);
    await expect(thumbs.first()).toHaveAttribute("alt", "");
    await page.getByRole("button", { name: "Remove entrance-before.svg" }).click();
    await expect(thumbs).toHaveCount(1);
  });
});

test.describe("combobox result cap", () => {
  test("shows only maxResults matches and narrows with the custom filter", async ({ page }) => {
    await openStory(page, "components-forms-combobox--capped-results");
    const box = page.getByRole("combobox", { name: "Site" });
    await expect(page.getByRole("option")).toHaveCount(8);
    await box.fill("west");
    await expect(page.getByRole("option")).toHaveCount(8);
    await expect(page.getByRole("option").first()).toContainText("West");
    await box.fill("site 12");
    // Site 12 and Site 120: under the cap, so both show.
    await expect(page.getByRole("option")).toHaveCount(2);
  });
});

test.describe("skeleton blocks", () => {
  const stories = [
    "components-feedback-skeletontable--widths",
    "components-feedback-skeletoncard--widths",
    "components-feedback-skeletonpageheader--widths",
  ];
  for (const width of [320, 390, 1440]) {
    test(`nothing overflows its container at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const id of stories) {
        await openStory(page, id);
        const hosts = page.locator("[data-skeleton-host]");
        expect(await hosts.count(), id).toBeGreaterThan(0);
        const overflow = await hosts.evaluateAll((nodes) =>
          nodes.flatMap((host, index) => {
            const box = host.getBoundingClientRect();
            return Array.from(host.querySelectorAll("*"))
              .map((node) => node.getBoundingClientRect())
              .filter(
                (rect) => rect.width > 0 && (rect.left < box.left - 0.5 || rect.right > box.right + 0.5),
              )
              .map(
                (rect) =>
                  `host ${index}: ${rect.left.toFixed(1)}-${rect.right.toFixed(1)} outside ${box.left}-${box.right}`,
              );
          }),
        );
        expect(overflow, id).toEqual([]);
        const scroll = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(scroll, id).toBeLessThanOrEqual(0);
      }
    });
  }

  test("a table keeps its columns when wide and stacks them when narrow", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openStory(page, "components-feedback-skeletontable--widths");
    const lefts = (host: number) =>
      page
        .locator("[data-skeleton-host]")
        .nth(host)
        .evaluate((node) =>
          Array.from(node.querySelector("[data-columns] > *")!.children).map((cell) =>
            Math.round(cell.getBoundingClientRect().left),
          ),
        );
    // Host 1 is 20rem wide (stacked), host 3 is 60rem (four columns).
    expect(new Set(await lefts(1)).size).toBe(1);
    expect(new Set(await lefts(3)).size).toBe(4);
  });

  for (const mode of ["light", "dark"] as const) {
    test(`skeleton blocks pass axe and use the skeleton tokens (${mode})`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 900 });
      await openStory(page, "components-feedback-skeletoncard--widths", "default", mode);
      expect(await runAxe(page, "#storybook-root")).toEqual([]);
      const fill = await page
        .locator("[data-variant='text']")
        .first()
        .evaluate((node) => ({
          background: getComputedStyle(node).backgroundColor,
          token: getComputedStyle(node).getPropertyValue("--lufia-skeleton-bg").trim(),
        }));
      expect(fill.token).not.toBe("");
      expect(fill.background).not.toBe("rgba(0, 0, 0, 0)");
    });
  }
});

test.describe("shell follow-ups", () => {
  /**
   * Simulates a stylesheet order the shell does not control (a dev server's chunk order): the existing sheets are put in
   * reverse order, then a sheet that loads last gives every class of the element its component's own `display`, at one
   * class of specificity. The shell's hiding rules must still win.
   */
  async function loadCssInReverseThenLate(page: Page, selector: string, display: string) {
    await page.evaluate(
      ({ selector, display }) => {
        const sheets = Array.from(document.head.querySelectorAll('style, link[rel="stylesheet"]'));
        for (const sheet of sheets.reverse()) document.head.append(sheet);
        const element = document.querySelector(selector)!;
        const late = document.createElement("style");
        late.textContent = Array.from(element.classList)
          .map((name) => `.${CSS.escape(name)} { display: ${display}; }`)
          .join("\n");
        document.head.append(late);
      },
      { selector, display },
    );
  }

  test("the floating bar stays hidden on wide screens whatever the stylesheet order", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openStory(page, "components-navigation-appshell--desktop");
    const bar = page.locator('[role="group"][aria-label="Quick navigation"]');
    await expect(bar).toBeHidden();
    await loadCssInReverseThenLate(page, '[role="group"][aria-label="Quick navigation"]', "flex");
    await expect(bar).toBeHidden();
    await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
  });

  test("the primary action slot stays hidden on phones whatever the stylesheet order", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openStory(page, "components-navigation-appshell--touch-sizes");
    const slot = page.locator("main [data-touch]");
    await expect(slot).toHaveCount(1);
    await expect(slot).toBeHidden();
    await loadCssInReverseThenLate(page, "main [data-touch]", "inline-flex");
    await expect(slot).toBeHidden();
    await expect(page.getByRole("group", { name: "Quick navigation" })).toBeVisible();
  });

  test("the touch-sized slot is 44px tall and items take the height token", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openStory(page, "components-navigation-appshell--touch-sizes");
    const slot = page.getByRole("main").getByRole("button", { name: "New item" });
    expect((await slot.boundingBox())!.height).toBeCloseTo(44, 0);
    const item = page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "People" });
    expect((await item.boundingBox())!.height).toBeCloseTo(48, 0);
  });

  test("at 1280 by 480 a tall footer scrolls on its own and the navigation keeps its height", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 480 });
    await openStory(page, "components-navigation-appshell--tall-footer-short-window");
    const nav = page.getByRole("navigation", { name: "Main navigation" });
    const footer = page.getByRole("group", { name: "Account and help" }).first();
    const sizes = await footer.evaluate((element) => {
      const foot = element.parentElement!;
      const sidebar = foot.parentElement!;
      return {
        foot: foot.getBoundingClientRect().height,
        scrolls: foot.scrollHeight > foot.clientHeight,
        sidebar: sidebar.getBoundingClientRect().height,
      };
    });
    expect(sizes.scrolls).toBe(true);
    expect(sizes.foot).toBeLessThanOrEqual(sizes.sidebar * 0.4 + 1);
    expect((await nav.boundingBox())!.height).toBeGreaterThan(120);
    await expect(nav.getByRole("link", { name: "Overview" })).toBeInViewport();
    // The last footer link is reachable by scrolling the footer, and focus scrolls it into view.
    const signOut = page.getByRole("button", { name: "Sign out" });
    await signOut.focus();
    await expect(signOut).toBeInViewport();
  });

  test("a closed group holding the current page stands in for it", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openStory(page, "components-navigation-appshell--closed-group-holds-current-page");
    const group = page.getByRole("button", { name: "Insights" });
    await expect(group).toHaveAttribute("aria-expanded", "false");
    await expect(group).toHaveAttribute("aria-current", "true");
    await expect(group).toHaveAttribute("data-active");
    await group.click();
    await expect(group).not.toHaveAttribute("aria-current");
    await expect(page.getByRole("link", { name: "Trends" })).toHaveAttribute("aria-current", "page");
  });

  test("the menu button and the sheet's close button take their own names", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openStory(page, "components-navigation-appshell--distinct-menu-names");
    await page.getByRole("button", { name: "Open menu" }).click();
    const sheet = page.getByRole("dialog", { name: "Menu" });
    await expect(sheet).toBeVisible();
    await sheet.getByRole("button", { name: "Close menu" }).click();
    await expect(sheet).toHaveCount(0);
  });

  test("a link that changes only the query starts the bar, and the address changing ends it", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openStory(page, "components-navigation-appshell--route-progress-for-query-links");
    const bar = page.locator("[data-route-progress]");
    await page.getByRole("link", { name: "Page 2" }).click();
    await expect(bar).toBeVisible();
    await expect(page.getByRole("heading", { name: "Results, page 2" })).toBeVisible({ timeout: 5_000 });
    await expect(bar).toHaveCount(0);
  });

  test("a drag that starts on the header's brand link dismisses the sheet; a tap follows the link", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openStory(page, "components-navigation-appshell-navsheet--drag-from-brand-link");
    const sheet = page.getByRole("dialog", { name: "Menu" });
    await expect(sheet).toBeVisible();
    await sheet.evaluate((element) =>
      Promise.all(element.getAnimations({ subtree: true }).map((animation) => animation.finished)),
    );
    const brand = sheet.getByRole("link", { name: "Acme Cloud" });
    const box = (await brand.boundingBox())!;
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    for (let step = 1; step <= 10; step += 1) {
      await page.mouse.move(x, y + 26 * step);
      await page.waitForTimeout(30);
    }
    await page.waitForTimeout(120);
    await page.mouse.up();
    await expect(sheet).toHaveCount(0);
    await expect(page.locator("[data-followed]")).toHaveAttribute("data-followed", "0");

    await page.getByRole("button", { name: "Open the menu" }).click();
    await expect(sheet).toBeVisible();
    await sheet.getByRole("link", { name: "Acme Cloud" }).click();
    await expect(page.locator("[data-followed]")).toHaveAttribute("data-followed", "1");
    await expect(sheet).toBeVisible();
  });

  test("the palette returns focus to the field after a keepOpen pick, and Enter submits the answer's query", async ({
    page,
  }) => {
    await openStory(page, "components-overlays-commandpalette--submit-while-answering");
    const field = page.getByRole("combobox", { name: "Search or run a command" });
    await page.getByRole("option", { name: /Ask a question/ }).click();
    await expect(field).toBeFocused();
    await page.keyboard.type("what changed");
    await page.keyboard.press("Enter");
    await expect(page.getByText("Asked: what changed")).toBeVisible();
    await expect(page.getByRole("dialog", { name: "Search or run a command" })).toBeVisible();
  });

  test("the palette carries className and data-* on its portalled layer", async ({ page }) => {
    await openStory(page, "components-overlays-commandpalette--scoped-layer");
    const layer = page.locator('[data-lufia-part="command-palette-layer"]');
    await expect(layer).toHaveClass(/app-palette/);
    await expect(layer).toHaveAttribute("data-tour", "palette");
    await expect(layer).toHaveAttribute("data-lufia-mode", "dark");
  });

  test("releasing the scroll lock restores the scroll at once under scroll-behavior: smooth", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openStory(page, "hooks-usebodyscrolllock--document-scroll");
    await page.evaluate(() => {
      const spacer = document.createElement("div");
      spacer.style.blockSize = "4000px";
      document.body.append(spacer);
      document.documentElement.style.scrollBehavior = "smooth";
      window.scrollTo({ top: 600, behavior: "instant" });
    });
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(600);
    // Dispatched clicks: a real click would scroll the button into view first.
    await page.getByRole("button", { name: "Open overlay" }).dispatchEvent("click");
    await expect(page.getByRole("dialog", { name: "Demo overlay" })).toBeVisible();
    await page.evaluate(() => {
      const seen: number[] = [];
      (window as unknown as { seen: number[] }).seen = seen;
      window.addEventListener("scroll", () => seen.push(window.scrollY));
    });
    await page.getByRole("button", { name: "Close" }).dispatchEvent("click");
    await expect(page.getByRole("dialog", { name: "Demo overlay" })).toHaveCount(0);
    expect(await page.evaluate(() => window.scrollY)).toBe(600);
    await page.waitForTimeout(300);
    const seen = await page.evaluate(() => (window as unknown as { seen: number[] }).seen);
    // Instant: the position is back before the next frame, with no intermediate positions on the way.
    expect(seen.filter((y) => y !== 600)).toEqual([]);
  });
});

test.describe("nav sheet context", () => {
  for (const size of [
    { width: 390, height: 844 },
    { width: 390, height: 600 },
    { width: 320, height: 568 },
    { width: 844, height: 390 },
  ]) {
    test(`stays in view while the body scrolls, apart from the first item (${size.width}x${size.height})`, async ({
      page,
    }) => {
      await page.setViewportSize(size);
      await openStory(page, "components-navigation-appshell--sheet-context-stays-in-view");
      const sheet = page.getByRole("dialog", { name: "Menu" });
      await expect(sheet).toBeVisible();
      await sheet.evaluate((element) =>
        Promise.all(element.getAnimations({ subtree: true }).map((animation) => animation.finished)),
      );
      const picker = sheet.locator("[data-demo-context] button").first();
      const firstItem = sheet.getByRole("navigation", { name: "Main navigation" }).getByRole("link").first();
      const body = sheet.locator("[data-sheet-body]");
      // The sheet scrolls the current item into view; measure the gap with the list at its top.
      await body.evaluate((element) => element.scrollTo({ top: 0, behavior: "instant" }));
      const pickerBox = (await picker.boundingBox())!;
      const itemBox = (await firstItem.boundingBox())!;
      expect(itemBox.y - (pickerBox.y + pickerBox.height)).toBeGreaterThanOrEqual(8);

      // A usable list: more than one item tall, even held sideways.
      expect((await body.boundingBox())!.height).toBeGreaterThan(64);
      await body.evaluate((element) => element.scrollTo({ top: element.scrollHeight, behavior: "instant" }));
      await expect.poll(() => body.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
      await expect(picker).toBeInViewport({ ratio: 1 });
      expect((await picker.boundingBox())!.y).toBeCloseTo(pickerBox.y, 0);
      // Nothing is pushed out of the sheet: the footer stays whole.
      await expect(sheet.getByRole("button", { name: "Sign out" })).toBeInViewport({ ratio: 1 });
    });
  }

  test("a tall context is capped and the navigation keeps a usable height at 390x600", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 600 });
    await openStory(page, "components-navigation-appshell--sheet-tall-context");
    const sheet = page.getByRole("dialog", { name: "Menu" });
    await expect(sheet).toBeVisible();
    const region = sheet.locator('[data-lufia-part="nav-sheet-context"]');
    const sizes = await region.evaluate((element) => ({
      height: element.getBoundingClientRect().height,
      scrolls: element.scrollHeight > element.clientHeight,
    }));
    expect(sizes.height).toBeLessThanOrEqual(600 * 0.3 + 1);
    expect(sizes.scrolls).toBe(true);
    expect((await sheet.locator("[data-sheet-body]").boundingBox())!.height).toBeGreaterThanOrEqual(120);
  });

  test("the header stays a drag zone, and the context sits outside it", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openStory(page, "components-navigation-appshell--sheet-context-stays-in-view");
    const zone = page.getByRole("dialog", { name: "Menu" }).locator("[data-swipe]");
    await expect(zone).toHaveCSS("touch-action", "none");
    await expect(zone.locator('[data-lufia-part="nav-sheet-context"]')).toHaveCount(0);
  });
});

test.describe("floating bar scrim and the bar over the open menu", () => {
  for (const mode of ["light", "dark"] as const) {
    test(`the scrim fades the page to the canvas under the bar, full width, and never takes a tap (${mode})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await openStory(
        page,
        "components-navigation-appshell-mobilefloatbar--scrim-over-content",
        "default",
        mode,
      );
      const scrim = page.locator('[data-lufia-part="float-bar-scrim"]');
      await expect(scrim).toBeAttached();
      const box = (await scrim.boundingBox())!;
      expect(Math.round(box.x)).toBe(0);
      expect(Math.round(box.width)).toBe(390);
      expect(Math.round(box.y + box.height)).toBe(844);
      expect(box.height).toBeGreaterThanOrEqual(90);
      // A point in the fade above the bar hits the page, not the scrim.
      const hit = await page.evaluate(
        ([x, y]) =>
          document.elementFromPoint(x!, y!)?.closest('[data-lufia-part="float-bar-scrim"]') === null,
        [20, box.y + 8],
      );
      expect(hit).toBe(true);
      const colours = await scrim.evaluate((node) => ({
        image: getComputedStyle(node).backgroundImage,
        canvas: getComputedStyle(document.body).getPropertyValue("--lufia-color-bg-canvas"),
      }));
      expect(colours.image).toContain("linear-gradient");
      expect(await runAxe(page, "#storybook-root")).toEqual([]);
    });
  }

  test("the phone page scrolls its end clear of the bar", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openStory(page, "components-navigation-appshell--phone");
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const { contentBottom, barTop } = await page.evaluate(() => {
      const main = document.querySelector("main")!;
      const last = main.lastElementChild!.getBoundingClientRect();
      const bar = document.querySelector('[role="group"][aria-label]')!.getBoundingClientRect();
      return { contentBottom: last.bottom, barTop: bar.top };
    });
    expect(contentBottom).toBeLessThanOrEqual(barTop);
  });

  for (const mode of ["light", "dark"] as const) {
    test(`the bar stays over the open sheet with a close button that closes it (${mode})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await openStory(page, "components-navigation-appshell--phone", "default", mode);
      const opener = page.getByRole("button", { name: "Menu", exact: true });
      await opener.click();
      const dialog = page.getByRole("dialog");
      const close = dialog.getByRole("button", { name: "Close", exact: true });
      await expect(close).toBeVisible();
      const closeBox = (await close.boundingBox())!;
      const sheetBox = (await page.locator('[data-lufia-part="nav-sheet"]').boundingBox())!;
      // The bar is over the sheet, near the bottom of the screen.
      expect(closeBox.y).toBeGreaterThan(sheetBox.y);
      expect(closeBox.y + closeBox.height).toBeLessThan(844);
      const topmost = await close.evaluate((node) => {
        const r = node.getBoundingClientRect();
        return node.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
      });
      expect(topmost).toBe(true);
      expect(await runAxe(page, "body", { rules: { region: { enabled: false } } })).toEqual([]);
      await close.click();
      await expect(dialog).toBeHidden();
      await expect(opener).toBeFocused();
      const openerBox = (await opener.boundingBox())!;
      expect(Math.abs(openerBox.x - closeBox.x)).toBeLessThan(1);
      expect(Math.abs(openerBox.y - closeBox.y)).toBeLessThan(1);
    });
  }
});

test.describe("phone targets and overflow", () => {
  const minTarget = async (page: Page, selector: string) => {
    // Polled: an overlay measures small while its entrance animation scales it.
    await expect
      .poll(async () => (await page.locator(selector).first().boundingBox())?.height, { message: selector })
      .toBeGreaterThanOrEqual(44);
  };

  test.describe("at 390px", () => {
    test.use({ viewport: { width: 390, height: 800 } });

    test("controls are finger-sized", async ({ page }) => {
      await openStory(page, "components-data-display-tabletoolbar--default");
      await minTarget(page, "input[type=search]");
      await openStory(page, "components-forms-combobox--default");
      await minTarget(page, 'button[aria-haspopup="listbox"], button[aria-expanded]');
      await openStory(page, "components-actions-button--all-variants-and-sizes");
      for (const button of await page.getByRole("button").all()) {
        expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      }
      await openStory(page, "components-overlays-commandpalette--open-on-load");
      await minTarget(page, 'input[role="combobox"]');
      await minTarget(page, '[role="dialog"] button');
    });

    test("the palette ends above a short visible viewport and still scrolls", async ({ page }) => {
      await openStory(page, "components-overlays-commandpalette--open-on-load");
      const dialog = page.getByRole("dialog");
      await dialog.evaluate((node) => node.style.setProperty("--palette-visible-block-size", "360px"));
      const box = await dialog.boundingBox();
      expect(box!.y + box!.height).toBeLessThanOrEqual(360);
    });
  });

  test.describe("at 1280px", () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test("a small button keeps its desktop density", async ({ page }) => {
      await openStory(page, "components-actions-button--all-variants-and-sizes");
      const heights = await Promise.all(
        (await page.locator('button[data-size="sm"]').all()).map(
          async (b) => (await b.boundingBox())!.height,
        ),
      );
      expect(heights.length).toBeGreaterThan(0);
      expect(Math.max(...heights)).toBeLessThanOrEqual(33);
    });
  });

  for (const width of [390, 1280]) {
    test(`nine long peer nav items keep one line each at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 700 });
      await openStory(page, "components-navigation-peernav--nine-long-items-scroll");
      await page.waitForFunction(() => document.getAnimations().length === 0);
      const result = await page.evaluate(() => {
        const items = [...document.querySelectorAll<HTMLElement>("[data-peer-key]")];
        const strip = items[0]!.parentElement!;
        const active = items.find((item) => item.dataset.active)!;
        const indicator = strip.querySelector<HTMLElement>('[aria-hidden="true"]:not([data-peer-key] *)')!;
        const a = active.getBoundingClientRect();
        const m = indicator.getBoundingClientRect();
        return {
          heights: new Set(items.map((item) => Math.round(item.getBoundingClientRect().height))).size,
          lines: items.flatMap((item) =>
            [...item.querySelectorAll<HTMLElement>("[title]")].map(
              (text) => text.getBoundingClientRect().height,
            ),
          ),
          maxWidth: Math.max(...items.map((item) => item.getBoundingClientRect().width)),
          scrolls: strip.scrollWidth > strip.clientWidth,
          fade: strip.dataset.more,
          indicatorOff: Math.abs(a.left - m.left) + Math.abs(a.width - m.width),
        };
      });
      expect(result.heights).toBe(1);
      expect(Math.max(...result.lines)).toBeLessThan(24);
      expect(result.maxWidth).toBeLessThanOrEqual(320.5);
      expect(result.scrolls).toBe(true);
      expect(result.fade).toBeTruthy();
      expect(result.indicatorOff).toBeLessThan(2);
    });
  }

  test("a long word stays inside its peer nav item", async ({ page }) => {
    await openStory(page, "components-navigation-peernav--long-word-fit");
    const overflowing = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("[data-peer-key]")].some((item) => {
        const label = item.querySelector("span span") as HTMLElement;
        return label.getBoundingClientRect().right > item.getBoundingClientRect().right + 0.5;
      }),
    );
    expect(overflowing).toBe(false);
  });

  test("a truncated badge stays inside its parent", async ({ page }) => {
    await openStory(page, "components-data-display-badge--truncated");
    const fits = await page.evaluate(() => {
      const badge = document.querySelector<HTMLElement>("[data-truncate]")!;
      return badge.getBoundingClientRect().right <= badge.parentElement!.getBoundingClientRect().right + 0.5;
    });
    expect(fits).toBe(true);
  });
});

test.describe("select chevron room", () => {
  for (const dir of ["ltr", "rtl"] as const) {
    test(`a long label in a narrow select stops short of the chevron (${dir})`, async ({ page }) => {
      await openStory(page, "components-forms-select--narrow-long-label", "default", "light", dir);
      const result = await page.evaluate(() => {
        const select = document.querySelector<HTMLSelectElement>("select")!;
        const chevron = select.nextElementSibling as HTMLElement;
        const box = select.getBoundingClientRect();
        const glyph = chevron.getBoundingClientRect();
        const style = getComputedStyle(select);
        const rtl = style.direction === "rtl";
        const padding = parseFloat(style.paddingInlineEnd);
        // The edge of the text area on the chevron side, against the near edge of the chevron.
        const textEdge = rtl ? box.left + padding : box.right - padding;
        return {
          width: box.width,
          padding,
          chevronWidth: glyph.width,
          overlap: rtl ? glyph.right - textEdge : textEdge - glyph.left,
          ellipsis: style.textOverflow,
        };
      });
      expect(result.width).toBeLessThanOrEqual(96.5);
      expect(result.padding).toBeGreaterThanOrEqual(result.chevronWidth);
      // Positive means the text area reaches into the chevron.
      expect(result.overlap).toBeLessThanOrEqual(0.5);
      expect(result.ellipsis).toBe("ellipsis");
    });

    test(`a long label in a narrow compact select stops short of its chevron (${dir})`, async ({ page }) => {
      await openStory(page, "components-forms-select--compact-narrow-long-label", "default", "light", dir);
      const result = await page.evaluate(() => {
        const select = document.querySelector<HTMLSelectElement>("select")!;
        const chevron = select.nextElementSibling as HTMLElement;
        const box = select.getBoundingClientRect();
        const glyph = chevron.getBoundingClientRect();
        const style = getComputedStyle(select);
        const rtl = style.direction === "rtl";
        const padding = parseFloat(style.paddingInlineEnd);
        const textEdge = rtl ? box.left + padding : box.right - padding;
        return {
          width: box.width,
          padding,
          chevronWidth: glyph.width,
          overlap: rtl ? glyph.right - textEdge : textEdge - glyph.left,
          ellipsis: style.textOverflow,
        };
      });
      expect(result.width).toBeLessThanOrEqual(96.5);
      expect(result.padding).toBeGreaterThanOrEqual(result.chevronWidth);
      expect(result.overlap).toBeLessThanOrEqual(0.5);
      expect(result.ellipsis).toBe("ellipsis");
    });
  }
});

test.describe("textarea autoSize", () => {
  test("grows with the content from rows to maxRows, then scrolls", async ({ page }) => {
    await openStory(page, "components-forms-textarea--auto-size");
    const area = page.getByRole("textbox");
    const height = () => area.evaluate((node) => node.getBoundingClientRect().height);
    const rest = await height();
    await area.fill("one\ntwo\nthree\nfour");
    const grown = await height();
    expect(grown).toBeGreaterThan(rest);
    await area.fill(Array.from({ length: 30 }, (_, i) => `line ${i}`).join("\n"));
    const capped = await height();
    // maxRows is 8: the box stops growing there and scrolls inside.
    expect(capped).toBeGreaterThan(grown);
    await area.fill(Array.from({ length: 60 }, (_, i) => `line ${i}`).join("\n"));
    expect(await height()).toBeCloseTo(capped, 0);
    expect(await area.evaluate((node) => node.scrollHeight > node.clientHeight)).toBe(true);
    await area.fill("");
    expect(await height()).toBeCloseTo(rest, 0);
  });
});
