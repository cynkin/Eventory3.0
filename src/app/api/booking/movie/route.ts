// Internal route called by the Go WebSocket server after validating seat holds.
// Protected by a shared secret header — never called directly by the browser.
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import prisma from "@/lib/db";
import { sendMovieTicketEmail } from "@/lib/email/tickets/sendTicketEmail";

const INTERNAL_SECRET = process.env.WS_INTERNAL_SECRET ?? "";

export async function POST(req: NextRequest) {
    if (req.headers.get("x-internal-secret") !== INTERNAL_SECRET || !INTERNAL_SECRET) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId, slotId, selectedSeats: seats, amount } = await req.json();

    if (!userId || !slotId || !Array.isArray(seats) || seats.length === 0 || typeof amount !== "number" || amount <= 0) {
        return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const [show, user] = await Promise.all([
        prisma.shows.findUnique({
            where: { id: slotId },
            include: { movies: true, theatres: true },
        }),
        prisma.users.findUnique({ where: { id: userId } }),
    ]);

    if (!show) return NextResponse.json({ error: "Show not found" }, { status: 404 });
    if (!user?.email) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const currentBalance = Number(user.balance);
    if (currentBalance < amount) {
        return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    const showSeats = show.seats as any[][];
    const { movies: movie, theatres: theatre } = show;
    const movieCut = amount * (movie.commission / 100);
    const theatreCut = amount - movieCut;

    // Mark seats as booked in the layout
    const updatedSeats = showSeats.map((row) =>
        row.map((seat) => (seats.includes(seat.code) ? { ...seat, status: "booked" } : seat))
    );

    let ticket;
    try {
        const result = await prisma.$transaction(async (tx) => {
            await tx.shows.update({ where: { id: slotId }, data: { seats: updatedSeats } });
            await tx.users.update({ where: { id: userId }, data: { balance: { decrement: amount } } });
            await tx.users.update({ where: { id: movie.vendor_id }, data: { balance: { increment: movieCut } } });
            await tx.users.update({ where: { id: theatre.vendor_id }, data: { balance: { increment: theatreCut } } });
            return tx.tickets.create({
                data: { id: randomUUID(), seats, amount, users: { connect: { id: userId } }, shows: { connect: { id: slotId } } },
            });
        });
        ticket = result;
    } catch (e) {
        console.error("Movie booking transaction failed:", e);
        return NextResponse.json({ error: "Payment failed. Please try again." }, { status: 500 });
    }

    const ticketData = {
        amount,
        seats,
        time: show.time,
        date: show.date,
        language: show.language,
        booking_id: ticket.id,
        location: theatre.location,
        movie: { title: movie.title, image: movie.image, ageRating: movie.ageRating },
    };

    sendMovieTicketEmail(ticketData, user.email).catch((e) =>
        console.error("Failed to send movie ticket email:", e)
    );

    return NextResponse.json({
        success: true,
        ticketData,
        newBalance: currentBalance - amount,
    });
}
