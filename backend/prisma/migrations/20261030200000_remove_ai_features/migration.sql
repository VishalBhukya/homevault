-- DropForeignKey
ALTER TABLE "CaptureItem" DROP CONSTRAINT "CaptureItem_householdId_fkey";

-- DropForeignKey
ALTER TABLE "CaptureItem" DROP CONSTRAINT "CaptureItem_journalEntryId_fkey";

-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_householdId_fkey";

-- DropForeignKey
ALTER TABLE "JournalEntry" DROP CONSTRAINT "JournalEntry_authorId_fkey";

-- DropForeignKey
ALTER TABLE "JournalEntry" DROP CONSTRAINT "JournalEntry_householdId_fkey";

-- DropTable
DROP TABLE "CaptureItem";

-- DropTable
DROP TABLE "ChatMessage";

-- DropTable
DROP TABLE "JournalEntry";

-- DropEnum
DROP TYPE "CaptureStatus";

