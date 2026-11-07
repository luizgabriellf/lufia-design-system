/**
 * Deterministic, offline readiness gate for the Lufia AI documentation.
 * This checks manifest quality and the validity of eval case expectations.
 * It does NOT run coding agents or measure their actual success.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (relative) =>
  JSON.parse(readFileSync(path.join(ROOT, relative), "utf8"));
const manifest = readJson("docs/ai/components.json");
const scenarios = readJson("goal/agent-scenarios.json");
const errors = [];
const fail = (message) => errors.push(message);
const entries = Array.isArray(manifest.components) ? manifest.components : [];
const byName = new Map(entries.map((component) => [component.name, component]));
const hasRuntimeExport = (component) =>
  component.exports.some((item) => item.kind !== "type");
const runtime = entries.filter(hasRuntimeExport);

if (manifest.schema !== 1) fail("Unsupported AI manifest schema");
if (byName.size !== entries.length) fail("Duplicate component directory names");
if (entries.length === 0) fail("AI manifest has no components");

for (const component of runtime) {
  if (!["alpha", "beta", "stable", "deprecated"].includes(component.status)) {
    fail(component.name + ": missing or invalid maturity status");
  }
  if (!component.docs?.usage?.code) {
    fail(component.name + ": missing usage example");
  }
  if (!component.docs?.whenToUse?.length || !component.docs?.whenNotToUse?.length) {
    fail(component.name + ": missing usage decision guidance");
  }
  if (!component.story?.docsId || !component.story.stories?.length) {
    fail(component.name + ": missing Storybook story references");
  }
  if (!existsSync(path.join(ROOT, "docs/ai/components", component.name + ".md"))) {
    fail(component.name + ": missing generated component spec");
  }
}

let propCount = 0;
let describedProps = 0;
for (const component of entries) {
  for (const item of component.exports) {
    if (item.kind !== "component") continue;
    for (const prop of item.props) {
      propCount += 1;
      if (prop.description?.trim()) describedProps += 1;
    }
  }
}
const documentationRatio = propCount ? describedProps / propCount : 0;
if (documentationRatio < 0.75) {
  fail("Documented prop descriptions fell below the 75% baseline floor");
}

const ids = new Set();
for (const scenario of scenarios) {
  if (!scenario.id || ids.has(scenario.id)) {
    fail("Duplicate or missing scenario identifier: " + scenario.id);
  }
  ids.add(scenario.id);
  if (!scenario.prompt || !scenario.checks?.length) {
    fail(scenario.id + ": missing prompt or behavioral rubric");
  }
  for (const name of scenario.components ?? []) {
    if (!byName.has(name)) fail(scenario.id + ": unknown component " + name);
  }
  for (const [name, props] of Object.entries(scenario.requiredProps ?? {})) {
    const component = byName.get(name);
    const exported = component?.exports.find(
      (item) => item.kind === "component" && item.name === name,
    );
    if (!exported) {
      fail(scenario.id + ": unknown component export " + name);
      continue;
    }
    const valid = new Set(exported.props.map((prop) => prop.name));
    for (const prop of props) {
      if (!valid.has(prop)) {
        fail(scenario.id + ": nonexistent documented prop " + name + "." + prop);
      }
    }
  }
  for (const [name, props] of Object.entries(scenario.forbiddenProps ?? {})) {
    const component = byName.get(name);
    const exported = component?.exports.find(
      (item) => item.kind === "component" && item.name === name,
    );
    if (!exported) {
      fail(scenario.id + ": unknown forbidden-prop target " + name);
      continue;
    }
    const valid = new Set(exported.props.map((prop) => prop.name));
    for (const prop of props) {
      if (valid.has(prop)) {
        fail(scenario.id + ": forbidden prop is actually valid: " + name + "." + prop);
      }
    }
  }
}
if (scenarios.length < 10) fail("At least ten agent eval scenarios are required");

for (const relative of [
  "docs/ai/llms.txt",
  "docs/ai/llms-full.txt",
  "docs/ai/CONSUMING.md",
  "scripts/ai/publish.mjs",
]) {
  if (!existsSync(path.join(ROOT, relative))) fail("Missing AI discovery artifact: " + relative);
}

const result = {
  kind: "static-readiness",
  verified: errors.length === 0,
  entries: entries.length,
  runtimeEntries: runtime.length,
  props: propCount,
  describedProps,
  propDescriptionPct: Number((100 * documentationRatio).toFixed(1)),
  cases: scenarios.length,
  failures: errors,
};

if (process.argv.includes("--json")) {
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
} else {
  console.log(
    "AI layer static readiness: " +
      entries.length +
      " entries, " +
      propCount +
      " props, " +
      result.propDescriptionPct +
      "% with descriptions, " +
      scenarios.length +
      " scenarios",
  );
  for (const problem of errors) console.error("FAIL: " + problem);
  if (!errors.length) console.log("Static contracts verified (not an agent benchmark).");
}
if (errors.length) process.exitCode = 1;
