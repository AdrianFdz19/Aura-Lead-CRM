-- AlterTable
ALTER TABLE "properties" ALTER COLUMN "type" SET DEFAULT 'HOUSE';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "phone" VARCHAR(50);
