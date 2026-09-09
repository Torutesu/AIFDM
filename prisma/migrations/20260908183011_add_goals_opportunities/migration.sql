-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "targetValue" INTEGER NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reasoning" TEXT NOT NULL,
    "evidence" TEXT[],
    "expectedImpact" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "effort" TEXT NOT NULL,
    "priorityScore" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "risks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Goal_workspaceId_status_idx" ON "Goal"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "Opportunity_workspaceId_status_priorityScore_idx" ON "Opportunity"("workspaceId", "status", "priorityScore");

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
