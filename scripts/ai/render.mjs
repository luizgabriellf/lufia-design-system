/**
 * Renders the committed AI-layer outputs from the manifest: one Markdown spec per component, `llms.txt`,
 * `llms-full.txt` and `components.json`. Pure: it returns a map of repo-relative path to file content.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { REPO_BLOB, REPO_URL } from "../../src/docs/blocks/links.ts";
import { PACKAGE_NAME, ROOT, buildManifest } from "./build-manifest.mjs";

export const SITE = "https://luizgabriellf.github.io/lufia-design-system/";
export const OUT = "docs/ai";

const cell = (text) =>
  String(text ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\|/g, "\\|")
    .replace(/\n/g, " ");
const code = (text) => `\`${String(text).replace(/`/g, "'")}\``;
const read = (file) => readFileSync(path.join(ROOT, file), "utf8").trimEnd();

function table(headers, rows) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(cell).join(" | ")} |`),
  ].join("\n");
}

/** The "Variants" block of a discriminated-union props type; empty for plain props. */
function variantsBlock(variants) {
  if (!variants) return "";
  const lines = ["", "", "#### Variants", ""];
  lines.push(
    `The props are a union of forms${variants.discriminant ? `; ${code(variants.discriminant)} selects the form` : ""}. ` +
      "Only the props that differ between forms are listed: a prop with the same type and requirement in every form is not repeated." +
      (variants.nativeTypesDiffer
        ? " Native element attributes (event handlers, for instance) are typed for each form's element."
        : ""),
  );
  for (const branch of variants.branches) {
    lines.push("", `##### ${code(branch.name)}`, "");
    lines.push(
      branch.props.length === 0
        ? "No props of its own beyond the shared ones."
        : table(
            ["Prop", "Type", "Required", "Description"],
            branch.props.map((p) => [
              code(p.name),
              code(p.type),
              p.required ? "yes" : "no",
              [
                p.description,
                p.native ? "Native attribute in this form." : "",
                p.onlyTypeDiffers ? "In every form; only its type differs." : "",
              ]
                .filter(Boolean)
                .join(" "),
            ]),
          ),
    );
  }
  return lines.join("\n");
}

function propsSection(component) {
  const parts = [];
  const seen = new Map();
  for (const item of component.exports) {
    if (item.kind === "component") {
      const key = JSON.stringify([item.props, item.variants ?? null]);
      if (seen.has(key)) {
        seen.get(key).names.push(item.name);
        continue;
      }
      seen.set(key, { names: [item.name], item });
    } else if (item.kind === "hook" || item.kind === "function") {
      parts.push({ hook: item });
    }
  }
  const out = [];
  for (const { names, item } of seen.values()) {
    const heading = names.map(code).join(", ");
    if (item.props.length === 0) {
      out.push(
        `### ${heading}\n\nNo props of its own.${item.nativeProps ? " Native element attributes pass through." : ""}`,
      );
      continue;
    }
    const rows = item.props.map((p) => [
      code(p.name),
      code(p.type),
      p.required ? "yes" : "no",
      p.default ? code(p.default) : "",
      p.description,
    ]);
    const note = item.nativeProps
      ? "\n\nOther native element attributes pass through to the root element."
      : "";
    out.push(
      `### ${heading}\n\n${table(["Prop", "Type", "Required", "Default", "Description"], rows)}${note}${variantsBlock(item.variants)}`,
    );
  }
  for (const { hook } of parts) {
    const lines = [`### ${code(hook.name)}`, ""];
    if (hook.description) lines.push(hook.description, "");
    lines.push("```ts", `${hook.name}${hook.signature}`, "```");
    if (hook.parameters?.length) {
      lines.push(
        "",
        table(
          ["Parameter", "Type", "Required", "Description"],
          hook.parameters.map((p) => [code(p.name), code(p.type), p.required ? "yes" : "no", p.description]),
        ),
      );
    }
    if (hook.returnMembers?.length) {
      lines.push(
        "",
        "Returned members:",
        "",
        table(
          ["Member", "Type", "Required", "Description"],
          hook.returnMembers.map((m) => [
            code(m.name),
            code(m.type),
            m.required ? "yes" : "no",
            m.description,
          ]),
        ),
      );
    }
    out.push(lines.join("\n"));
  }
  return out.length ? out.join("\n\n") : "No runtime exports with props or parameters.";
}

