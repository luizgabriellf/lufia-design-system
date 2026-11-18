import { createRequire } from "node:module";
import { expect, test, type ElementHandle, type Locator, type Page } from "@playwright/test";

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

test.describe("popover", () => {
  test("near the bottom edge it flips above the trigger and stays inside the viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await openStory(page, "components-overlays-popover--flips-near-the-bottom");
    const panel = page.getByRole("dialog", { name: "Filters" });
    await expect(panel).toBeVisible();
    await expect(panel).toHaveAttribute("data-side", "top");
    await expect
      .poll(async () =>
        panel.evaluate((element) => {
          const box = element.getBoundingClientRect();
          return box.top >= 0 && box.bottom <= innerHeight && box.left >= 0 && box.right <= innerWidth;
        }),
      )
      .toBe(true);
  });

  test("inside an overflow-hidden card it is portalled out and not clipped; Escape returns focus", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await openStory(page, "components-overlays-popover--in-clipping-card");
    const panel = page.getByRole("dialog", { name: "Filters" });
    await expect(panel).toBeVisible();
    await expect
      .poll(async () =>
        page.evaluate(() => {
          const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
          const card = document.querySelector('[data-testid="clipping-card"]');
          if (!dialog || !card) return "missing";
          const box = dialog.getBoundingClientRect();
          const hit = document.elementFromPoint(box.left + box.width / 2, box.bottom - 4);
          return { escaped: !card.contains(dialog), hit: !!hit && dialog.contains(hit) };
        }),
      )
      .toEqual({ escaped: true, hit: true });
    const trigger = page.getByRole("button", { name: "Filters", exact: true });
    await trigger.focus();
    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test("at 320px the panel fits the viewport width", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await openStory(page, "components-overlays-popover--open");
    const panel = page.getByRole("dialog", { name: "Filters" });
    await expect(panel).toBeVisible();
    const box = await panel.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(320);
  });
});

test.describe("menu", () => {
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    test(`a native download item downloads the file and closes the list (${reducedMotion} motion)`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion });
      await openStory(page, "components-overlays-menu--native-link-items");
      const item = page.getByRole("menuitem", { name: "Download CSV" });
      await expect(item).toHaveAttribute("download", "report.csv");
      expect(await item.evaluate((element) => element.tagName)).toBe("A");
      const downloading = page.waitForEvent("download");
      await item.focus();
      await page.keyboard.press("Enter");
      const download = await downloading;
      expect(download.suggestedFilename()).toBe("report.csv");
      await expect(page.getByRole("menu")).toHaveCount(0);
    });
  }

  test("near the bottom edge it flips above the trigger and stays inside the viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await openStory(page, "components-overlays-menu--flips-near-the-bottom");
    const list = page.getByRole("menu", { name: "Export" });
    await expect(list).toBeVisible();
    await expect(list).toHaveAttribute("data-side", "top");
    await expect
      .poll(async () =>
        list.evaluate((element) => {
          const box = element.getBoundingClientRect();
          return box.top >= 0 && box.bottom <= innerHeight && box.left >= 0 && box.right <= innerWidth;
        }),
      )
      .toBe(true);
  });

  test("inside an overflow-hidden card it is portalled out and not clipped; arrows move focus and Escape returns it", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await openStory(page, "components-overlays-menu--in-clipping-card");
    const list = page.getByRole("menu", { name: "Export" });
    await expect(list).toBeVisible();
    await expect
      .poll(async () =>
        page.evaluate(() => {
          const menu = document.querySelector<HTMLElement>('[role="menu"]');
          const card = document
            .querySelector("main, #storybook-root")
            ?.querySelector("div[style*='overflow']");
          if (!menu) return "missing";
          const box = menu.getBoundingClientRect();
          const hit = document.elementFromPoint(box.left + box.width / 2, box.bottom - 4);
          return { escaped: !card?.contains(menu), hit: !!hit && menu.contains(hit) };
        }),
      )
      .toEqual({ escaped: true, hit: true });
    const trigger = page.getByRole("button", { name: "Export", exact: true });
    // The story starts open without moving focus: close it, then open it with the keyboard.
    await trigger.focus();
    await page.keyboard.press("Escape");
    await expect(list).toHaveCount(0);
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("menuitem").first()).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("menuitem").nth(1)).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(list).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test("at 320px long labels wrap inside the list and nothing overflows the viewport", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await openStory(page, "components-overlays-menu--long-labels");
    const list = page.getByRole("menu", { name: "Workspaces" });
    await expect(list).toBeVisible();
    await expect
      .poll(async () =>
        list.evaluate((element) => {
          const box = element.getBoundingClientRect();
          return {
            fits: box.left >= 0 && box.right <= innerWidth,
            noOverflow: element.scrollWidth <= element.clientWidth,
            page: document.documentElement.scrollWidth <= innerWidth,
          };
        }),
      )
      .toEqual({ fits: true, noOverflow: true, page: true });
  });

  test("the listbox options are at least 44px tall under a coarse pointer", async ({ browser }) => {
    const context = await browser.newContext({
      hasTouch: true,
      isMobile: true,
      viewport: { width: 390, height: 800 },
    });
    const page = await context.newPage();
    await openStory(page, "components-overlays-menu--listbox");
    const options = page.getByRole("option");
    await expect(options.first()).toBeVisible();
    // Layout height, not the painted box: the panel scales in while it opens, and a scaled box reads short.
    const heights = await options.evaluateAll((elements) =>
      elements.map((el) => (el as HTMLElement).offsetHeight),
    );
    expect(Math.min(...heights)).toBeGreaterThanOrEqual(44);
    await context.close();
  });

  for (const width of [320, 390] as const) {
    for (const mode of ["light", "dark"] as const) {
      test(`an inline listbox in a modal sheet reads correctly at ${width}px in ${mode} mode`, async ({
        browser,
      }) => {
        const context = await browser.newContext({
          hasTouch: true,
          isMobile: true,
          viewport: { width, height: 700 },
        });
        const page = await context.newPage();
        await openStory(page, "components-overlays-menu--inline-in-modal-sheet", "default", mode);
        const sheet = page.getByRole("dialog", { name: "Choose scope" });
        await expect(sheet).toBeVisible();
        const list = sheet.getByRole("listbox", { name: "Scope" });
        await expect(list).toBeVisible();
        const options = list.getByRole("option");
        await expect(options).toHaveCount(4);
        await expect
          .poll(async () =>
            list.evaluate((element) => {
              const box = element.getBoundingClientRect();
              const dialog = element.closest('[role="dialog"]') as HTMLElement;
              return {
                fits: box.left >= 0 && box.right <= innerWidth,
                noOverflow: element.scrollWidth <= element.clientWidth,
                sheetNoOverflow: dialog.scrollWidth <= dialog.clientWidth,
                page: document.documentElement.scrollWidth <= innerWidth,
              };
            }),
          )
          .toEqual({ fits: true, noOverflow: true, sheetNoOverflow: true, page: true });
        // Layout height, not the painted box: the sheet scales in while it opens, and a scaled box reads short.
        const heights = await options.evaluateAll((elements) =>
          elements.map((el) => (el as HTMLElement).offsetHeight),
        );
        expect(Math.min(...heights)).toBeGreaterThanOrEqual(44);
        // The long label wraps onto more than one line.
        expect(heights[1]).toBeGreaterThan(heights[0]!);
        // The selected option is announced, bold and carries a visible check; the others do not.
        const selected = list.getByRole("option", { selected: true });
        await expect(selected).toHaveCount(1);
        await expect(selected).toHaveText(/All workspaces/);
        const look = await selected.evaluate((element) => {
          const check = element.querySelector("svg");
          const style = getComputedStyle(element);
          return {
            weight: Number(style.fontWeight),
            checkWidth: check?.getBoundingClientRect().width ?? 0,
            checkColour: check ? getComputedStyle(check).color : "",
            text: style.color,
          };
        });
        expect(look.weight).toBeGreaterThanOrEqual(600);
        expect(look.checkWidth).toBeGreaterThan(0);
        expect(look.checkColour).not.toBe("rgba(0, 0, 0, 0)");
        await expect(list.locator('[role="option"]:not([aria-selected="true"]) svg')).toHaveCount(0);
        // Readable against the sheet: the text colour differs from the sheet background in this mode.
        const background = await sheet.evaluate((element) => getComputedStyle(element).backgroundColor);
        expect(look.text).not.toBe(background);
        // Poll: the sheet fades in, and a contrast check on half-opaque text fails (seen in WebKit).
        await expect.poll(() => runAxe(page, '[role="dialog"]')).toEqual([]);
        await context.close();
      });
    }
  }
});

test.describe("tour", () => {
  test("the spotlight surrounds the target, the card sits beside it inside the viewport, and the page stays operable", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await openStory(page, "components-overlays-tour--default");
    const card = page.getByRole("dialog", { name: "Find anything" });
    await expect(card).toBeVisible();
    await expect(card.getByRole("heading", { name: "Find anything" })).toBeFocused();
    await expect
      .poll(async () =>
        page.evaluate(() => {
          const target = document.querySelector('[data-tour="search"]')!.getBoundingClientRect();
          const spot = document.querySelector('[data-lufia-part="spotlight"]')!.getBoundingClientRect();
          const dialog = document.querySelector('[role="dialog"]')!.getBoundingClientRect();
          return {
            around:
              spot.left <= target.left &&
              spot.top <= target.top &&
              spot.right >= target.right &&
              spot.bottom >= target.bottom,
            beside: dialog.top >= target.bottom || dialog.bottom <= target.top,
            inside:
              dialog.left >= 0 &&
              dialog.right <= innerWidth &&
              dialog.top >= 0 &&
              dialog.bottom <= innerHeight,
          };
        }),
      )
      .toEqual({ around: true, beside: true, inside: true });
    // The page behind the dimming still takes input.
    await page.getByRole("textbox", { name: "Search records" }).fill("abc");
    await expect(page.getByRole("textbox", { name: "Search records" })).toHaveValue("abc");
  });

  test("arrow keys step, Escape closes and focus returns to the page", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await openStory(page, "components-overlays-tour--default");
    const card = page.getByRole("dialog");
    await expect(card.getByRole("heading", { name: "Find anything" })).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(card.getByRole("heading", { name: "Narrow it down" })).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(card.getByRole("heading", { name: "Find anything" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(card).toHaveCount(0);
  });

  test("a missing target gives a centred card", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await openStory(page, "components-overlays-tour--missing-target");
    const card = page.getByRole("dialog", { name: "Not here" });
    await expect(card).toBeVisible();
    await expect(card).toHaveAttribute("data-kind", "center");
    // The entrance animation moves the card a few pixels: wait for it to settle.
    await expect
      .poll(async () => {
        const box = await card.boundingBox();
        return Math.max(Math.abs(box!.x + box!.width / 2 - 640), Math.abs(box!.y + box!.height / 2 - 360));
      })
      .toBeLessThan(2);
  });

  test("at 390px the card is a sheet docked to an edge and the target is clear of it", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 780 });
    await openStory(page, "components-overlays-tour--default");
    const card = page.getByRole("dialog", { name: "Find anything" });
    await expect(card).toHaveAttribute("data-kind", "sheet");
    await expect
      .poll(async () =>
        page.evaluate(() => {
          const target = document.querySelector('[data-tour="search"]')!.getBoundingClientRect();
          const dialog = document.querySelector('[role="dialog"]')!.getBoundingClientRect();
          return {
            full: Math.round(dialog.width) === innerWidth,
            clear: target.bottom <= dialog.top || target.top >= dialog.bottom,
          };
        }),
      )
      .toEqual({ full: true, clear: true });
  });
});

test.describe("tour inside a modal", () => {
  for (const [name, id] of [
    ["native dialog", "components-overlays-tour--docked-modal"],
    ["portal", "components-overlays-tour--docked-portal-modal"],
  ] as const) {
    test(`at 390px the ${name} Modal docks above the card, keeps its header and footer, and is handed back`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 780 });
      await openStory(page, id);
      const card = page.getByRole("dialog", { name: "Further down" });
      await expect(card).toHaveAttribute("data-kind", "sheet");
      const measure = () =>
        page.evaluate(() => {
          const rect = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
          const panel = rect('[data-lufia-part="panel"]');
          const header = rect('[data-lufia-part="header"]');
          const footer = rect('[data-lufia-part="footer"]');
          const target = rect('[data-tour="low-field"]');
          const tour = document.querySelector('[data-lufia-part="card"]')?.getBoundingClientRect();
          return {
            headerHeight: Math.round(header.height),
            panelBottom: Math.round(panel.bottom),
            cardTop: tour ? Math.round(tour.top) : null,
            footerAboveCard: tour ? footer.bottom <= tour.top + 1 : null,
            targetBetweenBars: target.top >= header.bottom - 1 && target.bottom <= footer.top + 1,
          };
        });
      await expect
        .poll(async () => {
          const m = await measure();
          return (
            m.headerHeight < 100 &&
            Math.abs(m.panelBottom - (m.cardTop ?? Infinity)) <= 2 &&
            m.footerAboveCard &&
            m.targetBetweenBars
          );
        })
        .toBe(true);
      // Leaving the tour hands the modal back: it reaches the bottom of the viewport again.
      await card.getByRole("button", { name: "Close tour" }).click();
      await expect(card).toHaveCount(0);
      await expect.poll(async () => (await measure()).panelBottom).toBe(780);
    });
  }
});

