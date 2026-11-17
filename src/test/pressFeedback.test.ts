import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(`src/components/${path}`, "utf8");

/** The declaration blocks whose selector list contains an `:active` rule. */
function pressRules(css: string): { selector: string; body: string }[] {
  const rules: { selector: string; body: string }[] = [];
  for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = (match[1] ?? "").replace(/\/\*[\s\S]*?\*\//g, "").trim();
    if (selector.includes(":active")) rules.push({ selector, body: match[2] ?? "" });
  }
  return rules;
}

const PRESS =
  /(?:transform|scale):\s*scale\(var\(--lufia-motion-scale-press\)\)|scale:\s*var\(--lufia-motion-scale-press\)/;
const SUBTLE = /(?:transform:\s*scale\(var\(--lufia-motion-scale-press-subtle\)\))/;

type Control = {
  name: string;
  file: string;
  /** The press token the control reads. */
  token: RegExp;
  /** The disabled markers the press selector must exclude; empty when the control cannot be disabled. */
  disabled: string[];
  /** Matches the selector that carries the press rule. */
  selector: RegExp;
};

const controls: Control[] = [
  {
    name: "Button",
    file: "Button/Button.module.css",
    token: PRESS,
    disabled: [":disabled", "aria-disabled"],
    selector: /^\.root:active/,
  },
  {
    name: "Switch thumb",
    file: "Switch/Switch.module.css",
    token: PRESS,
    disabled: [":disabled"],
    selector: /\.switch:active.*\.thumb/,
  },
  {
    name: "SwitchInput thumb",
    file: "Switch/Switch.module.css",
    token: PRESS,
    disabled: [":disabled"],
    selector: /\.input:active.*::after/,
  },
  {
    name: "Checkbox",
    file: "Checkbox/Checkbox.module.css",
    token: PRESS,
    disabled: [":disabled"],
    selector: /\.row:active \.input/,
  },
  {
    name: "Radio",
    file: "RadioGroup/RadioGroup.module.css",
    token: PRESS,
    disabled: [":disabled"],
    selector: /\.option:active.*\.circle/,
  },
  {
    name: "SegmentedToggle",
    file: "SegmentedToggle/SegmentedToggle.module.css",
    token: SUBTLE,
    disabled: [":disabled"],
    selector: /\.segment:active/,
  },
  {
    name: "PeerNav",
    file: "PeerNav/PeerNav.module.css",
    token: SUBTLE,
    disabled: [":disabled", "aria-disabled"],
    selector: /\.item:active/,
  },
  {
    name: "Tabs",
    file: "Tabs/Tabs.module.css",
    token: SUBTLE,
    disabled: [":disabled", "aria-disabled"],
    selector: /\.tab:active/,
  },
  {
    name: "NavRow",
    file: "NavRow/NavRow.module.css",
    token: SUBTLE,
    disabled: ["data-disabled"],
    selector: /button\.root:active/,
  },
  {
    name: "Card",
    file: "Card/Card.module.css",
    token: SUBTLE,
    disabled: [],
    selector: /\[data-interactive\]:active/,
  },
  {
    name: "Pagination",
    file: "Pagination/Pagination.module.css",
    token: SUBTLE,
    disabled: [":disabled", "aria-disabled"],
    selector: /\.control:active/,
  },
  {
    name: "FilterLinks",
    file: "FilterLinks/FilterLinks.module.css",
    token: SUBTLE,
    disabled: [],
    selector: /\.chip:active/,
  },
  {
    name: "MobileFloatBar",
    file: "AppShell/MobileFloatBar.module.css",
    token: PRESS,
    disabled: [],
    selector: /\[data-variant="primary"\]:active/,
  },
  {
    name: "StatTile",
    file: "StatTile/StatTile.module.css",
    token: SUBTLE,
    disabled: [],
    selector: /\[data-interactive\]:active/,
  },
];

describe("press feedback", () => {
  it.each(controls)("$name presses with a scale token and skips a disabled control", (control) => {
    const rule = pressRules(read(control.file)).find(({ selector }) => control.selector.test(selector));
    expect(rule, `${control.name} has no :active rule`).toBeDefined();
    expect(rule?.body).toMatch(control.token);
    for (const marker of control.disabled) expect(rule?.selector).toContain(marker);
  });

  it("uses no literal scale in a press rule of any control", () => {
    for (const { file } of controls) {
      for (const { selector, body } of pressRules(read(file))) {
        expect(body, `${file}: ${selector}`).not.toMatch(/scale\(\s*0?\.\d+/);
      }
    }
  });

  it("eases the switch thumb with the spring and never the dialog-like surfaces", () => {
    expect(read("Switch/Switch.module.css")).toMatch(
      /transform var\(--lufia-motion-duration-fast\) var\(--lufia-motion-easing-spring\)/,
    );
    expect(read("SegmentedToggle/SegmentedToggle.module.css")).toMatch(/easing-spring/);
    expect(read("PeerNav/PeerNav.module.css")).toMatch(/easing-spring/);
    for (const file of [
      "Modal/Modal.module.css",
      "Popover/Popover.module.css",
      "Menu/Menu.module.css",
      "Toast/Toast.module.css",
    ]) {
      expect(read(file), file).not.toContain("easing-spring");
    }
  });

  it("draws a checked radio dot and checkbox mark in with a transition, and fades them out plainly", () => {
    const radio = read("RadioGroup/RadioGroup.module.css");
    expect(radio).toMatch(/\.option\[aria-checked="true"\] \.circle::after \{[^}]*easing-spring/);
    const checkbox = read("Checkbox/Checkbox.module.css");
    expect(checkbox).toMatch(/\.input:checked::after \{[^}]*clip-path: polygon[^}]*transition: clip-path/);
    expect(checkbox).toMatch(/\.input::after \{[^}]*opacity var\(--lufia-motion-duration-instant\)/);
  });
});
