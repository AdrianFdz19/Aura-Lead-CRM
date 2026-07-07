import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const cookieStore = await cookies();

        cookieStore.delete("session");

        return NextResponse.json({ message: "Logout exitoso" }, { status: 200 })
    } catch(err) {
        console.error("Error en logout:", err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
};