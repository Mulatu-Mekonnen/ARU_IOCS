/*
  Warnings:

  - You are about to drop the column `content` on the `Agenda` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Agenda` table. All the data in the column will be lost.
  - Added the required column `createdById` to the `Agenda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Agenda` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Agenda" DROP CONSTRAINT "Agenda_officeId_fkey";

-- DropForeignKey
ALTER TABLE "Agenda" DROP CONSTRAINT "Agenda_userId_fkey";

-- AlterTable
ALTER TABLE "Agenda" DROP COLUMN "content",
DROP COLUMN "userId",
ADD COLUMN     "approvedById" TEXT,
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "officeId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Agenda" ADD CONSTRAINT "Agenda_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agenda" ADD CONSTRAINT "Agenda_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agenda" ADD CONSTRAINT "Agenda_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
