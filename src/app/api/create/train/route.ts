import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "vendor") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { title, trainId, compartments, stations, additional, seatLayout } = await req.json();
    if (!title || !trainId || !compartments || !stations?.length || !seatLayout) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Replicate the seat layout across all compartments
    const layout = Array.from({ length: Number(compartments) }, (_, i) => ({
        compartment: i + 1,
        seats: seatLayout.layout ?? seatLayout,
    }));

    try {
        const train = await prisma.trains.create({
            data: {
                id: crypto.randomUUID(),
                title,
                train_id: Number(trainId),
                compartments: Number(compartments),
                stations,
                additional: Number(additional ?? 0),
                seatLayout: layout,
                vendor_id: session.user.id,
            },
        });
        return NextResponse.json({ success: true, id: train.id });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
