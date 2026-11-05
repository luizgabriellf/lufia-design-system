import { readFileSync } from "node:fs";
import pairs from "./contrast-pairs";
import { ratioFor } from "./lib/contrast";

type Doc = { themes: Record<string, Record<string, Record<string, { value: string }>>> };
const doc = JSON.parse(readFileSync("dist/tokens.json", "utf8")) as Doc;

let failures = 0;
let checked = 0;
for (const [theme, modes] of Object.entries(doc.themes)) {
  for (const [mode, tokens] of Object.entries(modes)) {
    const get = (path: string) => {
      const token = tokens[`color.${path}`];
      if (!token) throw new Error(`Unknown token color.${path} in ${theme}/${mode}`);
      return token.value;
    };
    for (const pair of pairs) {
      const ratio = ratioFor([get(pair.fg)], pair.bg.map(get));
      checked += 1;
      if (ratio + 1e-9 < pair.min) {
        failures += 1;
        console.error(`FAIL ${theme}/${mode}: ${pair.id} = ${ratio.toFixed(2)}:1 (needs ${pair.min}:1)`);
      }
    }
  }
}
console.log(`contrast: ${checked} pairs checked, ${failures} failing`);
process.exit(failures ? 1 : 0);
