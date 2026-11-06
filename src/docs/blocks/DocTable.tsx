import { Unstyled } from "@storybook/addon-docs/blocks";
import { ScrollTable } from "../ScrollTable";
import styles from "../docs.module.css";

/** Renders `code` spans written between backticks, so cells read like the Markdown they replace. */
function Cell({ text }: { text: string }) {
  return (
    <>
      {text.split("`").map((part, index) =>
        index % 2 === 1 ? (
          <code key={index} className={styles.mono}>
            {part}
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}

/** A small table for MDX pages. Storybook's MDX has no GFM tables, so docs pass the head and rows as data. */
export function DocTable({ label, head, rows }: { label: string; head: string[]; rows: string[][] }) {
  return (
    <Unstyled>
      <ScrollTable label={label}>
        <table className={styles.table}>
          <thead>
            <tr>
              {head.map((cell) => (
                <th key={cell} scope="col">
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]}>
                {row.map((cell, index) => (
                  <td key={index}>
                    <Cell text={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollTable>
    </Unstyled>
  );
}
