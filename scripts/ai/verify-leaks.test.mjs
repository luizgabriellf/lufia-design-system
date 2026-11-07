import { describe, expect, it } from "vitest";
import { hashToken } from "./hash-token.mjs";
import { findLeaks, loadDenylist, scanText } from "./verify-leaks.mjs";

// The dummy token is the self-test entry seeded in leak-tokens.json; it names nothing real.
const DUMMY = "lufia-owner-private";

describe("leak gate", () => {
  const denylist = loadDenylist();

  it("hashes lowercase tokens with SHA-256", () => {
    expect(hashToken("Abc")).toBe(hashToken("abc"));
    expect(hashToken("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });

  it("finds a listed token in prose, in a hyphenated run and in a path or URL", () => {
    expect(scanText(`a line\nsee ${DUMMY} here`, denylist)).toEqual([{ line: 2, hash: hashToken(DUMMY) }]);
    expect(scanText(`x-${DUMMY}-y`, denylist)).toHaveLength(1);
    expect(scanText(`https://example.test/${DUMMY.toUpperCase()}/a`, denylist)).toHaveLength(1);
  });

  it("does not flag text that only contains a listed token as part of a longer word", () => {
    expect(scanText(`${DUMMY}s and un${DUMMY}`, denylist)).toEqual([]);
    expect(scanText("consuming apps, owner, private", denylist)).toEqual([]);
  });

  it("finds nothing in the generated and shipped files", () => {
    expect(findLeaks()).toEqual([]);
  });
});