test.describe("tour dock and in-dialog fallback", () => {
  for (const [name, id, card] of [
    ["no target", "components-overlays-tour--short-sheet-no-target", "Before you start"],
    ["a target inside it", "components-overlays-tour--short-sheet-target", "Further down"],
  ] as const) {
    test(`at 390x844 a sheet shorter than the viewport ends where the card starts (${name}), and its footer takes a real click`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await openStory(page, id);
      const tour = page.getByRole("dialog", { name: card });
      await expect(tour).toHaveAttribute("data-kind", "sheet");
      const measure = () =>
        page.evaluate(() => {
          const rect = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
          const panel = rect('[data-lufia-part="panel"]');
          const footer = rect('[data-lufia-part="footer"]');
          const cardBox = rect('[data-lufia-part="card"]');
          return {
            panelBottom: Math.round(panel.bottom),
            cardTop: Math.round(cardBox.top),
            footerAboveCard: footer.bottom <= cardBox.top + 1,
          };
        });
      await expect
        .poll(async () => {
          const m = await measure();
          return Math.abs(m.panelBottom - m.cardTop) <= 2 && m.footerAboveCard;
        })
        .toBe(true);
      // Playwright refuses to click an element another element covers: the footer button is reachable.
      await page.getByRole("button", { name: "Save" }).click({ timeout: 3000 });
      await page.getByRole("button", { name: "Cancel" }).click({ timeout: 3000 });
      // Leaving the tour hands the sheet back: it reaches the bottom of the viewport again.
      await tour.getByRole("button", { name: "Close tour" }).click();
      await expect(tour).toHaveCount(0);
      await expect
        .poll(async () =>
          page.evaluate(() =>
            Math.round(document.querySelector('[data-lufia-part="panel"]')!.getBoundingClientRect().bottom),
          ),
        )
        .toBe(844);
    });
  }

  test("at 1440x900 the card goes inside a wide dialog, off the target, its sibling fields and the footer", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openStory(page, "components-overlays-tour--wide-dialog-form");
    const tour = page.getByRole("dialog", { name: "Location" });
    await expect(tour).toHaveAttribute("data-kind", "float");
    await expect
      .poll(async () =>
        page.evaluate(() => {
          const box = (element: Element) => element.getBoundingClientRect();
          const cardBox = box(document.querySelector('[data-lufia-part="card"]')!);
          const panel = box(document.querySelector('[data-lufia-part="panel"]')!);
          const touches = (r: DOMRect) =>
            cardBox.left < r.right &&
            cardBox.right > r.left &&
            cardBox.top < r.bottom &&
            cardBox.bottom > r.top;
          const fields = Array.from(document.querySelectorAll("[data-field]"));
          const controls = [
            ...fields,
            ...document.querySelectorAll('[data-lufia-part="footer"], [data-lufia-part="footer"] button'),
          ];
          return {
            overlapping: controls.filter((element) => touches(box(element))).length,
            insideDialog:
              cardBox.left >= panel.left &&
              cardBox.right <= panel.right &&
              cardBox.top >= panel.top &&
              cardBox.bottom <= panel.bottom,
            fields: fields.length,
          };
        }),
      )
      .toEqual({ overlapping: 0, insideDialog: true, fields: 9 });
  });

  test("at 390px the spotlight ring of a target filling the dialog body stays above the docked card", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openStory(page, "components-overlays-tour--target-fills-dialog-body");
    await expect(page.getByRole("dialog", { name: "The whole body" })).toHaveAttribute("data-kind", "sheet");
    await expect
      .poll(async () =>
        page.evaluate(() => {
          const ring = document.querySelector('[data-lufia-part="spotlight"]')!.getBoundingClientRect();
          const cardBox = document.querySelector('[data-lufia-part="card"]')!.getBoundingClientRect();
          const panel = document.querySelector('[data-lufia-part="panel"]')!.getBoundingClientRect();
          return {
            ringAboveCard: ring.bottom <= cardBox.top + 0.5,
            docked: Math.abs(panel.bottom - cardBox.top) <= 2,
            // The ring is not cut away: it still spans most of the room above the card.
            visible: ring.height > 200,
          };
        }),
      )
      .toEqual({ ringAboveCard: true, docked: true, visible: true });
  });
});

test.describe("tour with no target under a modal", () => {
  for (const [name, id] of [
    ["native dialog opened with showModal()", "components-overlays-tour--no-target-in-native-dialog"],
    ["package Modal (native dialog)", "components-overlays-tour--no-target-in-dialog-modal"],
    ["package Modal (portal)", "components-overlays-tour--no-target-in-portal-modal"],
  ] as const) {
    test(`the card is visible and its buttons are clickable over a ${name}`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await openStory(page, id);
      const card = page.getByRole("dialog", { name: "Before you start" });
      await expect(card).toBeVisible();
      // Playwright refuses to click an element another element covers, so this proves the card is above the modal.
      await card.getByRole("button", { name: "Next" }).click();
      await expect(page.getByRole("dialog", { name: "Then this" })).toBeVisible();
      await page.getByRole("dialog", { name: "Then this" }).getByRole("button", { name: "Done" }).click();
      await expect(page.getByRole("dialog", { name: "Then this" })).toHaveCount(0);
    });
  }
});

test.describe("tour above overlays opened after it started", () => {
  /** Polls until the card's centre-most button is what `elementFromPoint` returns there: it is on top, not just painted. */
  async function expectButtonOnTop(page: Page, name: string) {
    await expect
      .poll(() =>
        page.evaluate((label) => {
          const button = [...document.querySelectorAll<HTMLElement>('[data-lufia-part="card"] button')].find(
            (candidate) => candidate.textContent?.trim() === label,
          );
          if (!button) return "missing";
          const box = button.getBoundingClientRect();
          const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
          return hit && button.contains(hit) ? "on top" : (hit?.className?.toString() ?? "nothing");
        }, name),
      )
      .toBe("on top");
  }

  for (const [name, width, height, opener, overlay] of [
    ["bottom sheet menu", 390, 800, "More actions", "menu"],
    ["portal modal", 1280, 720, "Open dialog", "dialog"],
  ] as const) {
    test(`the card stays on top and clickable above a ${name} opened after it`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await openStory(page, "components-overlays-tour--overlay-opened-after-tour");
      const card = page.getByRole("dialog", { name: "Find anything" });
      await expect(card).toBeVisible();
      await page.getByRole("button", { name: opener }).click();
      await expect(
        overlay === "menu" ? page.getByRole("menu") : page.getByRole("dialog", { name: "Page dialog" }),
      ).toBeVisible();
      await expectButtonOnTop(page, "Next");
      await expectButtonOnTop(page, "Skip tour");
      // A real pointer press: the overlay's backdrop must not intercept it.
      await card.getByRole("button", { name: "Next" }).click();
      const last = page.getByRole("dialog", { name: "Still here" });
      await expect(last).toBeVisible();
      await expectButtonOnTop(page, "Done");
      await last.getByRole("button", { name: "Done" }).click();
      await expect(last).toHaveCount(0);
    });

    test(`the card's skip button works above a ${name} opened after it`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await openStory(page, "components-overlays-tour--overlay-opened-after-tour");
      const card = page.getByRole("dialog", { name: "Find anything" });
      await expect(card).toBeVisible();
      await page.getByRole("button", { name: opener }).click();
      await expect(
        overlay === "menu" ? page.getByRole("menu") : page.getByRole("dialog", { name: "Page dialog" }),
      ).toBeVisible();
      await card.getByRole("button", { name: "Skip tour" }).click();
      await expect(card).toHaveCount(0);
    });
  }

  test("Tab on the card is not pulled back into a sheet opened after the tour", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await openStory(page, "components-overlays-tour--overlay-opened-after-tour");
    await page.getByRole("button", { name: "More actions" }).click();
    await expect(page.getByRole("menu")).toBeVisible();
    // Focus on the card's first button (as after a press on it): Tab must go to the next button on the card. Without the
    // guard the sheet's focus trap pulls focus back into the sheet.
    const card = page.getByRole("dialog", { name: "Find anything" });
    await card.getByRole("button", { name: "Close tour" }).focus();
    await page.keyboard.press("Tab");
    await expect(card.getByRole("button", { name: "Skip tour" })).toBeFocused();
  });
});

test.describe("tour compact and auto placement", () => {
  test("typing on a short viewport hides the card, and it comes back when focus leaves", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 420 });
    await openStory(page, "components-overlays-tour--hidden-while-typing-on-short-viewport");
    const card = page.locator('[data-lufia-part="card"]');
    await expect(card).toBeVisible();
    await page.getByRole("textbox", { name: "Record name" }).focus();
    await expect(card).toHaveAttribute("data-typing-hidden", "");
    await expect(card).toBeHidden();
    await page.getByRole("textbox", { name: "Record name" }).blur();
    await expect(card).toBeVisible();
  });

  test("auto placement keeps the card beside the target inside the viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await openStory(page, "components-overlays-tour--auto-placement");
    const card = page.getByRole("dialog", { name: "Save" });
    await expect(card).toBeVisible();
    const sides = await page.evaluate(() => {
      const target = document.querySelector('[data-tour="save"]')!.getBoundingClientRect();
      const box = document.querySelector('[data-lufia-part="card"]')!.getBoundingClientRect();
      return {
        beside: box.top >= target.bottom || box.bottom <= target.top || box.left >= target.right,
        inside: box.left >= 0 && box.right <= innerWidth && box.top >= 0 && box.bottom <= innerHeight,
      };
    });
    expect(sides).toEqual({ beside: true, inside: true });
  });
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

