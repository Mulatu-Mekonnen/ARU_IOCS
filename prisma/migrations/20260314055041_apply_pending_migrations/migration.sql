/*
  Warnings:

  - You are about to drop the column `officeId` on the `Agenda` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AgendaStatus" ADD VALUE 'FORWARDED';
ALTER TYPE "AgendaStatus" ADD VALUE 'ARCHIVED';

-- DropForeignKey
ALTER TABLE "Agenda" DROP CONSTRAINT "Agenda_officeId_fkey";

-- AlterTable
ALTER TABLE "Agenda" DROP COLUMN "officeId",
ADD COLUMN     "attachmentName" TEXT,
ADD COLUMN     "attachmentSize" INTEGER,
ADD COLUMN     "attachmentUrl" TEXT,
ADD COLUMN     "currentOfficeId" TEXT,
ADD COLUMN     "receiverOfficeId" TEXT,
ADD COLUMN     "senderOfficeId" TEXT;

-- CreateTable
CREATE TABLE "ApprovalHistory" (
    "id" TEXT NOT NULL,
    "agendaId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "comment" TEXT,
    "actionById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApprovalHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgendaRoute" (
    "id" TEXT NOT NULL,
    "agendaId" TEXT NOT NULL,
    "fromOfficeId" TEXT NOT NULL,
    "toOfficeId" TEXT NOT NULL,
    "routedById" TEXT NOT NULL,
    "routedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgendaRoute_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ApprovalHistory" ADD CONSTRAINT "ApprovalHistory_agendaId_fkey" FOREIGN KEY ("agendaId") REFERENCES "Agenda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalHistory" ADD CONSTRAINT "ApprovalHistory_actionById_fkey" FOREIGN KEY ("actionById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agenda" ADD CONSTRAINT "Agenda_senderOfficeId_fkey" FOREIGN KEY ("senderOfficeId") REFERENCES "Office"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agenda" ADD CONSTRAINT "Agenda_receiverOfficeId_fkey" FOREIGN KEY ("receiverOfficeId") REFERENCES "Office"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agenda" ADD CONSTRAINT "Agenda_currentOfficeId_fkey" FOREIGN KEY ("currentOfficeId") REFERENCES "Office"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgendaRoute" ADD CONSTRAINT "AgendaRoute_agendaId_fkey" FOREIGN KEY ("agendaId") REFERENCES "Agenda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgendaRoute" ADD CONSTRAINT "AgendaRoute_fromOfficeId_fkey" FOREIGN KEY ("fromOfficeId") REFERENCES "Office"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgendaRoute" ADD CONSTRAINT "AgendaRoute_toOfficeId_fkey" FOREIGN KEY ("toOfficeId") REFERENCES "Office"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgendaRoute" ADD CONSTRAINT "AgendaRoute_routedById_fkey" FOREIGN KEY ("routedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
