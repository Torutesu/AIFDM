-- CreateTable
CREATE TABLE "Experiment" (
    "id" TEXT NOT NULL,
    "hypothesis" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "baselineValue" DOUBLE PRECISION NOT NULL,
    "baselineNote" TEXT,
    "resultValue" DOUBLE PRECISION,
    "resultNote" TEXT,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "measuredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "draftId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "Experiment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Experiment_workspaceId_status_idx" ON "Experiment"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "Experiment_draftId_idx" ON "Experiment"("draftId");

-- AddForeignKey
ALTER TABLE "Experiment" ADD CONSTRAINT "Experiment_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "ContentDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experiment" ADD CONSTRAINT "Experiment_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