test.describe("layout gaps", () => {
  test("a badge in a narrow flex row keeps one line and does not shrink", async ({ page }) => {
    await openStory(page, "components-data-display-badge--in-narrow-flex-row");
    const result = await page.getByTestId("flex-badge").evaluate((badge) => {
      const range = badge.ownerDocument.createRange();
      range.selectNodeContents([...badge.childNodes].find((node) => node.nodeType === Node.TEXT_NODE)!);
      return {
        lines: new Set([...range.getClientRects()].map((r) => Math.round(r.top))).size,
        clipped: badge.scrollWidth > badge.clientWidth,
      };
    });
    expect(result).toEqual({ lines: 1, clipped: false });
  });

  test("a wide timeline action stays inside the card at 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await openStory(page, "components-data-display-statustimeline--wide-action");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("an autosize textarea fills the space beside a sibling in a flex row", async ({ page }) => {
    await openStory(page, "components-forms-textarea--in-flex-row");
    const width = await page
      .getByRole("textbox", { name: "Notes" })
      .evaluate((box) => box.getBoundingClientRect().width);
    expect(width).toBeGreaterThan(200);
  });

  test("the checkbox has a 24px target around its 22px box", async ({ page }) => {
    await openStory(page, "components-forms-checkbox--default");
    const size = await page.getByRole("checkbox").evaluate((input) => {
      const after = getComputedStyle(input, "::before");
      return { box: input.getBoundingClientRect().width, layer: Number.parseFloat(after.width) };
    });
    expect(size.box).toBe(22);
    expect(size.layer).toBeGreaterThanOrEqual(24);
  });

  test("the choose label of a file field in a 150px slot takes at most three lines", async ({ page }) => {
    await openStory(page, "components-forms-filefield--narrow-slot");
    const lines = await page.getByText("Choose the files to attach", { exact: true }).evaluate((label) => {
      const text = [...label.childNodes].find((node) => node.nodeType === Node.TEXT_NODE)!;
      const range = label.ownerDocument.createRange();
      range.selectNodeContents(text);
      return new Set([...range.getClientRects()].map((rect) => Math.round(rect.top))).size;
    });
    expect(lines).toBeLessThanOrEqual(3);
  });

  test("a full-height sheet fills the phone screen", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openStory(page, "components-overlays-modal--full-height-sheet-on-phone");
    const height = await page.getByRole("dialog").evaluate((dialog) => dialog.getBoundingClientRect().height);
    expect(Math.round(height)).toBe(844);
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

test.describe("combobox wrapped value", () => {
  test("a long chosen label wraps at 320px, grows the box and keeps the controls on the first line", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await openStory(page, "components-forms-combobox--wrapped-value-phone-320");
    const input = page.getByRole("combobox", { name: "City" });
    const box = page.locator("[data-wrapped]");
    const layer = box.locator("[aria-hidden='true']").first();
    await expect(layer).toContainText("Centro de Saúde");
    const lines = await layer.evaluate((node) => {
      const style = getComputedStyle(node);
      return node.getBoundingClientRect().height / parseFloat(style.lineHeight);
    });
    expect(lines).toBeGreaterThan(1.5);
    expect(await layer.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
    const boxRect = (await box.boundingBox())!;
    expect(boxRect.height).toBeGreaterThan(44);
    const clear = page.getByRole("button", { name: "Clear city" });
    const clearRect = (await clear.boundingBox())!;
    expect(clearRect.y).toBeLessThan(boxRect.y + 44);
    expect(clearRect.width).toBeGreaterThanOrEqual(44);
    await expect(input).toHaveValue(/Centro de Saúde/);
    await input.click();
    await expect(input).toHaveAttribute("aria-expanded", "true");
    await expect(box).toHaveCount(0);
    expect((await page.locator("[data-open]").boundingBox())!.height).toBeLessThan(50);
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
    await page.evaluate(async () => {
      // Taking the lock moves the document to 0 and its scroll event arrives with a later frame. Let it pass before
      // listening, or a slow runner reports it as a position seen on the way back.
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
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

test.describe("stat tile button target", () => {
  test("on a phone the button label is at least 24x24 and the tile is no taller than the plain one", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    const measure = async (id: string) => {
      await openStory(page, id);
      return page.evaluate(() => {
        const root = document.querySelector<HTMLElement>("#storybook-root > *, #storybook-root")!;
        const tile = (root.querySelector("[data-tone]") ?? root) as HTMLElement;
        const button = tile.querySelector<HTMLElement>("button");
        const rect = button?.getBoundingClientRect();
        return { tile: tile.getBoundingClientRect().height, width: rect?.width, height: rect?.height };
      });
    };
    const plain = await measure("components-data-display-stattile--default");
    const pressable = await measure("components-data-display-stattile--as-button");
    expect(pressable.width).toBeGreaterThanOrEqual(24);
    expect(pressable.height).toBeGreaterThanOrEqual(24);
    expect(Math.abs(pressable.tile - plain.tile)).toBeLessThanOrEqual(0.5);
  });
});

test.describe("search input in a toolbar", () => {
  for (const width of [320, 390]) {
    test(`keeps a usable width beside fixed actions at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await openStory(page, "components-forms-searchinput--in-toolbar");
      const box = page.getByRole("searchbox").locator("xpath=..");
      const size = await box.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      });
      // 8rem is the floor the box declares; the row may overflow rather than squeeze the input to nothing.
      expect(size.width).toBeGreaterThanOrEqual(128);
      expect(size.height).toBeGreaterThanOrEqual(44);
    });
  }
});

test.describe("modal centred on a phone", () => {
  for (const width of [320, 390]) {
    test(`sheetPlacement="none" keeps a margin on every side at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 700 });
      await openStory(page, `components-overlays-modal--centered-on-phone${width === 320 ? "-320" : ""}`);
      const panel = page.getByRole("dialog");
      await expect(panel).toBeVisible();
      await page.waitForFunction(() => document.getAnimations().length === 0);
      const box = (await panel.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(15.5);
      expect(box.x + box.width).toBeLessThanOrEqual(width - 15.5);
      expect(box.y).toBeGreaterThanOrEqual(15.5);
      expect(box.y + box.height).toBeLessThanOrEqual(700 - 15.5);
      // Vertically centred, unlike a bottom sheet.
      expect(Math.abs(box.y - (700 - box.y - box.height))).toBeLessThanOrEqual(1);
    });
  }
});

test.describe("search input in a grid form", () => {
  test("fills its track at 320px, and keeps a usable width in a content-sized track", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await openStory(page, "components-forms-searchinput--in-grid-form");
    const widths = await page.evaluate(() => {
      const form = document.querySelector<HTMLElement>('[data-testid="grid-form"]')!;
      const boxes = [...form.querySelectorAll<HTMLElement>('input[type="search"]')].map((input) =>
        input.parentElement!.getBoundingClientRect(),
      );
      return { form: form.getBoundingClientRect().width, first: boxes[0]!.width, second: boxes[1]!.width };
    });
    // A `1fr` track: the box is as wide as the form, which is itself as wide as the phone allows (not ~20px).
    expect(widths.form).toBeGreaterThan(240);
    expect(Math.abs(widths.first - widths.form)).toBeLessThanOrEqual(1);
    // An `auto` track beside a button: never squeezed below the 8rem floor the box declares.
    expect(widths.second).toBeGreaterThanOrEqual(128);
  });
});

test.describe("search input inside a form field in a filter form", () => {
  const hosts = [
    ["grid-filter", "components-forms-searchinput--in-filter-form-grid"],
    ["single column", "components-forms-searchinput--in-filter-form-single-column"],
    ["flex wrap", "components-forms-searchinput--in-filter-form-flex-wrap"],
    ["align-items end", "components-forms-searchinput--in-filter-form-align-end"],
    ["justify-items start", "components-forms-searchinput--in-filter-form-justify-start"],
  ] as const;
  for (const width of [320, 390]) {
    for (const [name, id] of hosts) {
      test(`${name} keeps a usable search box at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        await openStory(page, id);
        const size = await page.getByRole("searchbox").evaluate((input) => {
          const rect = input.parentElement!.getBoundingClientRect();
          return { width: rect.width, height: rect.height };
        });
        expect(size.width).toBeGreaterThanOrEqual(128);
        expect(size.height).toBeGreaterThanOrEqual(44);
        expect(size.height).toBeLessThan(60);
      });
    }
  }
});

test.describe("search input in a column flex container", () => {
  test("is as tall as the control and fills the width", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await openStory(page, "components-forms-searchinput--in-column-flex");
    const sizes = await page.evaluate(() => {
      const host = document.querySelector<HTMLElement>('[data-testid="column-flex"]')!;
      const box = host.querySelector('input[type="search"]')!.parentElement!.getBoundingClientRect();
      return { width: box.width, height: box.height, host: host.getBoundingClientRect().width };
    });
    expect(sizes.height).toBeGreaterThanOrEqual(44);
    expect(sizes.height).toBeLessThan(48);
    expect(Math.abs(sizes.width - sizes.host)).toBeLessThanOrEqual(1);
  });
});

test.describe("list field", () => {
  for (const width of [320, 390]) {
    test(`fits the viewport and keeps usable targets at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await openStory(page, "components-forms-listfield--long-entries");
      const group = page.getByRole("group", { name: "Responsibilities" });
      const box = (await group.boundingBox())!;
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      for (const button of await page.getByRole("button", { name: /^Remove entry/ }).all()) {
        const rect = (await button.boundingBox())!;
        expect(rect.width).toBeGreaterThanOrEqual(24);
        expect(rect.height).toBeGreaterThanOrEqual(24);
      }
      const add = (await page.getByRole("button", { name: "Add" }).boundingBox())!;
      expect(add.height).toBeGreaterThanOrEqual(44);
    });
  }

  for (const width of [320, 390]) {
    test(`the add label never breaks inside a word at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await openStory(page, "components-forms-listfield--long-add-label");
      const add = page.getByRole("button", { name: "Add responsibility" });
      const lineCount = await add.evaluate((button) => {
        const label = button.querySelector("span:not([aria-hidden])")!;
        const style = getComputedStyle(label);
        const line = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.5;
        return Math.round(label.getBoundingClientRect().height / line);
      });
      expect(lineCount).toBe(1);
      // The button keeps its content width and either shares the row or wraps under the input, inside the group.
      const group = (await page.getByRole("group", { name: "Responsibilities" }).boundingBox())!;
      const button = (await add.boundingBox())!;
      expect(button.x + button.width).toBeLessThanOrEqual(group.x + group.width + 0.5);
    });
  }

  test("a removed row leaves the list and focus goes to the add input", async ({ page }) => {
    await openStory(page, "components-forms-listfield--default");
    await page.getByRole("button", { name: "Remove entry 1: Inspect the site" }).click();
    await expect(page.getByRole("textbox", { name: "Responsibilities" })).toBeFocused();
    await expect(page.getByRole("textbox", { name: "Entry 2" })).toHaveCount(0);
    await expect(page.getByRole("textbox", { name: "Entry 1" })).toHaveValue("File the report");
  });

  test("Enter in the add input adds an entry and does not submit the form", async ({ page }) => {
    await openStory(page, "components-forms-listfield--required");
    await page.getByRole("textbox", { name: /^Responsibilities/ }).fill("Check valves");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("textbox", { name: "Entry 1" })).toHaveValue("Check valves");
    await expect(page.getByText("Submitted: nothing yet")).toBeVisible();
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText('Submitted: "Check valves"')).toBeVisible();
  });
  test("includeDraft submits the typed text and satisfies required without adding it", async ({ page }) => {
    await openStory(page, "components-forms-listfield--include-draft");
    await page.getByRole("textbox", { name: /^Responsibilities/ }).fill("Check valves");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText('Submitted: "Check valves"')).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Entry 1" })).toHaveCount(0);
  });

  test("the counter describes the group", async ({ page }) => {
    await openStory(page, "components-forms-listfield--with-counter");
    await expect(page.getByRole("group", { name: "Responsibilities" })).toHaveAccessibleDescription(
      "2 of 5 entries, 32 of 80 characters",
    );
  });
});

test.describe("text control focus indicator", () => {
  test("a focused text input draws one ring over its border, not a second one with a gap", async ({
    page,
  }) => {
    await openStory(page, "components-forms-textinput--default");
    const input = page.getByRole("textbox").first();
    const box = input.locator("xpath=..");
    const borderBefore = await box.evaluate((el) => getComputedStyle(el).borderTopColor);
    await input.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(input).toBeFocused();
    const style = await box.evaluate((el) => {
      const computed = getComputedStyle(el);
      return {
        border: computed.borderTopColor,
        outlineWidth: parseFloat(computed.outlineWidth),
        outlineOffset: parseFloat(computed.outlineOffset),
      };
    });
    expect(style.border).toBe(borderBefore);
    expect(style.outlineWidth).toBeGreaterThanOrEqual(2);
    expect(style.outlineOffset).toBeLessThanOrEqual(0);
  });
});

test.describe("file field", () => {
  for (const width of [320, 390]) {
    test(`at ${width}px the trigger spans the zone and its icon and label share a row`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await openStory(page, "components-forms-filefield--default", "default", "dark");
      const geometry = await page.evaluate(() => {
        const label = Array.from(document.querySelectorAll("label")).find((l) =>
          l.querySelector("svg"),
        ) as HTMLElement;
        const zone = label.parentElement as HTMLElement;
        const icon = label.querySelector("svg") as SVGElement;
        const range = document.createRange();
        range.selectNodeContents(Array.from(label.childNodes).find((node) => node.nodeType === 3) as Node);
        const text = range.getBoundingClientRect();
        const box = label.getBoundingClientRect();
        const iconBox = icon.getBoundingClientRect();
        const zoneStyle = getComputedStyle(zone);
        const inner =
          zone.clientWidth -
          parseFloat(zoneStyle.paddingInlineStart) -
          parseFloat(zoneStyle.paddingInlineEnd);
        const hint = zone.querySelector("span[aria-hidden]")?.getBoundingClientRect();
        return {
          iconTop: iconBox.top,
          iconBottom: iconBox.bottom,
          textTop: text.top,
          textBottom: text.bottom,
          triggerWidth: box.width,
          inner,
          hintTop: hint?.top ?? null,
          triggerBottom: box.bottom,
        };
      });
      // Same row: the vertical ranges of the icon and the text overlap.
      expect(geometry.iconTop).toBeLessThan(geometry.textBottom);
      expect(geometry.textTop).toBeLessThan(geometry.iconBottom);
      expect(Math.abs(geometry.triggerWidth - geometry.inner)).toBeLessThanOrEqual(1);
      expect(geometry.hintTop).toBeGreaterThanOrEqual(geometry.triggerBottom);
    });
  }

  test("the drag hint shows for a mouse", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openStory(page, "components-forms-filefield--default");
    await expect(page.getByText("or drop files here")).toBeVisible();
  });

  test.describe("touch-first device", () => {
    test.use({ hasTouch: true, isMobile: true });

    test("the drag hint is removed from the page", async ({ page }) => {
      await openStory(page, "components-forms-filefield--default");
      await expect(page.locator("label", { hasText: "Choose files" })).toBeVisible();
      const hint = page.locator("span", { hasText: "or drop files here" });
      await expect(hint).toBeHidden();
      await expect(hint).toHaveCSS("display", "none");
    });
  });
});

test.describe("table", () => {
  const id = (name: string) => `components-data-display-table--${name}`;
  const pageOverflow = (page: Page) =>
    page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

  test("a clickable row's link covers the whole row and the actions cell stays on top", async ({ page }) => {
    for (const width of [1280, 390]) {
      await page.setViewportSize({ width, height: 800 });
      await openStory(page, id("clickable-rows-as-links"));
      const hits = await page.evaluate(() => {
        const row = document.querySelector<HTMLElement>("#storybook-root tbody tr")!;
        const point = (el: Element, dx: number, dy: number) => {
          const box = el.getBoundingClientRect();
          return document.elementFromPoint(box.left + dx, box.top + dy);
        };
        const cells = [...row.children];
        const button = row.querySelector("td:last-child button")!;
        const onTop = document.elementFromPoint(
          button.getBoundingClientRect().left + 4,
          button.getBoundingClientRect().top + 4,
        );
        return {
          cells: cells.map((cell) => point(cell, 4, 4)?.closest("a")?.tagName ?? null),
          button: onTop?.closest("button") === button,
        };
      });
      expect(hits.cells.every((tag) => tag === "A")).toBe(true);
      expect(hits.button).toBe(true);
    }
  });

  test("clicking the actions button does not follow the row's link", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openStory(page, id("clickable-rows-as-buttons"));
    await page.getByRole("button", { name: "Edit" }).first().click();
    await expect(page.getByText("Opened: nothing yet")).toBeVisible();
    await page.getByRole("button", { name: "Billing migration" }).click();
    await expect(page.getByText("Opened: Billing migration")).toBeVisible();
  });

  test("Enter and Space activate a button row from the keyboard", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openStory(page, id("clickable-rows-as-buttons"));
    await page.getByRole("button", { name: "Mobile onboarding" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByText("Opened: Mobile onboarding")).toBeVisible();
    await page.getByRole("button", { name: "Partner portal" }).focus();
    await page.keyboard.press("Space");
    await expect(page.getByText("Opened: Partner portal")).toBeVisible();
  });

  test("under 40rem the rows are cards: the header row is clipped and each cell shows its column label", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await openStory(page, id("default"));
    const result = await page.evaluate(() => {
      const root = document.querySelector("#storybook-root")!;
      const head = root.querySelector("thead")!.getBoundingClientRect();
      const cell = root.querySelector<HTMLElement>("tbody td[data-label='Owner']")!;
      return {
        headSize: [head.width, head.height],
        rowDisplay: getComputedStyle(cell.parentElement!).display,
        labelContent: getComputedStyle(cell, "::before").content,
        primaryLabel: getComputedStyle(root.querySelector("tbody td[data-primary]")!, "::before").content,
        tableScrolls:
          root.querySelector<HTMLElement>("[role='region']")!.scrollWidth >
          root.querySelector<HTMLElement>("[role='region']")!.clientWidth,
      };
    });
    expect(result.headSize[0]).toBeLessThanOrEqual(1);
    expect(result.headSize[1]).toBeLessThanOrEqual(1);
    expect(result.rowDisplay).toBe("flex");
    expect(result.labelContent).toContain("Owner");
    expect(["none", "normal"]).toContain(result.primaryLabel);
    expect(result.tableScrolls).toBe(false);
  });

  test("above 40rem it is a table", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openStory(page, id("default"));
    const display = await page.evaluate(
      () => getComputedStyle(document.querySelector("#storybook-root tbody tr")!).display,
    );
    expect(display).toBe("table-row");
  });

  test("a table in a narrow column turns into cards on a wide page", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openStory(page, id("narrow-container"));
    const display = await page.evaluate(
      () => getComputedStyle(document.querySelector("#storybook-root tbody tr")!).display,
    );
    expect(display).toBe("flex");
  });

  for (const name of [
    "phone-cards",
    "scroll-on-phone",
    "long-content-on-phone",
    "empty-on-phone",
    "footer-on-phone",
  ]) {
    test(`${name} does not widen the page at 390px`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 800 });
      await openStory(page, id(name));
      expect(await pageOverflow(page)).toBeLessThanOrEqual(0);
    });
  }

  test("scroll mode scrolls inside the region and draws the edge shadow gradients", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await openStory(page, id("scroll-on-phone"));
    const region = await page.evaluate(() => {
      const el = document.querySelector<HTMLElement>("#storybook-root [role='region']")!;
      return {
        scrolls: el.scrollWidth > el.clientWidth,
        gradients: (getComputedStyle(el).backgroundImage.match(/gradient/g) ?? []).length,
      };
    });
    expect(region.scrolls).toBe(true);
    expect(region.gradients).toBe(4);
  });

  test("a sortable header shows while it has keyboard focus in card mode", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await openStory(page, id("sortable-on-phone"));
    const before = await page.evaluate(
      () => document.querySelector("#storybook-root thead")!.getBoundingClientRect().height,
    );
    expect(before).toBeLessThanOrEqual(1);
    await page.getByRole("button", { name: "Project" }).focus();
    const after = await page.evaluate(
      () => document.querySelector("#storybook-root thead")!.getBoundingClientRect().height,
    );
    expect(after).toBeGreaterThan(20);
  });

  for (const width of [1440, 390]) {
    test(`flush frame drops the outer border, radius and background at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      const frameStyle = async (name: string) => {
        await openStory(page, id(name));
        return page.evaluate(() => {
          const frame = document.querySelector("#storybook-root [role='region']")!.parentElement!;
          const style = getComputedStyle(frame);
          const head = document.querySelector("#storybook-root th")!;
          return {
            border: style.borderTopWidth,
            radius: style.borderTopLeftRadius,
            background: style.backgroundColor,
            headRule: getComputedStyle(head).borderBottomWidth,
            overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          };
        });
      };
      const flush = await frameStyle("flush-in-panel");
      expect(flush.border).toBe("0px");
      expect(flush.radius).toBe("0px");
      expect(flush.background).toBe("rgba(0, 0, 0, 0)");
      expect(flush.headRule).not.toBe("0px");
      expect(flush.overflow).toBeLessThanOrEqual(0);
      if (width < 640) {
        const card = await page.evaluate(
          () => getComputedStyle(document.querySelector("#storybook-root tbody tr")!).borderTopWidth,
        );
        expect(card).not.toBe("0px");
      }
      if (width > 640) {
        const framed = await frameStyle("framed");
        expect(framed.border).not.toBe("0px");
        expect(framed.radius).not.toBe("0px");
      }
    });

    test(`a link beside the row control is hit by elementFromPoint, the row elsewhere hits the control at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await openStory(page, id("named-row-control"));
      const hits = await page.evaluate(() => {
        const row = document.querySelector<HTMLElement>("#storybook-root tbody tr")!;
        const control = row.querySelector<HTMLAnchorElement>("a[aria-label^='Open details']")!;
        const secondary = row.querySelector<HTMLAnchorElement>("a[href^='mailto:']")!;
        const centre = (el: Element) => {
          const box = el.getBoundingClientRect();
          return document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
        };
        const owner = row.querySelector("td[data-label='Owner']")!.getBoundingClientRect();
        const elsewhere = document.elementFromPoint(owner.left + 4, owner.top + 4);
        return {
          secondaryHit: centre(secondary) === secondary,
          nested: !!secondary.closest("a[aria-label^='Open details']"),
          sameCell: secondary.closest("td") === control.closest("td"),
          elsewhereIsControl: elsewhere?.closest("a") === control,
          controlHit: centre(control)?.closest("a") === control,
          order: !!(control.compareDocumentPosition(secondary) & Node.DOCUMENT_POSITION_FOLLOWING),
        };
      });
      expect(hits).toEqual({
        secondaryHit: true,
        nested: false,
        sameCell: true,
        elsewhereIsControl: true,
        controlHit: true,
        order: true,
      });
    });

    test(`the scroll margin hook keeps a focused row control clear of the sticky bar at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 700 });
      await openStory(page, id("scroll-margin"));
      const result = await page.evaluate(async () => {
        const links = [...document.querySelectorAll<HTMLElement>("#storybook-root tbody a")];
        const target = links[2]!;
        const lowest = links[links.length - 1]!;
        lowest.focus();
        await new Promise((resolve) => setTimeout(resolve, 100));
        target.focus();
        await new Promise((resolve) => setTimeout(resolve, 100));
        const bar = document.querySelector("[data-testid='sticky-bar']")!.getBoundingClientRect();
        return {
          margin: getComputedStyle(target).scrollMarginBlockStart,
          top: target.getBoundingClientRect().top,
          barBottom: bar.bottom,
        };
      });
      expect(result.margin).toBe("64px");
      expect(result.top).toBeGreaterThanOrEqual(result.barBottom);
    });
  }

  test("the scroll margin defaults to zero", async ({ page }) => {
    await openStory(page, id("clickable-rows-as-links"));
    const margin = await page.evaluate(
      () => getComputedStyle(document.querySelector("#storybook-root tbody a")!).scrollMarginBlockStart,
    );
    expect(margin).toBe("0px");
  });

  for (const width of [320, 390, 1440]) {
    test(`at ${width}px a card badge is never clipped and a card label never splits inside a word`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await openStory(page, id("card-long-labels-and-badges"));
      const result = await page.evaluate(() => {
        const root = document.querySelector("#storybook-root")!;
        const badges = [...root.querySelectorAll<HTMLElement>("tbody td[data-label='Status'] > span")];
        const cell = root.querySelector<HTMLElement>("tbody td[data-label='Contributions']")!;
        // Measure the label's longest word against the width the label really has.
        const probe = document.createElement("span");
        const labelStyle = getComputedStyle(cell, "::before");
        probe.textContent = "CONTRIBUTIONS";
        probe.style.cssText = `position:absolute;visibility:hidden;white-space:nowrap;font:${labelStyle.font};letter-spacing:${labelStyle.letterSpacing}`;
        document.body.append(probe);
        const wordWidth = probe.getBoundingClientRect().width;
        probe.remove();
        const columns = getComputedStyle(cell).gridTemplateColumns.split(" ");
        return {
          cards: getComputedStyle(cell.parentElement!).display === "flex",
          clipped: badges.map(
            (badge) =>
              badge.scrollWidth > badge.clientWidth + 1 || badge.scrollHeight > badge.clientHeight + 1,
          ),
          badgeInside: badges.every(
            (badge) =>
              badge.getBoundingClientRect().right <= badge.closest("td")!.getBoundingClientRect().right + 1,
          ),
          labelColumn: parseFloat(columns[0]!),
          wordWidth,
          overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      });
      expect(result.clipped).toEqual([false, false]);
      expect(result.badgeInside).toBe(true);
      expect(result.overflowX).toBeLessThanOrEqual(0);
      if (width < 1000) {
        expect(result.cards).toBe(true);
        // The label column is at least as wide as its longest word, so the word is not broken.
        expect(result.labelColumn).toBeGreaterThanOrEqual(result.wordWidth - 1);
      } else {
        expect(result.cards).toBe(false);
      }
    });
  }

  for (const width of [320, 390, 1440]) {
    test(`at ${width}px the actions column fits its buttons at the end edge, in both text directions`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const dir of ["ltr", "rtl"] as const) {
        await openStory(page, id("few-columns-actions"), "default", "light", dir);
        const result = await page.evaluate(() => {
          const root = document.querySelector("#storybook-root")!;
          const cell = root.querySelector<HTMLElement>("tbody td[data-actions]")!;
          const row = cell.parentElement!.getBoundingClientRect();
          const cellBox = cell.getBoundingClientRect();
          const button = cell.querySelector("button")!.getBoundingClientRect();
          const rtl = getComputedStyle(cell).direction === "rtl";
          const padding = parseFloat(getComputedStyle(cell).paddingInlineEnd);
          return {
            table: getComputedStyle(cell.parentElement!).display === "table-row",
            cellWidth: cellBox.width,
            buttonWidth: button.width,
            // Distance from the button to the row's end edge.
            gap: rtl ? button.left - row.left : row.right - button.right,
            padding,
          };
        });
        if (width === 1440) {
          expect(result.table, dir).toBe(true);
          expect(result.cellWidth, dir).toBeLessThan(result.buttonWidth + 80);
          expect(Math.abs(result.gap - result.padding), dir).toBeLessThanOrEqual(2);
        } else {
          // Card mode is unchanged: the actions cell spans the card.
          expect(result.table, dir).toBe(false);
          expect(result.cellWidth, dir).toBeGreaterThan(result.buttonWidth + 80);
        }
      }
    });
  }

  test("at 1440px a wrapping actions cell wraps instead of scrolling, end-aligned", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openStory(page, id("numeric-and-wrapping-actions"));
    const result = await page.evaluate(() => {
      const root = document.querySelector("#storybook-root")!;
      const scroller = root.querySelector<HTMLElement>("[role='region']")!;
      const cell = root.querySelector<HTMLElement>("tbody td[data-actions]")!;
      const buttons = [...cell.querySelectorAll("button")].map((b) => b.getBoundingClientRect());
      return {
        table: getComputedStyle(cell.parentElement!).display === "table-row",
        scrolls: scroller.scrollWidth > scroller.clientWidth,
        lines: new Set(buttons.map((rect) => Math.round(rect.top))).size,
        buttonWordsIntact: buttons.every((rect) => rect.height < 48),
        endGap: cell.getBoundingClientRect().right - Math.max(...buttons.map((rect) => rect.right)),
      };
    });
    expect(result.table).toBe(true);
    expect(result.scrolls).toBe(false);
    expect(result.lines).toBeGreaterThan(1);
    expect(result.buttonWordsIntact).toBe(true);
    expect(result.endGap).toBeLessThanOrEqual(20);
  });

  test("a wrapping actions column takes one line when there is room and wraps when there is not", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openStory(page, id("wrapping-actions-with-room"));
    const measure = (width: string) =>
      page.evaluate((width) => {
        document.querySelector<HTMLElement>("[data-testid='room']")!.style.inlineSize = width;
        const read = (name: string) => {
          const box = document.querySelector(`[data-testid='${name}']`)!;
          const scroller = box.querySelector<HTMLElement>("[role='region']")!;
          const rows = [...box.querySelectorAll("tbody tr")].map((row) => {
            const tops = new Set(
              [...row.querySelectorAll("td[data-actions] button")].map((button) =>
                Math.round(button.getBoundingClientRect().top),
              ),
            );
            return { lines: tops.size, height: row.getBoundingClientRect().height };
          });
          const cell = box.querySelector<HTMLElement>("td[data-actions]")!;
          return {
            table: getComputedStyle(cell.parentElement!).display === "table-row",
            lines: rows.map((row) => row.lines),
            rowHeight: rows[0]!.height,
            overflow: scroller.scrollWidth - scroller.clientWidth,
            cellWidth: cell.getBoundingClientRect().width,
            endGap: Math.round(
              cell.getBoundingClientRect().right -
                [...cell.querySelectorAll("button")].reduce(
                  (max, b) => Math.max(max, b.getBoundingClientRect().right),
                  0,
                ),
            ),
          };
        };
        return { wrapping: read("wrapping"), plain: read("plain") };
      }, width);

    const wide = await measure("72rem");
    expect(wide.wrapping.table).toBe(true);
    expect(wide.wrapping.lines).toEqual([1, 1]);
    expect(wide.wrapping.overflow).toBe(0);
    expect(wide.wrapping.cellWidth).toBeGreaterThanOrEqual(wide.plain.cellWidth - 1);
    expect(wide.plain.lines).toEqual([1, 1]);

    const narrow = await measure("42rem");
    expect(narrow.wrapping.table).toBe(true);
    expect(narrow.wrapping.lines.every((lines) => lines > 1)).toBe(true);
    expect(narrow.wrapping.overflow).toBeLessThanOrEqual(narrow.plain.overflow);
    expect(narrow.wrapping.endGap).toBeLessThanOrEqual(20);
    expect(narrow.plain.lines).toEqual([1, 1]);
    expect(narrow.plain.overflow).toBeGreaterThan(0);
  });

  test("at 1440px ISO dates and date-times in numeric cells stay on one line", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openStory(page, id("tight-numeric-columns"));
    const result = await page.evaluate(() => {
      const oneLine = (cell: Element) => {
        const range = document.createRange();
        range.selectNodeContents(cell);
        return new Set([...range.getClientRects()].map((rect) => Math.round(rect.top))).size === 1;
      };
      const cells = [...document.querySelectorAll("#storybook-root tbody td[data-numeric]")];
      return {
        table: getComputedStyle(cells[0]!.parentElement!).display === "table-row",
        oneLine: cells.map(oneLine),
      };
    });
    expect(result.table).toBe(true);
    expect(result.oneLine.every(Boolean)).toBe(true);
  });

  test("flush on a translucent surface paints the covers with their own token, not the surface", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openStory(page, id("flush-translucent-surface"));
    const result = await page.evaluate(() => {
      const root = document.querySelector<HTMLElement>("#storybook-root")!;
      const scroller = root.querySelector<HTMLElement>("[role='region']")!;
      const resolve = (value: string) => {
        const probe = document.createElement("span");
        probe.style.backgroundColor = value;
        scroller.append(probe);
        const color = getComputedStyle(probe).backgroundColor;
        probe.remove();
        return color;
      };
      const [firstLayer] = getComputedStyle(scroller).backgroundImage.split("radial-gradient");
      return {
        cover: resolve("var(--lufia-table-cover-bg)"),
        surface: resolve("var(--lufia-table-bg)"),
        covers: firstLayer ?? "",
        overflows: scroller.scrollWidth > scroller.clientWidth,
      };
    });
    expect(result.cover).not.toEqual(result.surface);
    expect(result.covers).toContain(result.cover);
    expect(result.covers).not.toContain(result.surface);
    expect(result.overflows).toBe(false);
  });

  test("header typography hooks restyle the column headers and the card labels, defaults unchanged", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const header = () =>
      page.evaluate(() => {
        const th = document.querySelector<HTMLElement>("#storybook-root th")!;
        const style = getComputedStyle(th);
        return {
          transform: style.textTransform,
          size: style.fontSize,
          weight: style.fontWeight,
          spacing: style.letterSpacing,
          family: style.fontFamily,
          bodyFamily: getComputedStyle(document.querySelector("#storybook-root td")!).fontFamily,
        };
      });
    await openStory(page, id("default"));
    const base = await header();
    expect(base.transform).toBe("uppercase");
    expect(base.family).not.toBe(base.bodyFamily);
    expect(base.spacing).not.toBe("normal");

    await openStory(page, id("header-typography-hooks"));
    const hooked = await header();
    expect(hooked.transform).toBe("none");
    expect(hooked.family).toBe(hooked.bodyFamily);
    expect(hooked.spacing).toBe("normal");
    expect(hooked.weight).toBe("600");
    expect(hooked.size).not.toBe(base.size);

    await page.setViewportSize({ width: 390, height: 800 });
    await openStory(page, id("header-typography-hooks-on-phone"));
    const label = await page.evaluate(() => {
      const cell = document.querySelector<HTMLElement>("#storybook-root td[data-label]")!;
      const style = getComputedStyle(cell, "::before");
      return { transform: style.textTransform, spacing: style.letterSpacing, weight: style.fontWeight };
    });
    expect(label).toEqual({ transform: "none", spacing: "normal", weight: "600" });
    await openStory(page, id("phone-cards"));
    const plain = await page.evaluate(() => {
      const cell = document.querySelector<HTMLElement>("#storybook-root td[data-label]")!;
      return getComputedStyle(cell, "::before").textTransform;
    });
    expect(plain).toBe("uppercase");
  });

  test("the caption follows captionTone and the caption hooks", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openStory(page, id("visible-caption"));
    const read = () =>
      page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>("#storybook-root caption")].map((caption) => {
          const style = getComputedStyle(caption);
          return { color: style.color, size: style.fontSize, weight: style.fontWeight };
        }),
      );
    const [plain] = await read();
    await openStory(page, id("caption-tone"));
    const [muted, hooked] = await read();
    expect(muted!.color).not.toBe(plain!.color);
    expect(muted!.weight).toBe(plain!.weight);
    expect(hooked!.color).toBe(muted!.color);
    expect(hooked!.weight).toBe("400");
    expect(hooked!.size).not.toBe(plain!.size);
  });

  test("cells can be top aligned without moving the actions' shared centre line", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openStory(page, id("top-aligned-cells"));
    const result = await page.evaluate(() => {
      const row = document.querySelector<HTMLElement>("#storybook-root tbody tr")!;
      const [, note, actions] = [...row.children] as HTMLElement[];
      const buttons = [...actions!.querySelectorAll("button")].map((button) => {
        const box = button.getBoundingClientRect();
        return box.top + box.height / 2;
      });
      return {
        align: getComputedStyle(note!).verticalAlign,
        lines: Math.round(
          note!.getBoundingClientRect().height / parseFloat(getComputedStyle(note!).lineHeight),
        ),
        buttons,
      };
    });
    expect(result.align).toBe("top");
    expect(result.lines, "the prose cell is the reproduction").toBeGreaterThan(2);
    expect(result.buttons).toHaveLength(2);
    expect(Math.abs(result.buttons[0]! - result.buttons[1]!)).toBeLessThanOrEqual(1);
    // The short title cell starts at the top of the row, level with the first line of the prose.
    const rule = await page.evaluate(() => {
      const row = document.querySelector<HTMLElement>("#storybook-root tbody tr")!;
      const cell = row.children[0] as HTMLElement;
      const text = document.createRange();
      text.selectNodeContents(cell);
      return text.getBoundingClientRect().top - row.getBoundingClientRect().top;
    });
    const note = await page.evaluate(() => {
      const row = document.querySelector<HTMLElement>("#storybook-root tbody tr")!;
      const cell = row.children[1] as HTMLElement;
      const text = document.createRange();
      text.selectNodeContents(cell);
      return text.getBoundingClientRect().top - row.getBoundingClientRect().top;
    });
    expect(Math.abs(rule - note)).toBeLessThanOrEqual(2);
    await openStory(page, id("actions-alignment"));
    const middle = await page.evaluate(
      () => getComputedStyle(document.querySelector("#storybook-root td")!).verticalAlign,
    );
    expect(middle).toBe("middle");
  });

  test("the cell colour hook dims body cells but not the primary cell, in table and card mode", async ({
    page,
  }) => {
    const colours = (storyId: string) =>
      openStory(page, storyId).then(() =>
        page.evaluate(() => {
          const row = document.querySelector<HTMLElement>("#storybook-root tbody tr")!;
          const [primary, other] = [...row.children] as HTMLElement[];
          return { primary: getComputedStyle(primary!).color, other: getComputedStyle(other!).color };
        }),
      );
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const [story, size] of [
      ["dimmer-cells", { width: 1440, height: 900 }],
      ["dimmer-cells-on-phone", { width: 390, height: 800 }],
    ] as const) {
      await page.setViewportSize(size);
      const result = await colours(id(story));
      expect(result.other, story).not.toBe(result.primary);
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    const plain = await colours(id("default"));
    expect(plain.other).toBe(plain.primary);
  });

  test("idle scroll covers and shadows are not painted where scroll-driven animation is supported", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const sizes = () =>
      page.evaluate(() => {
        const scroller = document.querySelector<HTMLElement>("#storybook-root [role='region']")!;
        return {
          overflows: scroller.scrollWidth > scroller.clientWidth,
          supported: CSS.supports("animation-timeline", "scroll(self inline)"),
          // background-size of the four layers: cover, cover, shadow, shadow
          widths: getComputedStyle(scroller)
            .backgroundSize.split(",")
            .map((layer) => layer.trim().split(" ")[0]),
        };
      });
    await openStory(page, id("flush-translucent-idle"));
    const idle = await sizes();
    expect(idle.overflows).toBe(false);
    expect(idle.widths).toHaveLength(4);
    // Unsupported browsers keep today's always-painted edges (opaque surfaces are unaffected).
    expect(idle.widths, idle.supported ? "supported" : "fallback").toEqual(
      idle.supported ? ["0px", "0px", "0px", "0px"] : ["32px", "32px", "12px", "12px"],
    );

    await page.setViewportSize({ width: 390, height: 800 });
    await openStory(page, id("scroll-on-phone"));
    const busy = await sizes();
    expect(busy.overflows).toBe(true);
    expect(busy.widths).toEqual(["32px", "32px", "12px", "12px"]);
  });

  test("the controls of an actions cell share one centre line", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openStory(page, id("actions-alignment"));
    const centres = await page.evaluate(() =>
      [...document.querySelectorAll("#storybook-root td[data-actions]")].map((cell) =>
        [...cell.querySelectorAll("button")].map((button) => {
          const box = button.getBoundingClientRect();
          return box.top + box.height / 2;
        }),
      ),
    );
    for (const row of centres) {
      expect(row).toHaveLength(2);
      expect(Math.abs(row[0]! - row[1]!)).toBeLessThanOrEqual(1);
    }
  });

  test("a stretched labelled cell gives block content the full value width", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await openStory(page, id("card-controls"));
    const result = await page.evaluate(() => {
      const cell = document.querySelector<HTMLElement>('#storybook-root td[data-label="Progress"]')!;
      const bar = cell.querySelector<HTMLElement>('[role="progressbar"]')!;
      const status = document.querySelector<HTMLElement>('#storybook-root td[data-label="Status"]')!;
      const badge = status.firstElementChild as HTMLElement;
      return {
        cell: cell.getBoundingClientRect().width,
        bar: bar.getBoundingClientRect().width,
        status: status.getBoundingClientRect().width,
        badge: badge.getBoundingClientRect().width,
      };
    });
    expect(result.bar).toBeGreaterThan(result.cell * 0.9);
    // An unstretched cell keeps a badge at its natural width.
    expect(result.badge).toBeLessThan(result.status * 0.6);
  });

  test("in cards the primary cell is the title even as the third column, and the corner cell stays clear of it", async ({
    page,
  }) => {
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await openStory(page, id("card-controls"));
      const result = await page.evaluate(() => {
        const row = document.querySelector<HTMLElement>("#storybook-root tbody tr")!;
        const box = (el: Element) => el.getBoundingClientRect();
        const cells = [...row.children] as HTMLElement[];
        const title = cells.find((cell) => cell.hasAttribute("data-primary"))!;
        const corner = cells.find((cell) => cell.dataset.cardSlot === "corner")!;
        const actions = cells.find((cell) => cell.hasAttribute("data-actions"))!;
        const visible = cells.filter((cell) => !cell.hasAttribute("data-hide-in-cards") && cell !== corner);
        const range = document.createRange();
        range.selectNodeContents(title);
        const text = range.getBoundingClientRect();
        const rtl = getComputedStyle(row).direction === "rtl";
        return {
          firstTop: Math.min(...visible.map((cell) => box(cell).top)),
          titleTop: box(title).top,
          actionsAfterTitle: box(actions).top >= box(title).bottom - 1,
          actionsBeforeRest: box(actions).top < box(cells.find((c) => c.dataset.label === "Owner")!).top,
          cornerTop: box(corner).top - box(row).top,
          cornerEndGap: rtl ? box(corner).left - box(row).left : box(row).right - box(corner).right,
          cornerOverlapsText: !(
            text.right <= box(corner).left ||
            text.left >= box(corner).right ||
            text.bottom <= box(corner).top ||
            text.top >= box(corner).bottom
          ),
          corner: getComputedStyle(corner).position,
          hidden: box(row.querySelector('[data-label="Team"]')!).width,
        };
      });
      expect(result.titleTop, `${width}`).toBe(result.firstTop);
      expect(result.actionsAfterTitle && result.actionsBeforeRest, `${width}`).toBe(true);
      expect(result.corner).toBe("absolute");
      expect(result.cornerTop).toBeLessThan(16);
      expect(result.cornerEndGap).toBeLessThan(16);
      expect(result.cornerOverlapsText, `${width}`).toBe(false);
      expect(result.hidden).toBeLessThanOrEqual(1);
    }
  });

  test("cardLayout grid sets labelled cells in two columns at 390px and one at 320px", async ({ page }) => {
    const columns = async (width: number) => {
      await page.setViewportSize({ width, height: 900 });
      await openStory(page, id("card-controls-grid"));
      return page.evaluate(() => {
        const row = document.querySelector<HTMLElement>("#storybook-root tbody tr")!;
        const owner = row.querySelector<HTMLElement>('[data-label="Owner"]')!.getBoundingClientRect();
        const status = row.querySelector<HTMLElement>('[data-label="Status"]')!.getBoundingClientRect();
        const bar = row.querySelector<HTMLElement>('[data-label="Progress"]')!.getBoundingClientRect();
        return {
          sameLine: Math.abs(owner.top - status.top) < 2,
          distinctColumns: owner.left !== status.left,
          progressFull: bar.width > owner.width * 1.8,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      });
    };
    const phone = await columns(390);
    expect(phone.sameLine && phone.distinctColumns).toBe(true);
    expect(phone.progressFull).toBe(true);
    expect(phone.overflow).toBeLessThanOrEqual(0);
    const small = await columns(320);
    expect(small.sameLine).toBe(false);
    expect(small.overflow).toBeLessThanOrEqual(0);
  });

  test("cardColumns 3 puts three values on one line of the card at 390px and 320px, without overflow", async ({
    page,
  }) => {
    for (const [width, story] of [
      [390, "comparison-cards"],
      [320, "comparison-cards-smallest-phone"],
    ] as const) {
      await page.setViewportSize({ width, height: 900 });
      await openStory(page, id(story));
      const result = await page.evaluate(() => {
        const row = document.querySelector<HTMLElement>("#storybook-root tbody tr")!;
        const box = (label: string) =>
          row.querySelector<HTMLElement>(`[data-label="${label}"]`)!.getBoundingClientRect();
        const [a, b, c] = [box("Starter"), box("Team"), box("Scale")];
        const rowBox = row.getBoundingClientRect();
        return {
          sameLine: Math.abs(a.top - b.top) < 2 && Math.abs(b.top - c.top) < 2,
          ordered: a.left < b.left && b.left < c.left,
          insideRow: c.right <= rowBox.right + 1 && a.left >= rowBox.left - 1,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      });
      expect(result.sameLine, `${width}`).toBe(true);
      expect(result.ordered, `${width}`).toBe(true);
      expect(result.insideRow, `${width}`).toBe(true);
      expect(result.overflow, `${width}`).toBeLessThanOrEqual(0);
    }
  });

  test("an emphasised column is tinted in table and card mode and untinted cells are not", async ({
    page,
  }) => {
    for (const [width, story] of [
      [1440, "comparison-table"],
      [390, "comparison-cards"],
    ] as const) {
      await page.setViewportSize({ width, height: 900 });
      await openStory(page, id(story));
      const result = await page.evaluate(() => {
        const row = document.querySelector<HTMLElement>("#storybook-root tbody tr")!;
        const bg = (label: string) =>
          getComputedStyle(row.querySelector<HTMLElement>(`[data-label="${label}"]`)!).backgroundColor;
        return { starter: bg("Starter"), team: bg("Team") };
      });
      expect(result.starter, `${width}`).toBe("rgba(0, 0, 0, 0)");
      expect(result.team, `${width}`).not.toBe("rgba(0, 0, 0, 0)");
    }
  });

  test("a wrapping or abbreviated header lets a nine-column table fit at 1440px", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const measure = async (name: string) => {
      await openStory(page, id(name));
      return page.evaluate(() => {
        const scroller = document.querySelector<HTMLElement>("#storybook-root [role='region']")!;
        const headers = [...scroller.querySelectorAll<HTMLElement>("thead th")];
        const bottoms = headers.map((th) => th.getBoundingClientRect().bottom);
        const sortable = scroller.querySelector<HTMLElement>("th[aria-sort] button")!;
        return {
          scrolls: scroller.scrollWidth - scroller.clientWidth,
          twoLines: headers.some((th) => th.getBoundingClientRect().height > 50),
          alignBottom: headers.every((th) => getComputedStyle(th).verticalAlign === "bottom"),
          sameBottom: Math.max(...bottoms) - Math.min(...bottoms) < 1,
          sortableHeight: sortable.getBoundingClientRect().height,
          shortText: sortable.querySelector<HTMLElement>("[data-th-short]")?.textContent ?? null,
          fullWidth:
            sortable.querySelector<HTMLElement>("[data-th-full]")?.getBoundingClientRect().width ?? null,
        };
      });
    };
    const plain = await measure("wide-headers-plain");
    expect(plain.scrolls, "the plain table is the reproduction").toBeGreaterThan(0);
    expect(plain.twoLines).toBe(false);
    expect(plain.alignBottom).toBe(false);
    const wrap = await measure("wide-headers-wrap");
    expect(wrap.scrolls).toBeLessThanOrEqual(0);
    expect(wrap.twoLines).toBe(true);
    expect(wrap.alignBottom).toBe(true);
    expect(wrap.sameBottom).toBe(true);
    expect(wrap.sortableHeight).toBeGreaterThan(30);
    const abbr = await measure("wide-headers-abbr");
    expect(abbr.scrolls).toBeLessThanOrEqual(0);
    expect(abbr.shortText).toBe("Due");
    // The full name is in the tree but takes no room.
    expect(abbr.fullWidth).toBeLessThanOrEqual(1);
  });

  test("an abbreviated header keeps its full name for assistive tech and shows it in the revealed card header", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openStory(page, id("wide-headers-abbr"));
    await expect(page.getByRole("columnheader", { name: "Planned start date" })).toHaveAttribute(
      "abbr",
      "Start",
    );
    await expect(page.locator("th [data-th-short]").first()).toHaveAttribute("title", "Planned start date");
    await page.setViewportSize({ width: 390, height: 900 });
    await openStory(page, id("wide-headers-abbr-on-phone"));
    await page.locator("th[aria-sort] button").focus();
    const shown = await page.evaluate(() => {
      const root = document.querySelector("#storybook-root")!;
      const short = root.querySelector<HTMLElement>("th[aria-sort] [data-th-short]")!;
      const full = root.querySelector<HTMLElement>("th[aria-sort] [data-th-full]")!;
      return { short: getComputedStyle(short).display, full: full.getBoundingClientRect().width };
    });
    expect(shown.short).toBe("none");
    expect(shown.full).toBeGreaterThan(20);
  });

  test("in card mode the corner cell ignores an inline width and keeps its content size", async ({
    page,
  }) => {
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await openStory(page, id("corner-with-inline-width"));
      const result = await page.evaluate(() => {
        const cell = document.querySelector<HTMLElement>("#storybook-root td[data-card-slot='corner']")!;
        const button = cell.querySelector("button")!.getBoundingClientRect();
        return {
          card: getComputedStyle(cell.parentElement!).display === "flex",
          cell: cell.getBoundingClientRect().width,
          button: button.width,
        };
      });
      if (width < 1000) {
        expect(result.card).toBe(true);
        expect(result.cell).toBeGreaterThanOrEqual(result.button - 1);
      } else {
        // Table layout keeps the consumer's width.
        expect(result.card).toBe(false);
      }
    }
  });

  test("a long pill in a half-width grid cell stays on one line and takes its own row", async ({ page }) => {
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await openStory(page, id("grid-with-long-pills"));
      const result = await page.evaluate(() => {
        const row = document.querySelector<HTMLElement>("#storybook-root tbody tr")!;
        const cell = (label: string) => row.querySelector<HTMLElement>(`[data-label="${label}"]`)!;
        const pill = (label: string) =>
          cell(label).querySelector<HTMLElement>("span")!.getBoundingClientRect();
        const line = parseFloat(getComputedStyle(cell("Owner")).lineHeight);
        return {
          owner: cell("Owner").getBoundingClientRect(),
          status: cell("Status").getBoundingClientRect(),
          delivery: cell("Delivery").getBoundingClientRect(),
          review: cell("Review").getBoundingClientRect(),
          deliveryPillHeight: pill("Delivery").height,
          reviewPillHeight: pill("Review").height,
          line,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          rowBox: row.getBoundingClientRect(),
          pillRight: pill("Delivery").right,
        };
      });
      expect(Math.abs(result.deliveryPillHeight - result.reviewPillHeight), `${width}`).toBeLessThan(2);
      expect(result.overflow).toBeLessThanOrEqual(0);
      expect(result.pillRight).toBeLessThanOrEqual(result.rowBox.right + 1);
      if (width === 390) {
        // Short pairs still share a line; the long pill starts a new one.
        expect(Math.abs(result.owner.top - result.status.top)).toBeLessThan(2);
        expect(result.delivery.top).toBeGreaterThan(result.status.top + 10);
      }
    }
  });

  test("the card controls mirror in right-to-left", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await openStory(page, id("card-controls-grid"), "default", "light", "rtl");
    const result = await page.evaluate(() => {
      const row = document.querySelector<HTMLElement>("#storybook-root tbody tr")!;
      const corner = row.querySelector<HTMLElement>('[data-card-slot="corner"]')!.getBoundingClientRect();
      const box = row.getBoundingClientRect();
      return { cornerNearStart: corner.left - box.left, cornerNearEnd: box.right - corner.right };
    });
    expect(result.cornerNearStart).toBeLessThan(result.cornerNearEnd);
  });

  test("the table has no axe violations in cards, scroll and empty states", async ({ page }) => {
    for (const [name, width] of [
      ["default", 1280],
      ["phone-cards", 390],
      ["scroll-on-phone", 390],
      ["clickable-rows-as-links", 1280],
      ["empty", 1280],
      ["footer-with-pagination", 1280],
      ["flush-in-panel", 1280],
      ["flush-translucent-surface", 1280],
      ["card-long-labels-and-badges", 320],
      ["card-long-labels-and-badges", 390],
      ["few-columns-actions", 1280],
      ["numeric-and-wrapping-actions", 1440],
      ["wrapping-actions-with-room", 1440],
      ["tight-numeric-columns", 1440],
      ["named-row-control", 1280],
      ["named-row-control-on-phone", 390],
      ["row-state", 1280],
      ["plain-empty", 1280],
      ["actions-alignment", 1280],
      ["card-controls", 390],
      ["card-controls-grid", 390],
      ["card-controls-grid-smallest-phone", 320],
    ] as const) {
      await page.setViewportSize({ width, height: 800 });
      await openStory(page, id(name));
      expect(await runAxe(page, "#storybook-root"), name).toEqual([]);
    }
  });
});

