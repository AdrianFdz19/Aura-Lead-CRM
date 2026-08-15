-- CreateTable
CREATE TABLE "tenant_llm_configs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "model_name" VARCHAR(100) NOT NULL,
    "api_key_encrypted" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_llm_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_llm_configs_tenant_id_provider_key" ON "tenant_llm_configs"("tenant_id", "provider");

-- AddForeignKey
ALTER TABLE "tenant_llm_configs" ADD CONSTRAINT "tenant_llm_configs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
