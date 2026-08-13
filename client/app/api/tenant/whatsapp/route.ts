import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Recibir la informacion de whatsapp del tenant desde la API al montar el componente 

export async function GET(request: NextRequest) {
    // Verificar la sesión del usuario
    const session = await getSession();

    if (!session || !session.tenantId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {

        // Hacemos la consulta a Prisma para obtener la información de WhatsApp del tenant
        const tenantData = await prisma.whatsappConfig.findUnique({
            where: { tenantId: session.tenantId }, 
            select: {
                accessTokenEncrypted: true,
                phoneNumber: true,
                phoneNumberId: true,
                wabaId: true,
            }
        });

        if (!tenantData) {
            return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
        }

        return NextResponse.json(tenantData, { status: 200 });

    } catch (err) {
        console.error("Error fetching tenant settings:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}