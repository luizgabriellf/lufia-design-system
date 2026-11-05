import type { ReactNode } from "react";
import styles from "./docs.module.css";
import { sharedGroup, type TokenDoc } from "./tokensData";

type Preview = "none" | "radius" | "shadow" | "space" | "font-size" | "font-family" | "weight" | "duration";

function render(token: TokenDoc, preview: Preview): ReactNode {
  const ref = `var(${"--" + token.name})`;
  switch (preview) {
    case "radius":
      return <span className={styles.box} style={{ borderRadius: ref }} />;
    case "shadow":
      return <span className={styles.box} style={{ boxShadow: ref }} />;
    case "space":
      return <span className={styles.bar} style={{ width: ref }} />;
    case "font-size":
      return <span style={{ fontSize: ref }}>Aa Bb 123</span>;
    case "font-family":
      return <span style={{ fontFamily: ref, fontSize: "1.1rem" }}>The quick brown fox</span>;
    case "weight":
      return <span style={{ fontWeight: ref }}>Aa Bb 123</span>;
    case "duration":
      return <span className={styles.bar} style={{ width: "100%", maxWidth: 160 }} />;
    default:
      return null;
  }
}

/** Renders the shared tokens under `group` (for example `space`, `radius`, `font.size`) as a table. */
export function TokenTable({ group, preview = "none" }: { group: string; preview?: Preview }) {
  const [top, ...rest] = group.split(".");
  const tokens = sharedGroup(top ?? group).filter((token) =>
    rest.every((part, i) => token.path[i + 1] === part),
  );
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th scope="col">Token</th>
          <th scope="col">Value</th>
          {preview !== "none" ? <th scope="col">Preview</th> : null}
        </tr>
      </thead>
      <tbody>
        {tokens.map((token) => (
          <tr key={token.name}>
            <td className={styles.mono}>--{token.name}</td>
            <td className={styles.mono}>{token.value}</td>
            {preview !== "none" ? <td>{render(token, preview)}</td> : null}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
