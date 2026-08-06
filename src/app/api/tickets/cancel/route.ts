import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { bookingId, type } = await req.json();
    if (!bookingId || !type) {
        return NextResponse.json({ error: "Missing bookingId or type" }, { status: 400 });
    }

    try {
        if (type === "movie") {
            const ticket = await prisma.tickets.findUnique({
                where: { id: bookingId },
                include: { shows: { include: { movies: true, theatres: true } } },
            });
            if (!ticket || ticket.user_id !== userId) {
                return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
            }
            if (ticket.status === "cancelled") {
                return NextResponse.json({ error: "Already cancelled" }, { status: 400 });
            }

            const { shows: show } = ticket;
            const commission = show.movies.commission;
            const movieCut = ticket.amount * (commission / 100);
            const theatreCut = ticket.amount - movieCut;

            // Free seats in the show layout
            const updatedSeats = (show.seats as any[][]).map((row) =>
                row.map((seat) =>
                    ticket.seats.includes(seat.code) ? { ...seat, status: "available" } : seat
                )
            );

            await prisma.$transaction([
                prisma.tickets.update({ where: { id: bookingId }, data: { status: "cancelled" } }),
                prisma.shows.update({ where: { id: show.id }, data: { seats: updatedSeats } }),
                prisma.users.update({ where: { id: userId }, data: { balance: { increment: ticket.amount } } }),
                prisma.users.update({ where: { id: show.movies.vendor_id }, data: { balance: { decrement: movieCut } } }),
                prisma.users.update({ where: { id: show.theatres.vendor_id }, data: { balance: { decrement: theatreCut } } }),
            ]);

            return NextResponse.json({ success: true, refund: ticket.amount });
        }

        if (type === "concert") {
            const ticket = await prisma.concert_tickets.findUnique({
                where: { id: bookingId },
                include: { concert_shows: { include: { concerts: true } } },
            });
            if (!ticket || ticket.user_id !== userId) {
                return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
            }
            if (ticket.status === "cancelled") {
                return NextResponse.json({ error: "Already cancelled" }, { status: 400 });
            }

            const vendorId = ticket.concert_shows.concerts.vendor_id;

            await prisma.$transaction([
                prisma.concert_tickets.update({ where: { id: bookingId }, data: { status: "cancelled" } }),
                prisma.concert_shows.update({ where: { id: ticket.concert_show_id }, data: { seats: { increment: ticket.seats } } }),
                prisma.users.update({ where: { id: userId }, data: { balance: { increment: ticket.amount } } }),
                prisma.users.update({ where: { id: vendorId }, data: { balance: { decrement: ticket.amount } } }),
            ]);

            return NextResponse.json({ success: true, refund: ticket.amount });
        }

        if (type === "train") {
            const ticket = await prisma.train_tickets.findUnique({
                where: { id: bookingId },
                include: { trains: true },
            });
            if (!ticket || ticket.user_id !== userId) {
                return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
            }
            if (ticket.status === "cancelled") {
                return NextResponse.json({ error: "Already cancelled" }, { status: 400 });
            }

            // Free seats in the train layout (compartment 1)
            type SeatRow = { code: string; status: string }[];
            type Compartment = { compartment: number; seats: SeatRow[] };
            const layout = ticket.trains.seatLayout as Compartment[];
            const updatedLayout = layout.map((c) =>
                c.compartment === 1
                    ? { ...c, seats: c.seats.map((row) => row.map((s) => ticket.seats.includes(s.code) ? { ...s, status: "available" } : s)) }
                    : c
            );

            await prisma.$transaction([
                prisma.train_tickets.update({ where: { id: bookingId }, data: { status: "cancelled" } }),
                prisma.trains.update({ where: { id: ticket.train_id }, data: { seatLayout: updatedLayout } }),
                prisma.users.update({ where: { id: userId }, data: { balance: { increment: ticket.amount } } }),
                prisma.users.update({ where: { id: ticket.trains.vendor_id }, data: { balance: { decrement: ticket.amount } } }),
            ]);

            return NextResponse.json({ success: true, refund: ticket.amount });
        }

        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    } catch (err) {
        console.error("Cancel error:", err);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
