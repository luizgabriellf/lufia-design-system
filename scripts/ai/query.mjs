/**
 * Targeted, read-only discovery over the committed Lufia AI manifest.
 * Prefer this to loading the entire components.json into an agent's context.
 * No inference: every displayed prop/type/usage example comes from the manifest.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const MANIFEST_PATH = path.join(ROOT, "docs/ai/components.json");
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

export function loadManifest() {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
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
 * Terms are OR-ed and weighted by where they match (name, summary, guidance, category, props);
 * a component matching more terms ranks higher, and an exact component name always comes first.
 */
export function searchComponents(manifest, query, limit = 8) {
  const terms = [...new Set(termsOf(query))];
  if (!terms.length) return [];
  const ranked = [];
  for (const component of manifest.components) {
    const name = normalize(component.name);
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
      else if (name.includes(term)) weight = 30;
      else if (summary.includes(term)) weight = 18;
      else if (guidance.includes(term)) weight = 10;
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

const usage = `Usage:
  npm run ai:list -- [--json]
  npm run ai:search -- "<task or component>" [--json] [--limit 8]
  npm run ai:show -- <ComponentName> [--json]

All results are generated from docs/ai/components.json.
Do not invent props or import paths that are absent from this manifest.
Use Storybook to verify behavior, and typecheck the consuming application.`;

function run(argv) {
  const [command, ...args] = argv;
  if (!command || ["--help", "-h", "help"].includes(command)) {
    console.log(usage);
    return;
  }
  const json = args.includes("--json");
  const positional = args.filter((arg, index) => !arg.startsWith("--") && args[index - 1] !== "--limit");
  const manifest = loadManifest();
  let result;
  if (command === "list") {
    result = listComponents(manifest);
  } else if (command === "search") {
    const at = args.indexOf("--limit");
    const count = at >= 0 ? Number(args[at + 1]) : 8;
    if (!Number.isInteger(count) || count < 1 || count > 20) {
      throw new Error("--limit must be between 1 and 20");
    }
    result = searchComponents(manifest, positional.join(" "), count);
  } else if (command === "show") {
    result = inspectComponent(manifest, positional[0]);
    if (!result) throw new Error(`Unknown component: ${positional[0] ?? "(missing)"}`);
  } else {
    throw new Error(`Unknown command: ${command}. Run with --help.`);
  }
  if (json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  if (command !== "show") {
    if (!result.length) {
      console.log("No documented matches. Try a different phrase.");
      return;
    }
    for (const entry of result) {
      console.log(`${entry.name} (${entry.category}, ${entry.status})`);
      console.log(`  ${entry.summary}`);
      console.log(`  import: ${entry.import}`);
    }
    return;
  }
  console.log(`${result.name} — ${result.summary}`);
  console.log(`Import: ${result.import}`);
  console.log(`Status: ${result.status}`);
  for (const entry of result.exports) {
    if (entry.kind !== "component") continue;
    console.log(`\n${entry.name} props:`);
    for (const prop of entry.props) {
      console.log(
        `  ${prop.name}${prop.required ? " (required)" : ""}: ${prop.type}${prop.description ? ` — ${prop.description}` : ""}`,
      );
    }
    if (entry.nativeProps) console.log("  Native element attributes also apply.");
  }
  if (result.whenToUse.length) {
    console.log("\nUse when: " + result.whenToUse.join("; "));
  }
  if (result.whenNotToUse.length) {
    console.log("Avoid when: " + result.whenNotToUse.join("; "));
  }
  if (result.usage) {
    console.log(`\nExample (${result.usage.language}):\n${result.usage.code}`);
  }
  if (result.storybook) console.log(`\nStorybook: ${result.storybook}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    run(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
