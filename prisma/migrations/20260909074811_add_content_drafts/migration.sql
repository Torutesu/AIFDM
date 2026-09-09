-- CreateTable
CREATE TABLE "ContentDraft" (
    "id" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "score" DOUBLE PRECISION,
    "scoreReasons" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "ContentDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentDraft_workspaceId_status_idx" ON "ContentDraft"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "ContentDraft_opportunityId_idx" ON "ContentDraft"("opportunityId");

-- AddForeignKey
ALTER TABLE "ContentDraft" ADD CONSTRAINT "ContentDraft_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentDraft" ADD CONSTRAINT "ContentDraft_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
