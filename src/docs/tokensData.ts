import tokensJson from "../../dist/tokens.json";

export type TokenDoc = {
  name: string;
  path: string[];
  value: string;
  type?: string;
  description: string;
  original?: string;
};

type TokensJson = {
  shared: Record<string, TokenDoc>;
  primitives: Record<string, TokenDoc>;
  themes: Record<string, Record<string, Record<string, TokenDoc>>>;
};

export const tokensData = tokensJson as unknown as TokensJson;

/** Shared (mode independent) tokens whose path starts with `group`. */
export function sharedGroup(group: string): TokenDoc[] {
  return Object.values(tokensData.shared).filter((token) => token.path[0] === group);
}
