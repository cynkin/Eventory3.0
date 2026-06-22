import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

export async function GET() {
    const session = await auth();
    if (!session || session.user.role !== "admin")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const [users, movies, concerts, trains, movieTickets, concertTickets, trainTickets] =
        await Promise.all([
            prisma.users.count(),
            prisma.movies.count(),
            prisma.concerts.count(),
            prisma.trains.count(),
            prisma.tickets.count(),
            prisma.concert_tickets.count(),
            prisma.train_tickets.count(),
        ]);

    return NextResponse.json({ users, movies, concerts, trains, movieTickets, concertTickets, trainTickets });
}
