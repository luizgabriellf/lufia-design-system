import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { findHits, findLeaks, loadTokens, scanText } from "./verify-leaks.mjs";

// A dummy token built at runtime, so no listed word and no real identifier is written in this file.
const dummy = ["zork", "blat"].join("");
const tokens = [dummy, ["quux", "wibble"].join("-")];

describe("leak gate scanner", () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "lufia-leaks-"));
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  it("finds a token as a word and reports line and list index, not the word", () => {
    expect(scanText(`one\ntwo ${dummy} three`, tokens)).toEqual([{ line: 2, token: 0 }]);
    expect(scanText("nothing to see, zork and blat apart", tokens)).toEqual([]);
  });

  it("splits camelCase before lowercasing", () => {
    expect(findHits("const zorkBlatThing = 1", tokens)).toEqual([0]);
    expect(findHits("ZorkBlat", tokens)).toEqual([0]);
  });

  it("strips diacritics from the text and from the token", () => {
    expect(findHits("zörkéblat here", tokens)).toEqual([]);
    expect(findHits("zörkblat", tokens)).toEqual([0]);
    expect(findHits("zorkblat", ["zörkblat"])).toEqual([0]);
  });

  it("matches joined and separated forms of a multi-word token", () => {
    for (const text of [
      "quux-wibble",
      "quuxwibble",
      "quux_wibble",
      "quux wibble",
      "QuuxWibble",
      "a/quux.wibble/b",
    ])
      expect(findHits(text, tokens)).toEqual([1]);
  });

  it("does not match a token inside a longer word", () => {
    expect(findHits(`un${dummy}s`, tokens)).toEqual([]);
  });

  it("splits acronym runs and letter/digit boundaries", () => {
    const acme = ["ac", "me"].join("");
    expect(findHits(`${acme.toUpperCase()}Portal`, [acme])).toEqual([0]);
    expect(findHits(`${acme}2`, [acme])).toEqual([0]);
    expect(findHits(`v2${acme}`, [acme])).toEqual([0]);
  });

  it("scans files from an injected list and skips only known binary extensions", () => {
    mkdirSync(path.join(dir, "sub"));
    writeFileSync(path.join(dir, "sub/clean.md"), "nothing here\n");
    writeFileSync(path.join(dir, "sub/leaky.html"), `<p>\n${dummy}\n</p>\n`);
    writeFileSync(path.join(dir, "sub/data.png"), Buffer.from([0, 1, 2, ...Buffer.from(dummy)]));
    const files = ["sub/clean.md", "sub/leaky.html", "sub/data.png"];
    expect(findLeaks(tokens, files, dir)).toEqual({
      problems: ["sub/leaky.html:2 matches denylist token #1"],
      skipped: 1,
    });
  });

  it("scans a text file that contains NUL bytes", () => {
    writeFileSync(path.join(dir, "nul.md"), `a\0b\n${[...dummy].join("\0")}\n`);
    expect(findLeaks(tokens, ["nul.md"], dir).problems).toEqual(["nul.md:2 matches denylist token #1"]);
  });

  it("scans a file larger than 5 MB, with correct line numbers", () => {
    const filler = `${"x".repeat(99)}\n`.repeat(60_000);
    writeFileSync(path.join(dir, "big.md"), `${filler}${dummy}\n${filler}`);
    expect(findLeaks(tokens, ["big.md"], dir).problems).toEqual(["big.md:60001 matches denylist token #1"]);
  });

  it("scans file names and paths", () => {
    writeFileSync(path.join(dir, `${dummy}-notes.md`), "clean\n");
    expect(findLeaks(tokens, [`${dummy}-notes.md`], dir).problems).toEqual([
      `${dummy}-notes.md path matches denylist token #1`,
    ]);
  });

  it("reads the list from the environment, comma or newline separated, else the config file", () => {
    expect(loadTokens({ LUFIA_LEAK_TOKENS: "a1, b2\nc3" }, dir)).toEqual(["a1", "b2", "c3"]);
    mkdirSync(path.join(dir, ".config/lufia"), { recursive: true });
    writeFileSync(path.join(dir, ".config/lufia/leak-tokens"), "from-file\n\n");
    expect(loadTokens({ LUFIA_LEAK_TOKENS: " " }, dir)).toEqual(["from-file"]);
    expect(loadTokens({}, path.join(dir, "empty"))).toBeNull();
  });
});
