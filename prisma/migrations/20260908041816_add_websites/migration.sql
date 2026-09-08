-- CreateEnum
CREATE TYPE "CrawlStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "Website" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "crawlStatus" "CrawlStatus" NOT NULL DEFAULT 'PENDING',
    "pageCount" INTEGER NOT NULL DEFAULT 0,
    "lastCrawledAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "Website_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrawledPage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "markdown" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "crawledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "websiteId" TEXT NOT NULL,

    CONSTRAINT "CrawledPage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Website_workspaceId_idx" ON "Website"("workspaceId");

-- CreateIndex
CREATE INDEX "CrawledPage_websiteId_idx" ON "CrawledPage"("websiteId");

-- CreateIndex
CREATE UNIQUE INDEX "CrawledPage_websiteId_url_key" ON "CrawledPage"("websiteId", "url");

-- AddForeignKey
ALTER TABLE "Website" ADD CONSTRAINT "Website_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrawledPage" ADD CONSTRAINT "CrawledPage_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE CASCADE ON UPDATE CASCADE;
