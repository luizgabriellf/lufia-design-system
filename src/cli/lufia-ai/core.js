/**
 * Read-only lookup over the Lufia AI manifest (`components.json`). The single source of truth for the repository
 * script (`npm run ai:*`) and the shipped `lufia-ai` CLI and MCP server: it is copied unchanged into `dist/cli/`.
 * Plain ESM with node built-ins only. No inference: every displayed prop, type and example comes from the manifest.
 */
import { readFileSync } from "node:fs";

const STORYBOOK_URL = "https://luizgabriellf.github.io/lufia-design-system/";

const normalize = (value) =>
  String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const STOPWORDS = new Set(
  (
    "a an the and or of to in on at by for with from into onto as is are be it its this that these those " +
    "i we you my our your me do does how what which when where why can should would could want need " +
    "show display use using make build create add get give find before after over under about"
  ).split(" "),
);

/** Query terms: lowercase words, no stopwords, nothing shorter than 2 characters. */
const termsOf = (value) =>
  (normalize(value).match(/[a-z0-9]+/g) ?? []).filter((term) => term.length >= 2 && !STOPWORDS.has(term));

/** True when a query term is the start of a word in the text, so "drop" finds "dropdown" but "own" does not. */
const startsWord = (text, term) => text.split(/[^a-z0-9]+/).some((word) => word.startsWith(term));

/** Word boundaries of a PascalCase name: "ConfirmDialog" is "confirm dialog". */
const nameWords = (name) => normalize(String(name).replace(/([a-z0-9])([A-Z])/g, "$1 $2"));

export function loadManifest(manifestPath) {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (!Array.isArray(manifest.components)) {
    throw new Error("Invalid Lufia component manifest");
  }
  return manifest;
}

