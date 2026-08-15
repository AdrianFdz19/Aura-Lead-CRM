/*
  Warnings:

  - You are about to drop the column `created_at` on the `tenant_llm_configs` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `tenant_llm_configs` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tenant_id]` on the table `tenant_llm_configs` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "tenant_llm_configs_tenant_id_provider_key";

-- AlterTable
ALTER TABLE "tenant_llm_configs" DROP COLUMN "created_at",
DROP COLUMN "updated_at";

-- CreateIndex
CREATE UNIQUE INDEX "tenant_llm_configs_tenant_id_key" ON "tenant_llm_configs"("tenant_id");
