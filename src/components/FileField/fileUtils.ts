const UNITS = ["B", "KB", "MB", "GB"] as const;

/**
 * A readable file size: "820 B", "12.4 KB", "1.4 MB". Units are symbols, not words; the number follows `locale` (the
 * runtime's when omitted), so "1,4 MB" in Portuguese.
 */
export function formatFileSize(bytes: number, locale?: string): string {
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < UNITS.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${unit === 0 ? size : number.format(size)} ${UNITS[unit]}`;
}

/**
 * The rule of the native `accept` attribute (extensions, MIME types and `type/*` wildcards, comma separated), applied by
 * hand because a dropped file bypasses the attribute. An empty rule accepts everything.
 */
export function matchesAccept(file: Pick<File, "name" | "type">, accept?: string): boolean {
  const tokens = (accept ?? "")
    .split(",")
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
  if (tokens.length === 0) return true;
  const name = file.name.toLowerCase();
  const type = (file.type || "").toLowerCase();
  return tokens.some((token) =>
    token.startsWith(".")
      ? name.endsWith(token)
      : token.endsWith("/*")
        ? type.startsWith(token.slice(0, -1))
        : type === token,
  );
}

/** Two picks of the same file in a row count once. */
export const sameFile = (a: File, b: File) =>
  a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;
