/*
  Warnings:

  - The values [CUSTOMER] on the enum `SenderType` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[wa_id]` on the table `leads` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `wa_id` to the `leads` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SenderType_new" AS ENUM ('LEAD', 'AGENT', 'SYSTEM');
ALTER TABLE "messages" ALTER COLUMN "sender_type" TYPE "SenderType_new" USING ("sender_type"::text::"SenderType_new");
ALTER TYPE "SenderType" RENAME TO "SenderType_old";
ALTER TYPE "SenderType_new" RENAME TO "SenderType";
DROP TYPE "public"."SenderType_old";
COMMIT;

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "wa_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "leads_wa_id_key" ON "leads"("wa_id");
