// Chromium probe: the computed Card body padding for every shorthand shape, state and axis token.
// jsdom does not implement cascade layers, so this runs in a real browser. Usage:
//   PLAYWRIGHT_MODULE=/path/to/node_modules/playwright-core/index.mjs node scripts/probes/card-padding.mjs
// It exits non-zero on the first mismatch. The expectations are the values the pre-axis stylesheet produced
// (`padding: var(--lufia-card-body-padding, var(--card-padding))`).
import { readFileSync } from "node:fs";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? "playwright-core");
const css = readFileSync("src/components/Card/Card.module.css", "utf8");

const OLD = `
.root{--card-padding:1.25rem}
.root[data-padding="sm"]{--card-padding:.75rem}
.body{padding:var(--lufia-card-body-padding,var(--card-padding))}
.header + .body{padding-block-start:0}
.root[data-flush]>.body{padding:0}
.root[data-divider]:not([data-flush])>.header + .body{padding-block-start:var(--lufia-card-body-padding,var(--card-padding))}
`;

const states = [
  { name: "default", attrs: "", header: false },
  { name: "header", attrs: "", header: true },
  { name: "divider", attrs: "data-divider", header: true },
  { name: "flush", attrs: "data-flush", header: true },
  { name: "flush+divider", attrs: "data-flush data-divider", header: true },
  { name: "sm+divider", attrs: 'data-padding="sm" data-divider', header: true },
];
const shorthands = [undefined, "1rem", "1rem 1.5rem", "1px 2px 3px 4px"];
const axisCases = [{}, { block: "2px" }, { inline: "6px" }, { block: "2px", inline: "6px" }];

const browser = await chromium.launch();
const page = await browser.newPage();
const measure = async (stylesheet, state, shorthand, axis) => {
  const vars = [
    shorthand && `--lufia-card-body-padding:${shorthand}`,
    axis.block && `--lufia-card-body-padding-block:${axis.block}`,
    axis.inline && `--lufia-card-body-padding-inline:${axis.inline}`,
  ].filter(Boolean);
  await page.setContent(
    `<style>${stylesheet}</style><div class="root" ${state.attrs} style="${vars.join(";")}">${
      state.header ? '<div class="header">h</div>' : ""
    }<div class="body">b</div></div>`,
  );
  return page.$eval(".body", (el) => {
    const s = getComputedStyle(el);
    return [s.paddingTop, s.paddingRight, s.paddingBottom, s.paddingLeft].join(" ");
  });
};

let failures = 0;
for (const state of states)
  for (const shorthand of shorthands) {
    let expected = await measure(OLD, state, shorthand, {});
    // Known difference: with a multi-value shorthand the old divider rule was an invalid declaration (computed 0), so the
    // body touched the rule. The new rule reverts to the shorthand layer and keeps the intended top padding.
    if (state.attrs.includes("data-divider") && !state.attrs.includes("flush") && shorthand?.includes(" ")) {
      const [top, ...rest] = (await measure(OLD, states[0], shorthand, {})).split(" ");
      expected = [top, ...rest].join(" ");
    }
    const got = await measure(css, state, shorthand, {});
    const ok = expected === got;
    if (!ok) failures++;
    console.log(
      `${ok ? "ok  " : "FAIL"} ${state.name} | ${shorthand ?? "(none)"} | old ${expected} | new ${got}`,
    );
  }
// Axis tokens: they override their own axis only; the other axis keeps the shorthand.
for (const shorthand of shorthands.slice(1))
  for (const axis of axisCases.slice(1)) {
    const base = (await measure(OLD, states[0], shorthand, {})).split(" ");
    const got = (await measure(css, states[0], shorthand, axis)).split(" ");
    const expected = [
      axis.block ?? base[0],
      axis.inline ?? base[1],
      axis.block ?? base[2],
      axis.inline ?? base[3],
    ].join(" ");
    const ok = expected === got.join(" ");
    if (!ok) failures++;
    console.log(
      `${ok ? "ok  " : "FAIL"} axis ${JSON.stringify(axis)} | ${shorthand} | want ${expected} | got ${got.join(" ")}`,
    );
  }
// The divider joint reads the block token.
{
  const got = await measure(css, states[2], "1rem 1.5rem", { block: "2px" });
  const ok = got.split(" ")[0] === "2px";
  if (!ok) failures++;
  console.log(`${ok ? "ok  " : "FAIL"} divider uses block token | ${got}`);
}
await browser.close();
process.exit(failures ? 1 : 0);
