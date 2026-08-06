import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

export async function DELETE(req: NextRequest) {
    const session = await auth();
    if (!session || session.user.role !== "admin")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { user_id } = await req.json();
    await prisma.users.delete({ where: { id: user_id } });
    return NextResponse.json({ success: true });
}
