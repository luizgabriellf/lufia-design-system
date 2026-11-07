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

  it("scans files from an injected list and skips binary ones", () => {
    mkdirSync(path.join(dir, "sub"));
    writeFileSync(path.join(dir, "sub/clean.md"), "nothing here\n");
    writeFileSync(path.join(dir, "sub/leaky.html"), `<p>\n${dummy}\n</p>\n`);
    writeFileSync(path.join(dir, "sub/data.bin"), Buffer.from([0, 1, 2, ...Buffer.from(dummy)]));
    expect(findLeaks(tokens, ["sub/clean.md", "sub/leaky.html", "sub/data.bin"], dir)).toEqual([
      "sub/leaky.html:2 matches denylist token #1",
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
