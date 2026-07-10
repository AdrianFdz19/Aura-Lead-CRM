-- CreateEnum
CREATE TYPE "LeadPriority" AS ENUM ('HOT', 'WARM', 'COLD');

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "priority" "LeadPriority" NOT NULL DEFAULT 'WARM';
