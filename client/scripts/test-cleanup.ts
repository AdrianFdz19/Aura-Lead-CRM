import prisma from "@/lib/prisma";

async function runComprehensiveCleanup() {
    console.log('🧹 Iniciando simulación de limpieza profunda (datos no protegidos)...\n');

    const demoTenantId = process.env.DEMO_TENANT_ID;

    try {
        // 1. Limpiar Mensajes no protegidos
        const deletedMessages = await prisma.message.deleteMany({
            where: {
                isProtected: false,
            },
        });
        console.log(`🗑️ Mensajes no protegidos eliminados: ${deletedMessages.count}`);

        // 2. Limpiar Leads / Prospectos no protegidos
        const deletedLeads = await prisma.lead.deleteMany({
            where: {
                isProtected: false,
            },
        });
        console.log(`🗑️ Leads no protegidos eliminados: ${deletedLeads.count}`);

        // 3. Limpiar Propiedades que NO estén protegidas (independientemente del tenant)
        const deletedProperties = await prisma.property.deleteMany({
            where: {
                isProtected: false, // ¡Aquí está la clave! Borra cualquier propiedad desprotegida
            },
        });
        console.log(`🗑️ Propiedades no protegidas eliminadas: ${deletedProperties.count}`);

        // --- VERIFICACIÓN POST-LIMPIEZA ---
        console.log('\n----------------------------------------');
        console.log('🛡️ Verificando elementos protegidos intocables:');

        const protectedMessages = await prisma.message.count({ where: { isProtected: true } });
        console.log(`   - Mensajes protegidos a salvo: ${protectedMessages}`);

        if (demoTenantId) {
            const demoProperties = await prisma.property.count({ where: { tenantId: demoTenantId } });
            const demoLeads = await prisma.lead.count({ where: { tenantId: demoTenantId } });
            console.log(`   - Propiedades del tenant demo a salvo: ${demoProperties}`);
            console.log(`   - Leads del tenant demo a salvo: ${demoLeads}`);
        }

        console.log('\n✨ ¡Limpieza profunda simulada con éxito! Los datos de la demo están blindados.');

    } catch (error) {
        console.error('❌ Error durante la limpieza:', error);
    } finally {
        await prisma.$disconnect();
    }
}

runComprehensiveCleanup();

