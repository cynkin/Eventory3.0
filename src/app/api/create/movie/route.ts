import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "vendor") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { title, description, ageRating, duration, genres, image, commission } = await req.json();
    if (!title || !description || !ageRating || !duration || !image || commission === undefined) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
        const movie = await prisma.movies.create({
            data: {
                title: title.trim(),
                description,
                ageRating,
                duration: Number(duration),
                genres: genres ?? [],
                image,
                commission: Number(commission),
                users: { connect: { id: session.user.id } },
            },
        });
        return NextResponse.json({ success: true, id: movie.id });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
