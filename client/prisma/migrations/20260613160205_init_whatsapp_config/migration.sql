/*
  Warnings:

  - Added the required column `phone_number` to the `whatsapp_configs` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "whatsapp_configs" DROP CONSTRAINT "whatsapp_configs_tenant_id_fkey";

-- DropIndex
DROP INDEX "whatsapp_configs_phone_number_id_key";

-- AlterTable
ALTER TABLE "whatsapp_configs" ADD COLUMN     "phone_number" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "whatsapp_configs_tenant_id_idx" ON "whatsapp_configs"("tenant_id");

-- AddForeignKey
ALTER TABLE "whatsapp_configs" ADD CONSTRAINT "whatsapp_configs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
