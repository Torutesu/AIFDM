import { db } from "@/lib/db";
import { requireOrg } from "@/lib/tenancy";

export async function getCosts(workspaceId: string) {
  const { organizationId } = await requireOrg();

  const workspace = await db.workspace.findFirst({
    where: { id: workspaceId, organizationId },
  });
  if (!workspace) throw new Error("Workspace not found");

  const records = await db.usageRecord.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });

  const totalCents = records.reduce((sum, r) => sum + r.costCents, 0);

  const byOperation = new Map<
    string,
    { operation: string; calls: number; cents: number }
  >();

  for (const r of records) {
    const existing = byOperation.get(r.operation);
    if (existing) {
      existing.calls += 1;
      existing.cents += r.costCents;
    } else {
      byOperation.set(r.operation, {
        operation: r.operation,
        calls: 1,
        cents: r.costCents,
      });
    }
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const last7Cents = records
    .filter((r) => r.createdAt >= cutoff)
    .reduce((sum, r) => sum + r.costCents, 0);

  return {
    totalCents,
    last7Cents,
    totalCalls: records.length,
    breakdown: Array.from(byOperation.values()).sort(
      (a, b) => b.cents - a.cents
    ),
  };
}