test.describe("banner", () => {
  test("focusOnMount moves focus to the banner once and leaves it out of the tab order", async ({ page }) => {
    await openStory(page, "components-feedback-banner--focus-on-mount");
    await expect(page.getByRole("alert")).toHaveCount(0);
    await page.getByRole("button", { name: "Submit" }).click();
    const banner = page.getByRole("alert");
    await expect(banner).toBeFocused();
    await expect(banner).toHaveAttribute("tabindex", "-1");
    // Tab leaves the banner for the next control instead of cycling back to it.
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Submit" })).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(banner).not.toBeFocused();
  });
});

test.describe("disclosure", () => {
  test("Enter and Space open and close it, and a shared name keeps one open", async ({ page }) => {
    await openStory(page, "components-data-display-disclosure--exclusive-group");
    const details = page.locator("#storybook-root details");
    await expect(details.nth(0)).toHaveAttribute("open", "");
    await page.locator("#storybook-root summary").nth(1).focus();
    await page.keyboard.press("Enter");
    await expect(details.nth(1)).toHaveAttribute("open", "");
    await expect(details.nth(0)).not.toHaveAttribute("open", "");
    await page.keyboard.press("Space");
    await expect(details.nth(1)).not.toHaveAttribute("open", "");
  });

  test("the native marker is replaced by the chevron", async ({ page }) => {
    await openStory(page, "components-data-display-disclosure--default");
    const style = await page.evaluate(() => {
      const summary = document.querySelector("#storybook-root summary")!;
      return {
        listStyle: getComputedStyle(summary).listStyleType,
        chevron: getComputedStyle(summary, "::after").content,
      };
    });
    expect(style.listStyle).toBe("none");
    expect(style.chevron).not.toBe("none");
  });

  test("a plain disclosure takes consumer padding from a one-class rule or the custom properties", async ({
    page,
  }) => {
    await openStory(page, "components-data-display-disclosure--plain-with-consumer-padding");
    const padding = (index: number) =>
      page.evaluate((index) => {
        const root = document.querySelectorAll("#storybook-root details")[index]!;
        return {
          summary: getComputedStyle(root.querySelector("summary")!).paddingInlineStart,
          panel: getComputedStyle(root.querySelector(":scope > div")!).paddingInlineStart,
        };
      }, index);
    const fontSize = await page.evaluate(() =>
      parseFloat(getComputedStyle(document.documentElement).fontSize),
    );
    expect((await padding(0)).summary).toBe(`${fontSize}px`);
    expect((await padding(0)).panel).toBe(`${fontSize}px`);
    expect((await padding(1)).summary).toBe(`${fontSize * 1.5}px`);
    expect((await padding(1)).panel).toBe(`${fontSize * 1.5}px`);
  });

  test("a plain disclosure has no inline padding by default and a boxed one keeps its own", async ({
    page,
  }) => {
    await openStory(page, "components-data-display-disclosure--plain");
    const plain = await page.evaluate(() => {
      const root = document.querySelector("#storybook-root details")!;
      return [root.querySelector("summary")!, root.querySelector(":scope > div")!].map(
        (element) => getComputedStyle(element).paddingInlineStart,
      );
    });
    expect(plain).toEqual(["0px", "0px"]);
    await openStory(page, "components-data-display-disclosure--open-by-default");
    const boxed = await page.evaluate(() => {
      const root = document.querySelector("#storybook-root details")!;
      return [root.querySelector("summary")!, root.querySelector(":scope > div")!].map(
        (element) => getComputedStyle(element).paddingInlineStart,
      );
    });
    expect(boxed).toEqual(["16px", "16px"]);
  });

  test("compact is tighter than default, and the indicator can be replaced or removed", async ({ page }) => {
    const measure = () =>
      page.evaluate(() => {
        const summary = document.querySelector("#storybook-root summary")!;
        return {
          height: summary.getBoundingClientRect().height,
          paddingBlock: parseFloat(getComputedStyle(summary).paddingBlockStart),
          chevron: getComputedStyle(summary, "::after").display,
          children: summary.children.length,
        };
      });
    await page.setViewportSize({ width: 1440, height: 900 });
    await openStory(page, "components-data-display-disclosure--default");
    const regular = await measure();
    await openStory(page, "components-data-display-disclosure--compact");
    const compact = await measure();
    expect(compact.height).toBeLessThan(regular.height);
    expect(compact.paddingBlock).toBeLessThan(regular.paddingBlock);
    expect(regular.chevron).not.toBe("none");
    await openStory(page, "components-data-display-disclosure--no-indicator");
    expect((await measure()).chevron).toBe("none");
    await openStory(page, "components-data-display-disclosure--custom-indicator");
    const custom = await measure();
    expect(custom.chevron).toBe("none");
    expect(custom.children).toBe(1);
  });

  test("it has no axe violations open and closed, and in the classes-on-native-details story", async ({
    page,
  }) => {
    for (const name of [
      "open-by-default",
      "default",
      "classes-on-native-details",
      "compact",
      "custom-indicator",
      "no-indicator",
    ]) {
      await openStory(page, `components-data-display-disclosure--${name}`);
      expect(await runAxe(page, "#storybook-root"), name).toEqual([]);
    }
  });
});

