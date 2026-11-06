import type { Finding } from "./scan";

/** Violation counts per file and rule. */
export type Baseline = { version: 1; files: Record<string, Record<string, number>> };

export const emptyBaseline = (): Baseline => ({ version: 1, files: {} });

export function countFindings(byFile: Record<string, Finding[]>): Baseline["files"] {
  const files: Baseline["files"] = {};
  for (const [file, findings] of Object.entries(byFile)) {
    for (const { rule } of findings) {
      const counts = (files[file] ??= {});
      counts[rule] = (counts[rule] ?? 0) + 1;
    }
  }
  return files;
}

/**
 * Compares current counts with the baseline. A count above the baseline is a problem; a count below it (or a file that
 * is clean now) means the baseline can shrink.
 */
export function compare(current: Baseline["files"], baseline: Baseline["files"]) {
  const problems: string[] = [];
  let shrinkable = false;
  for (const [file, counts] of Object.entries(current)) {
    for (const [rule, count] of Object.entries(counts)) {
      const allowed = baseline[file]?.[rule] ?? 0;
      if (count > allowed)
        problems.push(`${file}: ${count} ${rule} violation(s), baseline allows ${allowed}`);
      else if (count < allowed) shrinkable = true;
    }
  }
  for (const [file, counts] of Object.entries(baseline)) {
    for (const [rule, allowed] of Object.entries(counts))
      if ((current[file]?.[rule] ?? 0) < allowed) shrinkable = true;
  }
  return { problems, shrinkable };
}
