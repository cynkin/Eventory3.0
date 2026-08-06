import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

type ShowDetail = { date: string; time: string; location: string };

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "vendor") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { title, description, ageRating, seats, genres, languages, cost, duration, image, shows } = await req.json();
    if (!title || !description || !ageRating || !seats || !cost || !duration || !image || !shows?.length) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const sorted: ShowDetail[] = [...shows].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    try {
        const concertId = crypto.randomUUID();
        const concert = await prisma.concerts.create({
            data: {
                id: concertId,
                title: title.trim(),
                description,
                ageRating,
                seats: Number(seats),
                genres: genres ?? [],
                languages: languages ?? [],
                cost: Number(cost),
                duration: Number(duration),
                image,
                start_date: sorted[0].date,
                end_date: sorted[sorted.length - 1].date,
                vendor_id: session.user.id,
            },
        });

        await Promise.all(
            sorted.map((s) =>
                prisma.concert_shows.create({
                    data: {
                        id: crypto.randomUUID(),
                        date: s.date,
                        time: s.time,
                        location: s.location,
                        seats: Number(seats),
                        concert_id: concert.id,
                    },
                })
            )
        );

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