test.describe("spinner", () => {
  test("it turns, and stands still under reduced motion", async ({ page }) => {
    await openStory(page, "components-feedback-spinner--default");
    const animation = () =>
      page.evaluate(
        () => getComputedStyle(document.querySelector("#storybook-root [role='status']")!).animationName,
      );
    expect(await animation()).not.toBe("none");
    await page.emulateMedia({ reducedMotion: "reduce" });
    expect(await animation()).toBe("none");
  });
});

test.describe("tabs", () => {
  test("arrow keys, Home and End move focus and the chosen tab, with one tab stop", async ({ page }) => {
    await openStory(page, "components-navigation-tabs--default");
    const tabs = page.getByRole("tab");
    await tabs.first().focus();
    await page.keyboard.press("ArrowRight");
    await expect(tabs.nth(1)).toBeFocused();
    await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tabpanel")).toContainText("What needs attention today");
    await page.keyboard.press("End");
    await expect(tabs.last()).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(tabs.first()).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("tabpanel")).toBeFocused();
  });

  test("right-to-left reverses Left and Right", async ({ page }) => {
    await openStory(page, "components-navigation-tabs--default", "default", "light", "rtl");
    const tabs = page.getByRole("tab");
    await tabs.first().focus();
    await page.keyboard.press("ArrowLeft");
    await expect(tabs.nth(1)).toBeFocused();
  });

  test("at 320px a long row scrolls inside itself and the page does not widen", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await openStory(page, "components-navigation-tabs--overflow");
    const list = page.getByRole("tablist");
    const sizes = await list.evaluate((element) => ({
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
      page: document.documentElement.scrollWidth,
      view: document.documentElement.clientWidth,
    }));
    expect(sizes.scrollWidth).toBeGreaterThan(sizes.clientWidth);
    expect(sizes.page).toBeLessThanOrEqual(sizes.view);
    await page.getByRole("tab").last().focus();
    await expect.poll(() => list.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  });

  test("the chosen tab shows an indicator and the focus ring is visible", async ({ page }) => {
    await openStory(page, "components-navigation-tabs--default");
    const indicator = () =>
      page.getByRole("tab", { selected: true }).evaluate((element) => ({
        background: getComputedStyle(element, "::after").backgroundColor,
        height: getComputedStyle(element, "::after").height,
      }));
    const chosen = await indicator();
    expect(chosen.background).not.toBe("rgba(0, 0, 0, 0)");
    expect(chosen.height).not.toBe("0px");
    await page.keyboard.press("Tab");
    const outline = await page.getByRole("tab", { selected: true }).evaluate((element) => {
      const style = getComputedStyle(element);
      return { style: style.outlineStyle, width: style.outlineWidth };
    });
    expect(outline.style).toBe("solid");
    expect(outline.width).not.toBe("0px");
  });

  test("links mode has no tablist and Tab visits every link", async ({ page }) => {
    await openStory(page, "components-navigation-tabs--links");
    await expect(page.getByRole("tablist")).toHaveCount(0);
    const links = page.getByRole("navigation", { name: "Sections" }).getByRole("link");
    await expect(links.first()).toHaveAttribute("aria-current", "page");
    await links.first().focus();
    await page.keyboard.press("Tab");
    await expect(links.nth(1)).toBeFocused();
  });
});

