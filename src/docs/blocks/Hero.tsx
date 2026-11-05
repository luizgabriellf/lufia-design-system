import { Unstyled } from "@storybook/addon-docs/blocks";
import pkg from "../../../package.json";
import { DetailAttentionCard } from "../../components/DetailAttentionCard";
import { DetailList } from "../../components/DetailList";
import { DetailSectionCard } from "../../components/DetailSectionCard";
import { Stepper } from "../../components/Stepper";
import { TableToolbar } from "../../components/TableToolbar";
import { ArrowRightIcon, DemoButton, DemoLinkButton, GitHubIcon } from "../demo";
import { REPO_URL } from "./links";
import { landingStats } from "./stats";
import styles from "./Hero.module.css";

const BADGES = [
  {
    label: "CI status",
    href: `${REPO_URL}/actions/workflows/ci.yml`,
    src: `https://img.shields.io/github/actions/workflow/status/luizgabriellf/lufia-design-system/ci.yml?branch=main&label=CI&style=flat-square`,
  },
  {
    label: "MIT licence",
    href: `${REPO_URL}/blob/main/LICENSE`,
    src: "https://img.shields.io/github/license/luizgabriellf/lufia-design-system?style=flat-square&label=licence",
  },
  {
    label: "Package version",
    href: `${REPO_URL}/blob/main/CHANGELOG.md`,
    src: `https://img.shields.io/badge/version-${pkg.version}-1d4ed8?style=flat-square`,
  },
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
              <DemoButton size="sm" variant="primary">
                Schedule
              </DemoButton>
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
            <DemoLinkButton variant="primary" href="#quick-start" icon={<ArrowRightIcon size={18} />}>
              Get started
            </DemoLinkButton>
            <DemoLinkButton
              href={REPO_URL}
              target="_blank"
              rel="noreferrer noopener"
              icon={<GitHubIcon size={18} />}
            >
              GitHub
              <span className={styles.srOnly}> (opens in a new tab)</span>
            </DemoLinkButton>
          </div>
          <ul className={styles.badges}>
            {BADGES.map((badge) => (
              <li key={badge.label}>
                <a href={badge.href} target="_blank" rel="noreferrer noopener" className={styles.badge}>
                  <img src={badge.src} alt={badge.label} height={20} />
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
