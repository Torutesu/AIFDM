-- AlterTable
ALTER TABLE "ContentDraft" ADD COLUMN     "prUrl" TEXT,
ADD COLUMN     "publishedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "githubOwner" TEXT,
ADD COLUMN     "githubPath" TEXT,
ADD COLUMN     "githubRepo" TEXT;