test.describe("filter links", () => {
  test("a long row wraps at 320px and the page does not widen", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await openStory(page, "components-navigation-filterlinks--wrapping");
    const nav = page.getByRole("navigation", { name: "Filter by status" });
    await expect(nav.getByRole("link")).toHaveCount(14);
    const sizes = await nav.evaluate((element) => ({
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
      page: document.documentElement.scrollWidth,
      view: document.documentElement.clientWidth,
    }));
    expect(sizes.scrollWidth).toBeLessThanOrEqual(sizes.clientWidth);
    expect(sizes.page).toBeLessThanOrEqual(sizes.view);
  });

  test("the current link is marked aria-current true and shows a focus ring", async ({ page }) => {
    await openStory(page, "components-navigation-filterlinks--default");
    const current = page.locator('a[aria-current="true"]');
    await expect(current).toHaveCount(1);
    await expect(current).toContainText("Open");
    await page.keyboard.press("Tab");
    const outline = await page
      .getByRole("link")
      .first()
      .evaluate((element) => getComputedStyle(element).outlineStyle);
    expect(outline).toBe("solid");
  });

  test("the links are at least 44px tall under a coarse pointer", async ({ browser }) => {
    const context = await browser.newContext({
      hasTouch: true,
      isMobile: true,
      viewport: { width: 390, height: 800 },
    });
    const page = await context.newPage();
    await openStory(page, "components-navigation-filterlinks--default");
    const links = page.getByRole("navigation", { name: "Filter by status" }).getByRole("link");
    await expect(links.first()).toBeVisible();
    const heights = await links.evaluateAll((elements) =>
      elements.map((el) => (el as HTMLElement).offsetHeight),
    );
    expect(Math.min(...heights)).toBeGreaterThanOrEqual(44);
    await context.close();
  });
});

