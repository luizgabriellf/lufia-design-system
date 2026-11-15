import { Spinner } from "../Spinner";
import styles from "./FieldSpinner.module.css";

/** A small ring for "working" states inside a control. Decorative: pair it with `aria-busy` or a status text. Internal. */
export function FieldSpinner({ className }: { className?: string }) {
  return <Spinner size="sm" className={[styles.ring, className].filter(Boolean).join(" ")} />;
}
