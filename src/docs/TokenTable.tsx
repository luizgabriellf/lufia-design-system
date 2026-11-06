import { ScrollTable } from "./ScrollTable";
import styles from "./docs.module.css";
import { sharedGroup } from "./tokensData";

type Preview = "none" | "duration";

/** Renders the shared tokens under `group` (for example `space`, `radius`, `font.size`) as a table. */
export function TokenTable({ group, preview = "none" }: { group: string; preview?: Preview }) {
  const [top, ...rest] = group.split(".");
  const tokens = sharedGroup(top ?? group).filter((token) =>
    rest.every((part, i) => token.path[i + 1] === part),
  );
  return (
    <ScrollTable label={`${group} tokens`}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Token</th>
            <th scope="col">Value</th>
            {preview === "duration" ? <th scope="col">Length</th> : null}
          </tr>
        </thead>
        <tbody>
          {tokens.map((token) => (
            <tr key={token.name}>
              <td className={styles.mono}>--{token.name}</td>
              <td className={styles.mono}>{token.value}</td>
              {preview === "duration" ? (
                <td>
                  <span
                    className={styles.bar}
                    style={{ inlineSize: `calc(${parseFloat(token.value)} * 12rem)`, maxInlineSize: "100%" }}
                  />
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollTable>
  );
}
