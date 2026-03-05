/*
  Warnings:

  - The values [OFFICE_STAFF,DEPARTMENT_HEAD] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `Agenda` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdBy` on the `Agenda` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Agenda` table. All the data in the column will be lost.
  - The `status` column on the `Agenda` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `office` on the `User` table. All the data in the column will be lost.
  - Added the required column `content` to the `Agenda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `officeId` to the `Agenda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Agenda` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AgendaStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'HEAD', 'STAFF', 'VIEWER');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Agenda" DROP CONSTRAINT "Agenda_createdBy_fkey";

-- AlterTable
ALTER TABLE "Agenda" DROP CONSTRAINT "Agenda_pkey",
DROP COLUMN "createdBy",
DROP COLUMN "description",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "officeId" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "AgendaStatus" NOT NULL DEFAULT 'PENDING',
ADD CONSTRAINT "Agenda_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Agenda_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "office",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "officeId" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "role" SET DEFAULT 'STAFF',
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- DropEnum
DROP TYPE "Status";

-- CreateTable
CREATE TABLE "Office" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Office_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Office_name_key" ON "Office"("name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agenda" ADD CONSTRAINT "Agenda_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agenda" ADD CONSTRAINT "Agenda_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