test.describe("one-way disclosure", () => {
  test("Enter shows the content, hides the button and keeps focus in the content", async ({ page }) => {
    await openStory(page, "components-data-display-onewaydisclosure--default");
    const trigger = page.getByRole("button", { name: "Fill in now" });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await trigger.focus();
    await page.keyboard.press("Enter");
    const region = page.getByRole("region", { name: "Your details" });
    await expect(region).toBeVisible();
    await expect(region).toBeFocused();
    await expect(trigger).toBeHidden();
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("Full name")).toBeFocused();
  });

  test("the button is at least 44px tall under a coarse pointer", async ({ browser }) => {
    const context = await browser.newContext({
      hasTouch: true,
      isMobile: true,
      viewport: { width: 390, height: 800 },
    });
    const page = await context.newPage();
    await openStory(page, "components-data-display-onewaydisclosure--default");
    const height = await page
      .getByRole("button", { name: "Fill in now" })
      .evaluate((element) => (element as HTMLElement).offsetHeight);
    expect(height).toBeGreaterThanOrEqual(44);
    await context.close();
  });
});

test.describe("overlay exits", () => {
  type Seen = { animation: string; pointerEvents: string; removed: boolean; frames: number };

  /**
   * Closes a surface and reports how it left. The watch runs inside the page, on every DOM change and every animation
   * frame, and is installed before the close, so a slow runner cannot miss a short exit between two round trips. It records the
   * first `-out` animation it sees and whether clicks pass through at that moment, counts the frames from the closing
   * key or pointer press, and settles when the surface leaves the document or, for one that stays mounted, when its
   * exit animation is over.
   */
  async function closeAndWatch(surface: Locator, close: () => Promise<void>): Promise<Seen> {
    const handle = await surface.elementHandle();
    if (!handle) throw new Error("surface not found");
    await handle.evaluate((element) => {
      const seen = { animation: "", pointerEvents: "", removed: false, frames: 0 };
      let closing = false;
      const start = () => {
        closing = true;
      };
      document.addEventListener("keydown", start, { capture: true, once: true });
      document.addEventListener("pointerdown", start, { capture: true, once: true });
      const deadline = performance.now() + 3000;
      (window as unknown as { lufiaExit: Promise<typeof seen> }).lufiaExit = new Promise((resolve) => {
        let settled = false;
        const settle = (removed: boolean) => {
          settled = true;
          observer.disconnect();
          resolve({ ...seen, removed });
        };
        // Returns true once there is nothing left to watch.
        const sample = () => {
          if (settled) return true;
          if (!element.isConnected) return (settle(true), true);
          const style = getComputedStyle(element);
          const exiting = /-out/.test(style.animationName);
          if (exiting && !seen.animation) {
            seen.animation = style.animationName;
            seen.pointerEvents = style.pointerEvents;
          }
          if ((seen.animation && !exiting) || performance.now() > deadline) return (settle(false), true);
          return false;
        };
        // A DOM change is sampled as it happens, so the exit is seen even when the runner drops frames.
        const observer = new MutationObserver(sample);
        observer.observe(document.documentElement, { attributes: true, childList: true, subtree: true });
        const tick = () => {
          if (sample()) return;
          if (closing) seen.frames += 1;
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    });
    await close();
    return surface.page().evaluate(() => (window as unknown as { lufiaExit: Promise<Seen> }).lufiaExit);
  }
  const connected = (handle: ElementHandle) => handle.evaluate((element) => element.isConnected);

  async function expectExit(surface: Locator, close: () => Promise<void>) {
    const seen = await closeAndWatch(surface, close);
    expect(seen.animation).toMatch(/-out/);
    expect(seen.pointerEvents).toBe("none");
    expect(seen.removed).toBe(true);
  }

  /** Under reduced motion there is no exit to wait for: the surface is gone within a frame or two of the press. */
  async function expectGoneAtOnce(surface: Locator, close: () => Promise<void>) {
    const seen = await closeAndWatch(surface, close);
    expect(seen.removed).toBe(true);
    expect(seen.animation).toBe("");
    expect(seen.frames).toBeLessThanOrEqual(2);
  }

  const phone = { width: 390, height: 844 };

  test.describe("more actions sheet", () => {
    const open = async (page: Page) => {
      await page.setViewportSize(phone);
      await openStory(page, "components-actions-moreactions--sheet");
      // The story opens by itself; close it and open it from the trigger as a person would.
      await page.keyboard.press("Escape");
      await expect(page.locator('[data-lufia-part="layer"]')).toHaveCount(0);
      const trigger = page.getByRole("button", { name: "More actions" });
      await trigger.click();
      await expect(page.getByRole("menu", { name: "More actions" })).toBeVisible();
      return trigger;
    };

    test("the sheet and its backdrop animate out on Escape, then leave the document and focus returns", async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      const trigger = await open(page);
      const backdrop = await page.locator('[data-lufia-part="layer"] > div').first().elementHandle();
      await expectExit(page.locator('[data-lufia-part="sheet"]'), () => page.keyboard.press("Escape"));
      expect(await connected(backdrop!)).toBe(false);
      await expect(page.locator('[data-lufia-part="layer"]')).toHaveCount(0);
      await expect(trigger).toBeFocused();
    });

    test("a press on the backdrop closes it with the same exit", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await open(page);
      await expectExit(page.locator('[data-lufia-part="sheet"]'), () => page.mouse.click(195, 40));
    });

    test("opening again during the exit goes straight back to open", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      const trigger = await open(page);
      await page.keyboard.press("Escape");
      await trigger.click();
      await page.waitForTimeout(500);
      await expect(page.getByRole("menu", { name: "More actions" })).toBeVisible();
      await expect(page.locator('[data-lufia-part="layer"]')).toHaveCount(1);
    });

    test("it leaves the document at once under reduced motion", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      const trigger = await open(page);
      await expectGoneAtOnce(page.locator('[data-lufia-part="sheet"]'), () => page.keyboard.press("Escape"));
      await expect(trigger).toBeFocused();
    });
  });

  test.describe("notification centre sheet", () => {
    const sheet = (page: Page) => page.locator('[data-lufia-part="notification-sheet"]');
    const open = async (page: Page) => {
      await page.setViewportSize(phone);
      await openStory(page, "components-overlays-notificationcenter--sheet-phone-390");
      // The story opens by itself; close it and open it from the bell as a person would.
      await page.keyboard.press("Escape");
      await expect(page.locator('[data-lufia-part="notification-layer"]')).toHaveCount(0);
      const trigger = page.getByRole("button", { name: /^Notifications/ });
      await trigger.click();
      await expect(sheet(page)).toBeVisible();
      return trigger;
    };

    test("animates out on Escape, then leaves the document and focus returns to the bell", async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      const trigger = await open(page);
      const layer = await page.locator('[data-lufia-part="notification-layer"]').elementHandle();
      await expectExit(sheet(page), () => page.keyboard.press("Escape"));
      expect(await connected(layer!)).toBe(false);
      await expect(trigger).toBeFocused();
    });

    test("opening again during the exit goes straight back to open", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      const trigger = await open(page);
      await page.keyboard.press("Escape");
      await trigger.click();
      await page.waitForTimeout(500);
      await expect(sheet(page)).toBeVisible();
    });

    test("it leaves the document at once under reduced motion", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      const trigger = await open(page);
      await expectGoneAtOnce(sheet(page), () => page.keyboard.press("Escape"));
      await expect(trigger).toBeFocused();
    });
  });

  test.describe("combobox popup", () => {
    const popup = (page: Page) => page.getByRole("listbox").locator("xpath=..");
    const open = async (page: Page) => {
      await openStory(page, "components-forms-combobox--default");
      const input = page.getByRole("combobox");
      await input.click();
      await expect(page.getByRole("listbox")).toBeVisible();
      return input;
    };

    test("animates out on Escape and leaves the document, with focus staying in the field", async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      const input = await open(page);
      await expectExit(popup(page), () => page.keyboard.press("Escape"));
      await expect(input).toBeFocused();
    });

    test("choosing an option animates out too and keeps the list as it was", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await open(page);
      const options = await page.getByRole("option").count();
      const choice = page.getByRole("option").nth(1);
      await expectExit(popup(page), () => choice.click());
      expect(options).toBeGreaterThan(1);
    });

    test("opening again during the exit goes straight back to open", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      const input = await open(page);
      await page.keyboard.press("Escape");
      await page.keyboard.press("ArrowDown");
      await page.waitForTimeout(500);
      await expect(page.getByRole("listbox")).toBeVisible();
      await expect(input).toHaveAttribute("aria-expanded", "true");
    });

    test("it leaves the document at once under reduced motion", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await open(page);
      await expectGoneAtOnce(popup(page), () => page.keyboard.press("Escape"));
    });
  });

  test.describe("shell tooltip", () => {
    const open = async (page: Page) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openStory(page, "components-navigation-appshell--rail");
      const link = page.getByRole("navigation").getByRole("link").first();
      await link.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      await expect(page.getByRole("tooltip", { includeHidden: true })).toHaveCount(1);
      return link;
    };
    const tooltip = (page: Page) => page.locator('[role="tooltip"]');

    test("fades out on Escape and leaves the document", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await open(page);
      await expectExit(tooltip(page), () => page.keyboard.press("Escape"));
    });

    test("showing again during the exit goes straight back to visible", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      const link = await open(page);
      await page.keyboard.press("Escape");
      await link.blur();
      await link.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      await page.waitForTimeout(500);
      await expect(tooltip(page)).toHaveCount(1);
    });

    test("it leaves the document at once under reduced motion", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await open(page);
      await expectGoneAtOnce(tooltip(page), () => page.keyboard.press("Escape"));
    });
  });

  test.describe("modal", () => {
    const dialog = (page: Page) => page.getByRole("dialog", { name: "Edit project" });

    test("a native dialog animates out, is closed and removed afterwards, and focus returns to the opener", async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await openStory(page, "components-overlays-modal--native-top-layer");
      await expect(dialog(page)).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.locator("dialog")).toHaveCount(0);
      const trigger = page.getByRole("button", { name: "Open modal" });
      await trigger.click();
      await expect(dialog(page)).toBeVisible();
      await expectExit(page.locator("dialog[open]"), () => page.keyboard.press("Escape"));
      await expect(trigger).toBeFocused();
    });

    test("a native dialog opened again during the exit stays open", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await openStory(page, "components-overlays-modal--native-top-layer");
      await page.keyboard.press("Escape");
      await expect(page.locator("dialog")).toHaveCount(0);
      const trigger = page.getByRole("button", { name: "Open modal" });
      await trigger.click();
      await expect(dialog(page)).toBeVisible();
      await page.keyboard.press("Escape");
      await page.evaluate(() => {
        [...document.querySelectorAll("button")].find((b) => b.textContent === "Open modal")?.click();
      });
      await page.waitForTimeout(500);
      await expect(page.locator("dialog[open]")).toHaveCount(1);
    });

    test("a native dialog is closed and removed at once under reduced motion", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await openStory(page, "components-overlays-modal--native-top-layer");
      await expect(dialog(page)).toBeVisible();
      await expectGoneAtOnce(page.locator("dialog[open]"), () => page.keyboard.press("Escape"));
    });

    test("a modal opened in the handler that closes a native dialog gets focus, and closing it returns focus to the first opener", async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await openStory(page, "components-overlays-modal--native-then-portal-modal");
      const opener = page.getByRole("button", { name: "Open first" });
      await opener.click();
      await expect(page.getByRole("dialog", { name: "First" })).toBeVisible();
      await page.getByRole("button", { name: "Continue" }).click();
      const second = page.getByRole("dialog", { name: "Second" });
      await expect(second).toBeVisible();
      // Right after opening, focus is inside the second modal, and no native dialog is left open over it.
      expect(await second.evaluate((element) => element.contains(document.activeElement))).toBe(true);
      await expect(page.locator("dialog[open]")).toHaveCount(0);
      await page.keyboard.press("Escape");
      await expect(second).toHaveCount(0);
      await expect(opener).toBeFocused();
    });

    test("closing the top of two stacked native dialogs still animates and returns focus into the lower one", async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await openStory(page, "components-overlays-modal--stacked-native-modals");
      await page.getByRole("button", { name: "Open first" }).click();
      const lower = page.getByRole("dialog", { name: "First" });
      await expect(lower).toBeVisible();
      const inner = page.getByRole("button", { name: "Open second" });
      await inner.click();
      const upper = page.getByRole("dialog", { name: "Second" });
      await expect(upper).toBeVisible();
      await expectExit(page.locator("dialog[open]", { has: page.getByText("Second dialog.") }), () =>
        page.keyboard.press("Escape"),
      );
      await expect(lower).toBeVisible();
      expect(await lower.evaluate((element) => element.contains(document.activeElement))).toBe(true);
      await expect(inner).toBeFocused();
    });

    test("Escape during a native dialog's exit does not close it a second time", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await openStory(page, "components-overlays-modal--native-top-layer");
      await page.keyboard.press("Escape");
      await expect(page.locator("dialog")).toHaveCount(0);
      const trigger = page.getByRole("button", { name: "Open modal" });
      await trigger.click();
      await expect(dialog(page)).toBeVisible();
      await page.keyboard.press("Escape");
      await page.keyboard.press("Escape");
      await expect(page.locator("dialog")).toHaveCount(0);
      await expect(trigger).toBeFocused();
    });

    test("a keep-mounted panel animates out, then hides, and keeps its state", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await openStory(page, "components-overlays-modal--keep-mounted");
      const trigger = page.getByRole("button", { name: "Open modal" });
      await trigger.click();
      await expect(dialog(page)).toBeVisible();
      await page.getByLabel("Project name").fill("Typed text");
      const panel = page.locator('[data-lufia-part="panel"][data-kept]');
      const seen = await closeAndWatch(panel, () => page.keyboard.press("Escape"));
      expect(seen.animation).toMatch(/-out/);
      expect(seen.pointerEvents).toBe("none");
      await expect(panel).toBeHidden();
      await expect(trigger).toBeFocused();
      await trigger.click();
      await expect(page.getByLabel("Project name")).toHaveValue("Typed text");
    });

    test("a keep-mounted panel is hidden at once under reduced motion", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await openStory(page, "components-overlays-modal--keep-mounted");
      await page.getByRole("button", { name: "Open modal" }).click();
      await expect(dialog(page)).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.locator('[data-lufia-part="panel"][data-kept]')).toBeHidden({ timeout: 150 });
    });
  });
});