export function listComponents(manifest) {
  return manifest.components
    .map((component) => ({
      name: component.name,
      category: component.category,
      status: component.status,
      summary: component.summary,
      import: component.entry.subpath,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "en"));
}

/**
 * Search across names, descriptions and usage guidance, not assumed React APIs.
 * Terms are OR-ed and weighted by where they match (name, summary, guidance, category, props), a match at the start
 * of a word counting for more than one inside a word;
 * a component matching more terms ranks higher, and an exact component name always comes first.
 */
export function searchComponents(manifest, query, limit = 8) {
  const terms = [...new Set(termsOf(query))];
  if (!terms.length) return [];
  const ranked = [];
  for (const component of manifest.components) {
    const name = normalize(component.name);
    const words = nameWords(component.name);
    const category = normalize(component.category);
    const summary = normalize(component.summary);
    const guidance = normalize(
      [
        ...(component.docs?.whenToUse ?? []),
        ...(component.docs?.whenNotToUse ?? []),
        component.docs?.overview ?? "",
      ].join(" "),
    );
    const propNames = normalize(
      component.exports
        .filter((item) => item.kind === "component")
        .flatMap((item) => item.props.map((prop) => prop.name))
        .join(" "),
    );
    let score = 0;
    let matched = 0;
    let exactName = false;
    for (const term of terms) {
      let weight = 0;
      if (name === term) {
        weight = 100;
        exactName = true;
      } else if (name.startsWith(term)) weight = 45;
      else if (startsWord(words, term)) weight = 38;
      else if (name.includes(term)) weight = 30;
      else if (startsWord(summary, term)) weight = 18;
      else if (summary.includes(term)) weight = 14;
      else if (startsWord(guidance, term)) weight = 10;
      else if (guidance.includes(term)) weight = 8;
      else if (category.includes(term)) weight = 7;
      else if (propNames.includes(term)) weight = 3;
      if (!weight) continue;
      matched += 1;
      score += weight;
    }
    if (matched) {
      // Covering more of the query beats one strong partial match.
      score += matched * 5;
      ranked.push({
        name: component.name,
        category: component.category,
        status: component.status,
        summary: component.summary,
        import: component.entry.subpath,
        score,
        exactName,
      });
    }
  }
  return ranked
    .sort(
      (a, b) =>
        Number(b.exactName) - Number(a.exactName) || b.score - a.score || a.name.localeCompare(b.name, "en"),
    )
    .slice(0, Math.min(Math.max(1, limit), 20))
    .map((entry) => {
      delete entry.exactName;
      return entry;
    });
}

export function inspectComponent(manifest, name) {
  const component = manifest.components.find((item) => normalize(item.name) === normalize(name));
  if (!component) return null;
  return {
    name: component.name,
    category: component.category,
    status: component.status,
    summary: component.summary,
    import: component.entry.subpath,
    exports: component.exports,
    aliases: component.aliases,
    usage: component.docs?.usage ?? null,
    whenToUse: component.docs?.whenToUse ?? [],
    whenNotToUse: component.docs?.whenNotToUse ?? [],
    a11y: component.a11y,
    motion: component.motion,
    tokens: component.tokens,
    storybook: component.story?.docsId ? `${STORYBOOK_URL}?path=/docs/${component.story.docsId}` : null,
    stories: component.story?.stories ?? [],
  };
}

/** Validates a `--limit` / `limit` value; returns the integer or throws. */
export function parseLimit(value, fallback = 8) {
  if (value === undefined || value === null) return fallback;
  const count = Number(value);
  if (!Number.isInteger(count) || count < 1 || count > 20) {
    throw new Error("limit must be an integer between 1 and 20");
  }
  return count;
}

/** Plain-text rendering of a `search` or `list` result. */
export function formatList(entries) {
  if (!entries.length) return "No documented matches. Try a different phrase.";
  return entries
    .map(
      (entry) =>
        `${entry.name} (${entry.category}, ${entry.status})\n  ${entry.summary}\n  import: ${entry.import}`,
    )
    .join("\n");
}

/** Plain-text rendering of a `show` result. */
export function formatComponent(result) {
  const lines = [
    `${result.name} — ${result.summary}`,
    `Import: ${result.import}`,
    `Status: ${result.status}`,
  ];
  for (const entry of result.exports) {
    if (entry.kind !== "component") continue;
    lines.push(`\n${entry.name} props:`);
    for (const prop of entry.props) {
      lines.push(
        `  ${prop.name}${prop.required ? " (required)" : ""}: ${prop.type}${prop.description ? ` — ${prop.description}` : ""}`,
      );
    }
    if (entry.nativeProps) lines.push("  Native element attributes also apply.");
  }
  if (result.whenToUse.length) lines.push("\nUse when: " + result.whenToUse.join("; "));
  if (result.whenNotToUse.length) lines.push("Avoid when: " + result.whenNotToUse.join("; "));
  if (result.usage) lines.push(`\nExample (${result.usage.language}):\n${result.usage.code}`);
  if (result.storybook) lines.push(`\nStorybook: ${result.storybook}`);
  return lines.join("\n");
}

/**
 * Runs one lookup command and returns the text to print. Throws on bad input (the caller prints the message).
 * `manifestPath` is resolved by the caller: the repo script points at `docs/ai`, the shipped CLI at `dist/ai`.
 */
export function execute(argv, { manifestPath, usage }) {
  const [command, ...args] = argv;
  if (!command || ["--help", "-h", "help"].includes(command)) return usage;
  const json = args.includes("--json");
  const positional = args.filter((arg, index) => !arg.startsWith("--") && args[index - 1] !== "--limit");
  const manifest = loadManifest(manifestPath);
  let result;
  if (command === "list") {
    result = listComponents(manifest);
  } else if (command === "search") {
    const at = args.indexOf("--limit");
    const limit = parseLimit(at >= 0 ? args[at + 1] : undefined);
    if (!positional.length) throw new Error(`Missing search query.\n\n${usage}`);
    result = searchComponents(manifest, positional.join(" "), limit);
  } else if (command === "show") {
    result = inspectComponent(manifest, positional[0]);
    if (!result) throw new Error(`Unknown component: ${positional[0] ?? "(missing)"}`);
  } else {
    throw new Error(`Unknown command: ${command}. Run with --help.`);
  }
  if (json) return JSON.stringify(result, null, 2);
  return command === "show" ? formatComponent(result) : formatList(result);
}
