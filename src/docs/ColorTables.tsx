import pairs from "../../scripts/contrast-pairs";
import { ratioFor } from "../../scripts/lib/contrast";
import styles from "./docs.module.css";
import { tokensData } from "./tokensData";

/** Every semantic colour token with its swatch for one theme and mode. */
export function ColorSwatches({ theme, mode }: { theme: string; mode: string }) {
  const tokens = Object.values(tokensData.themes[theme]?.[mode] ?? {});
  return (
    <table className={styles.table}>
      <caption className="sb-sr-only">{`Semantic colours for ${theme}, ${mode}`}</caption>
      <thead>
        <tr>
          <th scope="col">Swatch</th>
          <th scope="col">Token</th>
          <th scope="col">Value</th>
          <th scope="col">Alias of</th>
        </tr>
      </thead>
      <tbody>
        {tokens.map((token) => (
          <tr key={token.name}>
            <td>
              <span className={styles.swatch}>
                <span style={{ background: token.value }} />
              </span>
            </td>
            <td className={styles.mono}>--{token.name}</td>
            <td className={styles.mono}>{token.value}</td>
            <td className={styles.mono}>{token.original ?? ""}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Contrast ratio of every checked pair for one theme and mode (the same list CI enforces). */
export function ContrastTable({ theme, mode }: { theme: string; mode: string }) {
  const tokens = tokensData.themes[theme]?.[mode] ?? {};
  const get = (path: string) => tokens[`color.${path}`]?.value ?? "#000000";
  return (
    <table className={styles.table}>
      <caption className="sb-sr-only">{`Contrast ratios for ${theme}, ${mode}`}</caption>
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
              <td className={ok ? styles.pass : styles.fail}>{ok ? "Pass" : "Fail"}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