test.describe("press feedback and spring", () => {
  const transformOf = (locator: ReturnType<Page["locator"]>) =>
    locator.evaluate((element) => getComputedStyle(element).transform);
  const thumbOf = (page: Page) => page.locator('[role="switch"] > span').first();

  test("a held button compresses to the press scale and a disabled one does not", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await openStory(page, "components-actions-button--primary");
    const button = page.getByRole("button").first();
    const box = (await button.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await expect.poll(() => transformOf(button)).toMatch(/^matrix\(0\.97,/);
    await page.mouse.up();
    await expect.poll(() => transformOf(button)).toBe("none");

    await openStory(page, "components-actions-button--disabled");
    const disabled = page.getByRole("button").first();
    const disabledBox = (await disabled.boundingBox())!;
    await page.mouse.move(disabledBox.x + disabledBox.width / 2, disabledBox.y + disabledBox.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(250);
    expect(await transformOf(disabled)).toBe("none");
    await page.mouse.up();
  });

  test("the switch thumb compresses on press and travels to its end state", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await openStory(page, "components-forms-switch--default");
    const toggle = page.getByRole("switch");
    const thumb = thumbOf(page);
    const box = (await toggle.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await expect.poll(() => thumb.evaluate((element) => getComputedStyle(element).scale)).toBe("0.97");
    await page.mouse.up();
    await expect(toggle).toBeChecked();
    // 1rem of travel (16px) once the spring has settled.
    await expect.poll(() => transformOf(thumb)).toBe("matrix(1, 0, 0, 1, 16, 0)");
  });

  test("the spring token is a sampled linear() curve where the browser supports it", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "linear() support is asserted in Chromium");
    await openStory(page, "components-forms-switch--default");
    const spring = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--lufia-motion-easing-spring").trim(),
    );
    expect(spring).toMatch(/^linear\(0, /);
  });

  test("under reduced motion the press scale is 1 and the switch still reaches its end state", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openStory(page, "components-actions-button--primary");
    const scales = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      return ["press", "press-subtle"].map((name) =>
        style.getPropertyValue(`--lufia-motion-scale-${name}`).trim(),
      );
    });
    expect(scales).toEqual(["1", "1"]);
    const button = page.getByRole("button").first();
    const box = (await button.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(100);
    expect(await transformOf(button)).toMatch(/^(none|matrix\(1, 0, 0, 1, 0, 0\))$/);
    await page.mouse.up();

    await openStory(page, "components-forms-switch--default");
    const toggle = page.getByRole("switch");
    await toggle.click();
    await expect(toggle).toBeChecked();
    await expect.poll(() => transformOf(thumbOf(page))).toBe("matrix(1, 0, 0, 1, 16, 0)");
  });
});

test.describe("button surface hooks", () => {
  const computed = (locator: Locator, properties: string[]) =>
    locator.evaluate((element, names) => {
      const style = getComputedStyle(element);
      return Object.fromEntries(names.map((name) => [name, style.getPropertyValue(name)]));
    }, properties);
  /** The rule the Button had before the border hook: a border of the fill colour, the fill under the padding box. */
  const OLD_BORDER = "border-color: var(--lufia-color-accent-default); background-origin: padding-box;";
  /** A screenshot once the colour transitions (150 ms) have settled. */
  /**
   * Pixels that differ between two screenshots of one element, outside the 12px (CSS) corner squares. The outline is excluded
   * because painting the fill under a transparent border and painting a border of the same colour over it differ only
   * in the anti-aliasing of the rounded outline.
   */
  const innerDifference = (page: Page, one: Buffer, other: Buffer) =>
    page.evaluate(
      async ([a, b]) => {
        const read = async (base64: string) => {
          const bitmap = await createImageBitmap(
            await (await fetch(`data:image/png;base64,${base64}`)).blob(),
          );
          const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
          const context = canvas.getContext("2d")!;
          context.drawImage(bitmap, 0, 0);
          return context.getImageData(0, 0, bitmap.width, bitmap.height);
        };
        const [first, second] = [await read(a!), await read(b!)];
        const reach = 12 * devicePixelRatio;
        let differing = 0;
        for (let y = 0; y < first.height; y++)
          for (let x = 0; x < first.width; x++) {
            const corner =
              (x < reach || x >= first.width - reach) && (y < reach || y >= first.height - reach);
            if (corner) continue;
            const at = (y * first.width + x) * 4;
            for (let channel = 0; channel < 4; channel++)
              if (first.data[at + channel] !== second.data[at + channel]) {
                differing++;
                break;
              }
          }
        return { width: first.width, height: first.height, differing };
      },
      [one.toString("base64"), other.toString("base64")],
    );
  const shot = async (locator: Locator) => {
    await locator.page().waitForTimeout(400);
    return locator.screenshot({ animations: "disabled", caret: "hide" });
  };

  test("defaults render as before: no shadow, no lift, and the same pixels inside the outline as a border of the fill colour", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await openStory(page, "components-actions-button--primary");
    const button = page.getByRole("button").first();
    await page.mouse.move(0, 0);
    const rest = await computed(button, ["box-shadow", "translate", "border-top-color", "background-image"]);
    expect(rest["box-shadow"]).toBe("none");
    expect(rest["translate"]).toBe("none");
    expect(rest["border-top-color"]).toBe("rgba(0, 0, 0, 0)");
    expect(rest["background-image"]).toBe("none");
    const themed = await shot(button);
    await button.evaluate((element, css) => element.setAttribute("style", css), OLD_BORDER);
    const before = await innerDifference(page, themed, await shot(button));
    expect(before.differing).toBe(0);

    await button.evaluate((element) => element.removeAttribute("style"));
    await button.hover();
    await expect.poll(() => button.evaluate((element) => getComputedStyle(element).transform)).toBe("none");
    expect((await computed(button, ["box-shadow"]))["box-shadow"]).toBe("none");
  });

  test("a plain colour in the fill hook still gives a matching border; a gradient gives none of currentcolor", async ({
    page,
  }) => {
    await openStory(page, "components-actions-button--primary");
    const button = page.getByRole("button").first();
    await page.mouse.move(0, 0);

    await button.evaluate((element) =>
      element.setAttribute("style", "--lufia-button-primary-bg: rgb(10, 100, 50)"),
    );
    await expect
      .poll(async () => (await computed(button, ["background-color"]))["background-color"])
      .toBe("rgb(10, 100, 50)");
    const solid = await shot(button);
    await button.evaluate((element) =>
      element.setAttribute(
        "style",
        "--lufia-button-primary-bg: rgb(10, 100, 50); border-color: rgb(10, 100, 50); background-origin: padding-box;",
      ),
    );
    expect((await innerDifference(page, solid, await shot(button))).differing).toBe(0);

    const gradient = "linear-gradient(135deg, rgb(10, 100, 50), rgb(20, 60, 120))";
    await button.evaluate(
      (element, value) => element.setAttribute("style", `--lufia-button-primary-bg: ${value}`),
      gradient,
    );
    const withGradient = await computed(button, ["background-image", "border-top-color", "color"]);
    expect(withGradient["background-image"]).toContain("linear-gradient");
    await expect
      .poll(async () => (await computed(button, ["border-top-color"]))["border-top-color"])
      .toBe("rgba(0, 0, 0, 0)");
    expect(withGradient["border-top-color"]).not.toBe(withGradient["color"]);

    await button.evaluate(
      (element, value) =>
        element.setAttribute(
          "style",
          `--lufia-button-primary-bg: ${value}; --lufia-button-primary-border: rgb(1, 2, 3); --lufia-button-primary-border-hover: rgb(4, 5, 6)`,
        ),
      gradient,
    );
    await expect
      .poll(async () => (await computed(button, ["border-top-color"]))["border-top-color"])
      .toBe("rgb(1, 2, 3)");
    await button.hover();
    await expect
      .poll(async () => (await computed(button, ["border-top-color"]))["border-top-color"])
      .toBe("rgb(4, 5, 6)");
  });

  test("the themed story has a fill gradient, a border, a shadow and a lift on hover that the press overrides", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await openStory(page, "components-actions-button--themed-surface");
    const light = page.getByRole("region", { name: "Themed surface, light" });
    const button = light.getByRole("button", { name: "Primary light" });
    await page.mouse.move(0, 0);
    const rest = await computed(button, ["background-image", "border-top-color", "box-shadow", "translate"]);
    expect(rest["background-image"]).toContain("linear-gradient");
    expect(rest["border-top-color"]).not.toBe("rgba(0, 0, 0, 0)");
    expect(rest["box-shadow"]).not.toBe("none");
    expect(rest["translate"]).toBe("none");

    await button.hover();
    await expect
      .poll(() => computed(button, ["translate"]).then((value) => value["translate"]))
      .toBe("0px -2px");
    const box = (await button.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await expect
      .poll(() =>
        computed(button, ["transform", "translate"]).then((v) => `${v["transform"]}|${v["translate"]}`),
      )
      .toMatch(/^matrix\(0\.97,.*\|none$/);
    await page.mouse.up();
    await expect
      .poll(() => computed(button, ["translate"]).then((value) => value["translate"]))
      .toBe("0px -2px");
  });

  test("a pointer resting on the bottom strip the lift vacates keeps the button hovered and lifted", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await openStory(page, "components-actions-button--themed-surface");
    const button = page
      .getByRole("region", { name: "Themed surface, light" })
      .getByRole("button", { name: "Primary light" });
    const box = (await button.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await expect
      .poll(() => computed(button, ["translate"]).then((value) => value["translate"]))
      .toBe("0px -2px");
    const samples: string[] = [];
    for (let step = 0; step < 30; step++) {
      await page.mouse.move(box.x + 10 + step, box.y + box.height - 0.5);
      await page.waitForTimeout(40);
      const state = await button.evaluate(
        (element) => `${element.matches(":hover")}|${getComputedStyle(element).translate}`,
      );
      samples.push(state);
    }
    expect(samples.filter((state) => state !== "true|0px -2px")).toEqual([]);
    // Back at rest nothing below the button takes the hover.
    await page.mouse.move(box.x + box.width / 2, box.y + box.height + 4);
    await expect.poll(() => button.evaluate((element) => element.matches(":hover"))).toBe(false);
  });

  test("a loading themed button keeps its resting shadow and does not lift", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await openStory(page, "components-actions-button--themed-surface");
    const button = page
      .getByRole("region", { name: "Themed surface, light" })
      .getByRole("button", { name: "Primary light" });
    await button.evaluate((element) => element.setAttribute("data-loading", ""));
    await page.mouse.move(0, 0);
    await page.waitForTimeout(300);
    const rest = await computed(button, ["box-shadow", "background-image"]);
    await button.hover();
    await page.waitForTimeout(300);
    expect(await computed(button, ["box-shadow", "background-image", "translate"])).toEqual({
      ...rest,
      translate: "none",
    });
  });

  test("a disabled themed button has no shadow and no lift on hover", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await openStory(page, "components-actions-button--themed-surface");
    const disabled = page.getByRole("region", { name: "Themed surface, light" }).getByRole("button", {
      name: "Disabled light",
    });
    await disabled.hover({ force: true });
    await page.waitForTimeout(250);
    const values = await computed(disabled, ["box-shadow", "translate", "transform"]);
    expect(values).toEqual({ "box-shadow": "none", translate: "none", transform: "none" });
  });

  test("the lift is dropped under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openStory(page, "components-actions-button--themed-surface");
    const button = page
      .getByRole("region", { name: "Themed surface, light" })
      .getByRole("button", { name: "Primary light" });
    await button.hover();
    await page.waitForTimeout(250);
    expect((await computed(button, ["translate"]))["translate"]).toBe("none");
  });

  test("the themed story passes axe in light and dark", async ({ page }) => {
    await openStory(page, "components-actions-button--themed-surface");
    expect(await runAxe(page, "#storybook-root")).toEqual([]);
    await openStory(page, "components-actions-button--themed-surface", "default", "dark");
    expect(await runAxe(page, "#storybook-root")).toEqual([]);
  });

  test.describe("without hover", () => {
    test.use({ hasTouch: true, isMobile: true });

    test("the lift does not apply where the pointer cannot hover", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await openStory(page, "components-actions-button--themed-surface");
      expect(await page.evaluate(() => matchMedia("(hover: hover)").matches)).toBe(false);
      const button = page
        .getByRole("region", { name: "Themed surface, light" })
        .getByRole("button", { name: "Primary light" });
      await button.hover();
      await page.waitForTimeout(250);
      expect((await computed(button, ["translate"]))["translate"]).toBe("none");
    });
  });
});
