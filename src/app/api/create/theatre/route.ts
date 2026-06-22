import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "vendor") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { location, movieId, seatLayout } = await req.json();
    if (!location || !movieId || !seatLayout) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
        const theatre = await prisma.theatres.create({
            data: {
                id: crypto.randomUUID(),
                location,
                seatLayout: seatLayout.layout ?? seatLayout,
                movie_id: movieId,
                vendor_id: session.user.id,
            },
        });
        return NextResponse.json({ success: true, id: theatre.id });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
