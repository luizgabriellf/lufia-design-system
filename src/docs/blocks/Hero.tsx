import { Unstyled } from "@storybook/addon-docs/blocks";
import pkg from "../../../package.json";
import { DetailAttentionCard } from "../../components/DetailAttentionCard";
import { DetailList } from "../../components/DetailList";
import { DetailSectionCard } from "../../components/DetailSectionCard";
import { Stepper } from "../../components/Stepper";
import { TableToolbar } from "../../components/TableToolbar";
import { ArrowRightIcon, GitHubIcon } from "../demo";
import { Button } from "../../components/Button";
import { REPO_URL } from "./links";
import { landingStats } from "./stats";
import styles from "./Hero.module.css";

/** Static badges: no remote image requests, so loading the docs tells no third party who is reading them. */
const BADGES = [
  { label: "CI", value: "GitHub Actions", href: `${REPO_URL}/actions/workflows/ci.yml` },
  { label: "licence", value: "MIT", href: `${REPO_URL}/blob/main/LICENSE` },
  { label: "version", value: pkg.version, href: `${REPO_URL}/blob/main/CHANGELOG.md` },
];

const noop = () => {};

/** A small, real composition of the components, shown as decoration next to the headline. */
function Composition() {
  return (
    <div className={styles.composition} aria-hidden="true" inert>
      <div className={styles.window}>
        <div className={styles.windowBar}>
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </div>
        <div className={styles.windowBody}>
          <Stepper
            steps={[
              { key: "a", label: "Details" },
              { key: "b", label: "Review" },
              { key: "c", label: "Confirm" },
            ]}
            current={1}
          />
          <DetailAttentionCard
            tone="warn"
            toneLabel="Warning"
            title="Review due in 5 days"
            description="Schedule it before the deadline."
            action={
              <Button size="sm" variant="primary">
                Schedule
              </Button>
            }
          />
          <DetailSectionCard title="Contact details">
            <DetailList
              rows={[
                { label: "Name", value: "Ada Example" },
                { label: "Identifier", value: "A-1042", mono: true },
              ]}
            />
          </DetailSectionCard>
          <TableToolbar
            filters={[
              { key: "all", label: "All" },
              { key: "open", label: "Open" },
            ]}
            activeFilter="open"
            onFilterChange={noop}
          />
        </div>
      </div>
    </div>
  );
}

/** Landing hero: name, value proposition, calls to action, status badges and headline figures. */
export function Hero() {
  const stats = landingStats();
  return (
    <Unstyled>
      <header className={styles.hero}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Open source · MIT · pre-1.0</p>
          <h1 className={styles.title}>Lufia Design System</h1>
          <p className={styles.lede}>
            Accessible, themeable React components built on W3C design tokens. Motion that respects people,
            and a brand that is a file, not a fork.
          </p>
          <div className={styles.actions}>
            <Button variant="primary" href="#quick-start" iconStart={<ArrowRightIcon size={18} />}>
              Get started
            </Button>
            <Button
              href={REPO_URL}
              target="_blank"
              rel="noreferrer noopener"
              iconStart={<GitHubIcon size={18} />}
            >
              GitHub
              <span className={styles.srOnly}> (opens in a new tab)</span>
            </Button>
          </div>
          <ul className={styles.badges}>
            {BADGES.map((badge) => (
              <li key={badge.label}>
                <a href={badge.href} target="_blank" rel="noreferrer noopener" className={styles.badge}>
                  <span className={styles.badgeLabel}>{badge.label}</span>
                  <span className={styles.badgeValue}>{badge.value}</span>
                  <span className={styles.srOnly}> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <Composition />
      </header>
      <dl className={styles.stats}>
        <div>
          <dt>Components and primitives</dt>
          <dd>{stats.components}</dd>
        </div>
        <div>
          <dt>Design tokens</dt>
          <dd>{stats.tokens}</dd>
        </div>
        <div>
          <dt>Themes, each light and dark</dt>
          <dd>{stats.themes}</dd>
        </div>
        <div>
          <dt>Tested viewport widths</dt>
          <dd>4</dd>
        </div>
      </dl>
    </Unstyled>
  );
}