function importLine(c) {
  const values = c.exports.filter((e) => e.kind !== "type").map((e) => e.name);
  if (values.length > 0) return `import { ${values.join(", ")} } from "${c.entry.subpath}"`;
  const types = c.exports.map((e) => e.name);
  return `import type { ${types.join(", ")} } from "${c.entry.subpath}"`;
}

export function renderSpec(component) {
  const c = component;
  const lines = [`# ${c.name}`, "", `> ${c.summary}`, ""];
  const meta = [
    ["Status", c.status ?? "unlabelled"],
    ["Category", c.category],
    ["Import", code(importLine(c))],
    ["Also from", code(c.entry.root)],
    ["Source", `[${c.source}](${REPO_BLOB}/${c.source})`],
  ];
  if (c.story) meta.push(["Storybook", `[docs](${SITE}?path=/docs/${c.story.docsId})`]);
  lines.push(...meta.map(([k, v]) => `- ${k}: ${v}`), "");

  lines.push("## Purpose", "", c.docs?.overview || c.summary, "");
  lines.push(
    "## When to use",
    "",
    ...(c.docs?.whenToUse.length ? c.docs.whenToUse.map((i) => `- ${i}`) : ["- See the Storybook page."]),
    "",
  );
  lines.push(
    "## When not to use",
    "",
    ...(c.docs?.whenNotToUse.length
      ? c.docs.whenNotToUse.map((i) => `- ${i}`)
      : ["- See the Storybook page."]),
    "",
  );

  const values = c.exports.filter((e) => e.kind !== "type");
  if (values.length > 1) {
    lines.push(
      "## Exports",
      "",
      table(
        ["Name", "Kind"],
        values.map((e) => [code(e.name), e.kind]),
      ),
      "",
    );
  }
  lines.push("## API", "", propsSection(c), "");
  const aliasNames = Object.keys(c.aliases);
  if (aliasNames.length > 0) {
    lines.push("## Types", "", ...aliasNames.map((name) => `- ${code(name)}: ${code(c.aliases[name])}`), "");
  }

  if (c.docs?.usage)
    lines.push("## Example", "", `\`\`\`${c.docs.usage.language}`, c.docs.usage.code, "```", "");

  lines.push("## Accessibility", "");
  if (c.a11y.pattern)
    lines.push(
      `Follows the WAI-ARIA Authoring Practices pattern: [${c.a11y.pattern.label}](${c.a11y.pattern.url}).`,
      "",
    );
  if (c.a11y.keyboard.length) {
    lines.push(
      "Keyboard:",
      "",
      table(
        ["Key", "Action"],
        c.a11y.keyboard.map((r) => [r.keys, r.action]),
      ),
      "",
    );
  } else if (c.a11y.keyboardNotes) {
    lines.push("Keyboard:", "", c.a11y.keyboardNotes, "");
  }
  if (c.a11y.notes.length) lines.push(...c.a11y.notes.map((n) => `- ${n}`), "");
  else if (!c.a11y.pattern && !c.a11y.keyboard.length)
    lines.push("No accessibility notes are written for this export yet; see the Storybook page.", "");

  lines.push("## Motion", "");
  if (c.motion.notes) lines.push(c.motion.notes, "");
  lines.push(
    c.motion.respectsReducedMotion
      ? "Its stylesheet has a `prefers-reduced-motion` branch."
      : "Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.",
    "",
  );

  lines.push("## Tokens", "");
  lines.push(
    c.tokens.length
      ? `Reads these semantic tokens: ${c.tokens.map(code).join(", ")}.`
      : "Its stylesheet reads no `--lufia-*` tokens directly (no CSS module, or it composes other components).",
    "",
  );

  if (c.docs?.contentGuidelines) lines.push("## Content guidelines", "", c.docs.contentGuidelines, "");
  if (c.story?.stories.length) {
    lines.push("## Stories", "", ...c.story.stories.map((s) => `- ${code(s.id)}`), "");
  }
  // Storybook cross-links in the MDX are site-relative; make them absolute so they work outside the site.
  return `${lines.join("\n").trimEnd().replaceAll("](?path=", `](${SITE}?path=`)}\n`;
}

