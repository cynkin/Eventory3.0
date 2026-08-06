import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

export async function GET() {
    const session = await auth();
    if (!session || session.user.role !== "admin")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const users = await prisma.users.findMany({
        select: { id: true, name: true, email: true, role: true, balance: true, google_id: true },
        orderBy: { name: "asc" },
    });
    return NextResponse.json(users);
}
