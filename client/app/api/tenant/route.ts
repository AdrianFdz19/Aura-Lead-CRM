import { Prisma } from "@/app/generated/prisma/browser";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    // Verificar la sesión del usuario
    const session = await getSession();

    if (!session || !session.tenantId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Hacemos la consulta a Prisma incluyendo la relación de whatsapp_configs
        const tenantData = await prisma.tenant.findUnique({
            where: { id: session.tenantId },
            select: {
                name: true,
                whatsappConfig: {
                    select: {
                        id: true,
                        phoneNumber: true,
                        phoneNumberId: true,
                        wabaId: true,
                    }
                },
                tenantLlmConfig: { // <--- Singular
                    select: {
                        provider: true,
                        modelName: true
                    }
                }
            }
        });

        if (!tenantData) {
            return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
        }

        const hasWhatsAppConfig = Boolean(
            tenantData.whatsappConfig &&
            tenantData.whatsappConfig.phoneNumber &&
            tenantData.whatsappConfig.wabaId
        );

        // Preparamos la respuesta final de forma limpia y directa (1 a 1)
        const responsePayload = {
            name: tenantData.name,
            whatsappConnected: hasWhatsAppConfig,
            whatsappDetails: tenantData.whatsappConfig ? {
                phoneNumber: tenantData.whatsappConfig.phoneNumber,
                phoneNumberId: tenantData.whatsappConfig.phoneNumberId,
                wabaId: tenantData.whatsappConfig.wabaId
            } : null,
            llmConfig: tenantData.tenantLlmConfig ? { // <--- Objeto único, sin maps
                provider: tenantData.tenantLlmConfig.provider,
                modelName: tenantData.tenantLlmConfig.modelName
            } : null
        };

        return NextResponse.json(responsePayload, { status: 200 });

    } catch (err) {
        console.error("Error fetching tenant settings:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}