import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { DetailAttentionCard } from "../../components/DetailAttentionCard";
import { DetailList } from "../../components/DetailList";
import { DetailSectionCard } from "../../components/DetailSectionCard";
import { PageHeader } from "../../components/PageHeader";
import { StatusTimeline } from "../../components/StatusTimeline";
import styles from "./patterns.module.css";

/** A record's detail page: header with status, one attention card, details, and a timeline. */
export function DetailPageDemo() {
  return (
    <div className={styles.detail}>
      <PageHeader
        eyebrow="Reports / Q3"
        title="Quarterly overview"
        headingLevel={2}
        description={
          <Badge tone="warning" dot>
            Awaiting review
          </Badge>
        }
        actions={
          <>
            <Button>Duplicate</Button>
            <Button variant="primary">Publish</Button>
          </>
        }
      />
      <DetailAttentionCard
        tone="warn"
        toneLabel="Warning"
        title="Review due in 5 days"
        description="Publish needs a sign-off first."
        action={<Button size="sm">Request sign-off</Button>}
      />
      <div className={styles.detailColumns}>
        <DetailSectionCard title="Details">
          <DetailList
            rows={[
              { label: "Owner", value: "Ada Example" },
              { label: "Identifier", value: "RPT-2026-Q3", mono: true },
              { label: "Created", value: "5 Nov 2026" },
              { label: "Visibility", value: "Team" },
            ]}
          />
        </DetailSectionCard>
        <DetailSectionCard title="Progress">
          <StatusTimeline
            tracks={[
              {
                id: "review",
                title: "Review",
                nodes: [
                  {
                    id: "r1",
                    label: "Draft submitted",
                    state: "done",
                    stateLabel: "Done",
                    timestampLabel: "5 Nov 2026",
                  },
                  {
                    id: "r2",
                    label: "Written feedback",
                    state: "pending",
                    stateLabel: "Pending",
                    deadlineLabel: "Due 12 Nov 2026",
                  },
                  { id: "r3", label: "Sign-off", state: "needsTimestamp", stateLabel: "Not started" },
                ],
              },
            ]}
          />
        </DetailSectionCard>
      </div>
    </div>
  );
}
