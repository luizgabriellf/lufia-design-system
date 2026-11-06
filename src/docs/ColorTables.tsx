import pairs from "../../scripts/contrast-pairs";
import { ratioFor } from "../../scripts/lib/contrast";
import { ScrollTable } from "./ScrollTable";
import styles from "./docs.module.css";
import { tokensData } from "./tokensData";

/** Contrast ratio of every checked pair for one theme and mode (the same list CI enforces). */
export function ContrastTable({ theme, mode }: { theme: string; mode: string }) {
  const tokens = tokensData.themes[theme]?.[mode] ?? {};
  const get = (path: string) => tokens[`color.${path}`]?.value ?? "#000000";
  return (
    <ScrollTable label={`Contrast ratios for ${theme}, ${mode}`}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Pair</th>
            <th scope="col">Ratio</th>
            <th scope="col">Needs</th>
            <th scope="col">Result</th>
          </tr>
        </thead>
        <tbody>
          {pairs.map((pair) => {
            const ratio = ratioFor([get(pair.fg)], pair.bg.map(get));
            const ok = ratio + 1e-9 >= pair.min;
            return (
              <tr key={pair.id}>
                <td className={styles.mono}>{pair.id}</td>
                <td>{ratio.toFixed(2)}:1</td>
                <td>{pair.min}:1</td>
                <td>
                  <span className={ok ? styles.pass : styles.fail}>{ok ? "Pass" : "Fail"}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </ScrollTable>
  );
}