/** Pushes every Markdown heading outside code fences `levels` deeper, so documents can be concatenated. */
function demote(markdown, levels = 1) {
  let fenced = false;
  return markdown
    .split("\n")
    .map((line) => {
      if (/^\s*```/.test(line)) fenced = !fenced;
      return !fenced && /^#{1,5} /.test(line) ? `${"#".repeat(levels)}${line}` : line;
    })
    .join("\n");
}

const CATEGORY_ORDER = [
  "Actions",
  "Forms",
  "Overlays",
  "Navigation",
  "Data display",
  "Feedback",
  "Motion",
  "Utilities",
  "Hooks",
];
const specUrl = (name) => `${SITE}ai/components/${name}.md`;

function groupByCategory(components) {
  const groups = new Map(CATEGORY_ORDER.map((name) => [name, []]));
  for (const c of components) (groups.get(c.category) ?? groups.set(c.category, []).get(c.category)).push(c);
  return [...groups].filter(([, list]) => list.length > 0);
}

const KEY_DOCS = [
  [
    "Standards checklist",
    "docs/STANDARDS.md",
    "What every component must meet: tokens, a11y, API conventions, status labels.",
  ],
  [
    "Motion rules",
    "docs/MOTION.md",
    "Motion principles, tokens, reduced-motion policy and the lufia-verify-motion CLI.",
  ],
  ["Roadmap", "docs/ROADMAP.md", "Rules for every component and the delivery phases."],
  ["Contributing", "CONTRIBUTING.md", "Workflow, definition of done, changesets, versioning."],
  [
    "Architecture decisions",
    "docs/adr/README.md",
    "Why tokens are DTCG, how it is distributed, why widgets are custom.",
  ],
  ["Changelog", "CHANGELOG.md", "Released changes; read before upgrading."],
];

export function renderLlmsTxt(manifest) {
  const lines = [
    "# Lufia Design System",
    "",
    `> Accessible, themeable React 19 components, design tokens and motion primitives (${PACKAGE_NAME}). Styled with CSS Modules over \`--lufia-*\` semantic tokens, safe for Server Components, with every user-facing string passed in as a prop.`,
    "",
    "The package is pre-1.0 and not on npm yet: consuming apps install from a git tag. Components carry a status (alpha, beta, stable); read it before relying on an API. Import each component from its own subpath, for example `@lufia/design-system/components/Button`.",
    "",
    "## Start here",
    "",
    `- [Consuming the package](${SITE}ai/CONSUMING.md): install, theme setup, provider, RSC rules, conventions.`,
    `- [llms-full.txt](${SITE}llms-full.txt): this index with the consuming guide, motion rules and every component spec inlined.`,
    `- [components.json](${SITE}components.json): machine-readable manifest generated from the TypeScript types (props, types, defaults, status, a11y, story ids).`,
    `- [Storybook](${SITE}): live examples, theme and viewport controls.`,
    "",
  ];
  for (const [category, list] of groupByCategory(manifest.components)) {
    lines.push(`## Components: ${category}`, "");
    for (const c of list)
      lines.push(`- [${c.name}](${specUrl(c.name)}): ${c.summary}${c.status ? ` (${c.status})` : ""}`);
    lines.push("");
  }
  lines.push(
    "## Docs",
    "",
    ...KEY_DOCS.slice(0, 2).map(([title, file, note]) => `- [${title}](${REPO_BLOB}/${file}): ${note}`),
    "",
  );
  lines.push(
    "## Optional",
    "",
    ...KEY_DOCS.slice(2).map(([title, file, note]) => `- [${title}](${REPO_BLOB}/${file}): ${note}`),
    `- [Source repository](${REPO_URL})`,
    "",
  );
  return `${lines.join("\n")}`;
}

export function renderLlmsFull(manifest, specs) {
  const out = [
    "# Lufia Design System (full)",
    "",
    "> The complete agent-facing documentation of the package in one file: consuming guide, motion rules, then one spec per component. The index is in llms.txt.",
    "",
    demote(read(`${OUT}/CONSUMING.md`)),
    "",
    demote(read("docs/MOTION.md")),
    "",
    "# Component specs",
    "",
  ];
  for (const c of manifest.components) out.push(demote(specs.get(c.name).trimEnd()), "");
  return `${out.join("\n").trimEnd()}\n`;
}

/** Returns Map<repo-relative path, content> of every generated file. */
export function generate() {
  const manifest = buildManifest();
  const files = new Map();
  const specs = new Map();
  for (const component of manifest.components) {
    const spec = renderSpec(component);
    specs.set(component.name, spec);
    files.set(`${OUT}/components/${component.name}.md`, spec);
  }
  files.set(`${OUT}/components.json`, `${JSON.stringify(manifest, null, 2)}\n`);
  files.set(`${OUT}/llms.txt`, renderLlmsTxt(manifest));
  files.set(`${OUT}/llms-full.txt`, renderLlmsFull(manifest, specs));
  return files;
}
