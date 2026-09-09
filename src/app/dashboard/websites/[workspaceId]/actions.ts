"use server";

import { updateFact } from "@/lib/brain/queries";
import { createGoal } from "@/lib/goals";
import { db } from "@/lib/db";
import { requireOrg } from "@/lib/tenancy";
import { listSites } from "@/lib/integrations/google/gsc";
import { inngest } from "@/inngest/client";
import { revalidatePath } from "next/cache";
import { decideOpportunity } from "@/lib/decisions";
import {
  decideDraft,
  regenerateDraft,
  publishDraftById,
  saveGithubSettings,
} from "@/lib/drafts";

export async function saveFact(
  factId: string,
  data: { value?: string; isUserLocked?: boolean }
) {
  try {
    await updateFact(factId, data);
    revalidatePath("/dashboard/websites");
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to save" };
  }
}

async function assertOwns(integrationId: string) {
  const { organizationId } = await requireOrg();
  const integration = await db.integration.findFirst({
    where: { id: integrationId, workspace: { organizationId } },
  });
  if (!integration) throw new Error("Integration not found");
  return integration;
}

export async function loadSites(integrationId: string) {
  try {
    await assertOwns(integrationId);
    const sites = await listSites(integrationId);
    return { sites, error: null };
  } catch (err) {
    return {
      sites: [],
      error: err instanceof Error ? err.message : "Failed to load properties",
    };
  }
}

export async function selectSite(integrationId: string, siteUrl: string) {
  try {
    await assertOwns(integrationId);
    await db.integration.update({
      where: { id: integrationId },
      data: { siteUrl },
    });
    await inngest.send({
      name: "gsc/sync.requested",
      data: { integrationId },
    });
    revalidatePath("/dashboard/websites");
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function syncNow(integrationId: string) {
  try {
    await assertOwns(integrationId);
    await inngest.send({
      name: "gsc/sync.requested",
      data: { integrationId },
    });
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function addGoal(input: {
  workspaceId: string;
  description: string;
  metricType: string;
  targetValue: number;
  days: number;
}) {
  try {
    await createGoal(input);
    revalidatePath("/dashboard/websites/" + input.workspaceId);
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to set goal" };
  }
}

export async function decide(
  opportunityId: string,
  decision: "QUEUED" | "DISMISSED",
  workspaceId: string,
  reason?: string,
  note?: string
) {
  try {
    await decideOpportunity({ opportunityId, decision, reason, note });
    revalidatePath("/dashboard/websites/" + workspaceId);
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Something went wrong" };
  }
}

export async function decideDraftAction(
  draftId: string,
  decision: "APPROVED" | "REJECTED",
  workspaceId: string,
  reason?: string
) {
  try {
    await decideDraft({ draftId, decision, reason });
    revalidatePath("/dashboard/websites/" + workspaceId);
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Something went wrong" };
  }
}

export async function regenerateDraftAction(
  draftId: string,
  workspaceId: string
) {
  try {
    await regenerateDraft(draftId);
    revalidatePath("/dashboard/websites/" + workspaceId);
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Something went wrong" };
  }
}

export async function publishDraftAction(
  draftId: string,
  workspaceId: string
) {
  try {
    await publishDraftById(draftId);
    revalidatePath("/dashboard/websites/" + workspaceId);
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Something went wrong" };
  }
}

export async function saveGithubAction(input: {
  workspaceId: string;
  owner: string;
  repo: string;
  path: string;
}) {
  try {
    await saveGithubSettings(input);
    revalidatePath("/dashboard/websites/" + input.workspaceId);
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to save" };
  }
}