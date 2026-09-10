import { getActiveBrain, getIntegration } from "@/lib/brain/queries";
import {
  getActiveGoal,
  listOpportunities,
  listDecided,
  listDrafts,
} from "@/lib/goals";
import { listExperiments } from "@/lib/experiments";
import { getCosts } from "@/lib/costs";
import { listEvents, getDigest } from "@/lib/events";
import { FactCard } from "./fact-card";
import { GscPanel } from "./gsc-panel";
import { GithubPanel } from "./github-panel";
import { CostPanel } from "./cost-panel";
import { ActivityFeed } from "./activity-feed";
import { DigestPanel } from "./digest-panel";
import { GoalForm } from "./goal-form";
import { OpportunityList } from "./opportunity-list";
import { DecidedList } from "./decided-list";
import { DraftList } from "./draft-list";
import { ExperimentList } from "./experiment-list";
import Link from "next/link";

const CATEGORY_LABELS: Record<string, string> = {
  PRODUCT: "Product",
  AUDIENCE: "Audience",
  POSITIONING: "Positioning",
  VOICE: "Brand voice",
  COMPETITOR: "Competitors",
  CONSTRAINT: "Constraints",
};

const ORDER = ["PRODUCT", "AUDIENCE", "POSITIONING", "VOICE", "COMPETITOR", "CONSTRAINT"];

export default async function BrainPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const { workspace, brain } = await getActiveBrain(workspaceId);
  const integration = await getIntegration(workspaceId);
  const goal = await getActiveGoal(workspaceId);
  const opportunities = await listOpportunities(workspaceId);
  const decided = await listDecided(workspaceId);
  const drafts = await listDrafts(workspaceId);
  const experiments = await listExperiments(workspaceId);
  const costs = await getCosts(workspaceId);
  const events = await listEvents(workspaceId);
  const digest = await getDigest(workspaceId);

  const grouped = brain
    ? ORDER.map((category) => ({
        category,
        facts: brain.facts.filter((f) => f.category === category),
      })).filter((g) => g.facts.length > 0)
    : [];

  return (
    <div className="max-w-2xl space-y-8">
      <div className="space-y-2">
        <Link href="/dashboard/websites" className="text-sm text-neutral-500">
          ← Websites
        </Link>
        <div className="flex items-baseline justify-between">
          <h1 className="text-xl font-semibold tracking-tight">
            {workspace.name}
          </h1>
          {brain ? (
            <span className="text-xs text-neutral-500">
              v{brain.version} · {brain.facts.length} facts
            </span>
          ) : null}
        </div>
      </div>

      <DigestPanel digest={digest} />

      <section className="space-y-3">
        <h2 className="text-sm font-medium">Goal</h2>
        {goal ? (
          <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
            <p className="text-sm font-medium">{goal.description}</p>
            <p className="mt-1 text-xs text-neutral-500">
              {goal.targetValue} {goal.metricType} by{" "}
              {new Date(goal.targetDate).toLocaleDateString()}
            </p>
          </div>
        ) : null}
        <GoalForm workspaceId={workspaceId} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium">Opportunities</h2>
        <OpportunityList items={opportunities} workspaceId={workspaceId} />
      </section>

      {drafts.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-medium">Drafts</h2>
          <DraftList items={drafts} workspaceId={workspaceId} />
        </section>
      ) : null}

      {experiments.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-medium">Experiments</h2>
          <ExperimentList items={experiments} workspaceId={workspaceId} />
        </section>
      ) : null}

      {decided.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-medium">Decided</h2>
          <DecidedList items={decided} />
        </section>
      ) : null}

      <ActivityFeed items={events} />

      <CostPanel costs={costs} />

      <GithubPanel
        workspaceId={workspaceId}
        owner={workspace.githubOwner}
        repo={workspace.githubRepo}
        path={workspace.githubPath}
      />

      <GscPanel workspaceId={workspaceId} integration={integration} />

      {grouped.map((group) => (
        <section key={group.category} className="space-y-2">
          <h2 className="text-sm font-medium">
            {CATEGORY_LABELS[group.category]}
          </h2>
          <div className="space-y-2">
            {group.facts.map((fact) => (
              <FactCard key={fact.id} fact={fact} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}