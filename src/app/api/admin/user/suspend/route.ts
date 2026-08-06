import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session || session.user.role !== "admin")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { user_id, action } = await req.json();
    // action === "suspended" means currently suspended → unsuspend; otherwise → suspend
    const google_id = action === "suspended" ? "old" : "suspended";

    await prisma.users.update({ where: { id: user_id }, data: { google_id } });
    return NextResponse.json({ success: true });
}
