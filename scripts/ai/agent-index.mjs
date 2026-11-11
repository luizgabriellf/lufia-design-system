/**
 * Renders the compressed agent index (`docs/ai/agent-index.md`): every component with its import path, status and
 * key props, in a block of at most 8 KB that a consuming app pastes into its own AGENTS.md, so the list is always
 * in the agent's context. Pure: `renderAgentIndex(manifest)` returns the text and depends only on the manifest.
 *
 * Run directly (`npm run build:agent-index`) it rewrites the file from the committed docs/ai/components.json;
 * `npm run build:ai-docs` regenerates it with everything else and `npm run verify:ai-docs` fails when it is stale.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { groupByCategory } from "./categories.mjs";

export const AGENT_INDEX_FILE = "agent-index.md";
/** Hard cap on the UTF-8 size of the block, markers included. */
export const AGENT_INDEX_MAX_BYTES = 8 * 1024;
export const AGENT_INDEX_START =
  "<!-- lufia-agent-index:start (generated; replace the whole block, do not edit) -->";
export const AGENT_INDEX_END = "<!-- lufia-agent-index:end -->";

/** Most props listed per component; lowered until the block fits the cap. */
const MAX_KEY_PROPS = 12;
/** Most sibling exports (other components and hooks of the same entry) named per line. */
const MAX_SIBLINGS = 3;
/** Props every component takes, or that say nothing about the API. */
const COMMON_PROPS = new Set(["children", "className", "ref", "style"]);
/** The status a line leaves out, because nearly every component has it. */
const DEFAULT_STATUS = "beta";

const isRenderable = (e) => e.kind === "component" || e.kind === "hook";

/** The export a line describes: the one named after the entry, else its first component, else its first hook. */
function mainExport(component) {
  const usable = component.exports.filter(isRenderable);
  return (
    usable.find((e) => e.name === component.name) ??
    usable.find((e) => e.kind === "component") ??
    usable[0] ??
    null
  );
}

/** Required props first, then declaration order; `*` marks a required prop, `+N` counts the ones left out. */
function keyProps(entry, limit) {
  const props = (entry.props ?? []).filter((p) => !p.native && !COMMON_PROPS.has(p.name));
  const ordered = [...props.filter((p) => p.required), ...props.filter((p) => !p.required)];
  const shown = ordered.slice(0, limit).map((p) => (p.required ? `${p.name}*` : p.name));
  if (ordered.length > shown.length) shown.push(`+${ordered.length - shown.length}`);
  return shown.join(" ");
}

/** A destructured parameter has no name of its own (the compiler calls it `__0`): it is an options object. */
const argumentName = (p) => (/^__\d+$/.test(p.name) ? "options" : p.name);
const hookArguments = (entry) =>
  `(${(entry.parameters ?? []).map((p) => (p.required ? argumentName(p) : `${argumentName(p)}?`)).join(", ")})`;

function line(component, packageName, limit) {
  const main = mainExport(component);
  const subpath = component.entry.subpath;
  let head = component.name;
  if (component.status !== DEFAULT_STATUS) head += ` (${component.status ?? "no status"})`;
  if (subpath !== `${packageName}/components/${component.name}`)
    head += ` [${subpath.slice(packageName.length + 1)}]`;
  if (!main) return `${head}: types only`;

  const parts = [];
  if (main.name !== component.name) parts.push(`<${main.name}>`);
  const api = main.kind === "hook" ? hookArguments(main) : keyProps(main, limit);
  if (api) parts.push(api);
  const siblings = component.exports.filter((e) => isRenderable(e) && e !== main).map((e) => e.name);
  if (siblings.length > 0) {
    const named = siblings.slice(0, MAX_SIBLINGS);
    if (siblings.length > named.length) named.push(`+${siblings.length - named.length}`);
    parts.push(`| also ${named.join(" ")}`);
  }
  return parts.length > 0 ? `${head}: ${parts.join(" ")}` : head;
}

function render(manifest, limit) {
  const name = manifest.package;
  const lines = [
    AGENT_INDEX_START,
    "## Lufia Design System: component index",
    "",
    `Shared UI comes from \`${name}\`. Use a component listed here before writing one, and never invent a component or a prop.`,
    "",
    `- Import \`Name\` from \`${name}/components/Name\`; a line with \`[subpath]\` imports from \`${name}/subpath\` instead.`,
    `- A line is \`Name: props\`. \`*\` is required, \`+N\` counts props not listed, \`(a, b?)\` are hook arguments, \`<X>\` is the export described when it is not \`Name\`, \`also\` names other exports of the same path.`,
    `- Status is ${DEFAULT_STATUS} unless the line says otherwise; alpha and beta may change in a minor release.`,
    '- Types, defaults, examples, keyboard and accessibility: `npx --no-install lufia-ai show Name`. To find a component for a task: `npx --no-install lufia-ai search "task"`.',
    "- Every visible string is a prop (translate in the app). Style with `--lufia-*` semantic tokens only. Links render through `LufiaProvider`. Interactive components are client components.",
    "",
  ];
  for (const [category, list] of groupByCategory(manifest.components)) {
    lines.push(`### ${category}`, "", ...list.map((c) => `- ${line(c, name, limit)}`), "");
  }
  lines.push(AGENT_INDEX_END);
  return `${lines.join("\n")}\n`;
}

/**
 * The index for a manifest. Lists as many key props per component as fit `maxBytes`, trying fewer until the block
 * fits, and throws when even the bare component list is too large.
 */
export function renderAgentIndex(manifest, maxBytes = AGENT_INDEX_MAX_BYTES) {
  for (let limit = MAX_KEY_PROPS; limit >= 0; limit -= 1) {
    const text = render(manifest, limit);
    if (Buffer.byteLength(text, "utf8") <= maxBytes) return text;
  }
  throw new Error(
    `agent index does not fit ${maxBytes} bytes even without props (${manifest.components.length} components)`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../docs/ai");
  const manifest = JSON.parse(readFileSync(path.join(dir, "components.json"), "utf8"));
  const text = renderAgentIndex(manifest);
  writeFileSync(path.join(dir, AGENT_INDEX_FILE), text);
  console.log(
    `agent-index: wrote docs/ai/${AGENT_INDEX_FILE} (${manifest.components.length} components, ${Buffer.byteLength(text, "utf8")} of ${AGENT_INDEX_MAX_BYTES} bytes)`,
  );
}
