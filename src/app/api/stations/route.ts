import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
    const q = new URL(req.url).searchParams.get("q")?.toLowerCase() ?? "";
    if (!q) return NextResponse.json({ success: false, error: "Query required" }, { status: 400 });

    const stations = await prisma.stations.findMany({
        where: {
            OR: [
                { name: { startsWith: q, mode: "insensitive" } },
                { code: { startsWith: q, mode: "insensitive" } },
            ],
        },
        take: 6,
    });

    return NextResponse.json({ success: true, stations });
}
