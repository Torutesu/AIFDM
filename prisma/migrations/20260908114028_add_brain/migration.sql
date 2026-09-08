-- CreateEnum
CREATE TYPE "BrainStatus" AS ENUM ('DRAFT', 'ACTIVE', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "FactCategory" AS ENUM ('PRODUCT', 'AUDIENCE', 'POSITIONING', 'COMPETITOR', 'VOICE', 'CONSTRAINT');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('CRAWL', 'SEARCH', 'USER', 'INFERENCE');

-- CreateTable
CREATE TABLE "Brain" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "BrainStatus" NOT NULL DEFAULT 'DRAFT',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "Brain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrainFact" (
    "id" TEXT NOT NULL,
    "category" "FactCategory" NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "sourceType" "SourceType" NOT NULL DEFAULT 'INFERENCE',
    "sourceUrls" TEXT[],
    "isUserLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "brainId" TEXT NOT NULL,

    CONSTRAINT "BrainFact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Brain_workspaceId_status_idx" ON "Brain"("workspaceId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Brain_workspaceId_version_key" ON "Brain"("workspaceId", "version");

-- CreateIndex
CREATE INDEX "BrainFact_brainId_category_idx" ON "BrainFact"("brainId", "category");

-- AddForeignKey
ALTER TABLE "Brain" ADD CONSTRAINT "Brain_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrainFact" ADD CONSTRAINT "BrainFact_brainId_fkey" FOREIGN KEY ("brainId") REFERENCES "Brain"("id") ON DELETE CASCADE ON UPDATE CASCADE;
