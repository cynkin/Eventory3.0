import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { randomUUID } from "crypto";
import { sendConcertTicketEmail } from "@/lib/email/tickets/sendTicketEmail";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, concertShowId, noOfSeats } = body;

        if (!userId || !concertShowId || !noOfSeats || noOfSeats <= 0) {
            return NextResponse.json(
                { success: false, error: "Missing or invalid parameters" },
                { status: 400 }
            );
        }

        // Fetch show + concert + user in parallel
        const [show, user] = await Promise.all([
            prisma.concert_shows.findUnique({
                where: { id: concertShowId },
                include: { concerts: true },
            }),
            prisma.users.findUnique({ where: { id: userId } }),
        ]);

        if (!show) {
            return NextResponse.json(
                { success: false, error: "Concert show not found" },
                { status: 404 }
            );
        }

        if (!user || !user.email) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        if (show.seats < noOfSeats) {
            return NextResponse.json(
                { success: false, error: "Not enough seats available" },
                { status: 400 }
            );
        }

        const amount = show.concerts.cost * noOfSeats;
        const concert = show.concerts;
        const currentBalance = Number(user.balance);

        if (currentBalance < amount) {
            return NextResponse.json(
                { success: false, error: "Insufficient balance" },
                { status: 400 }
            );
        }

        // Atomic transaction: create ticket + deduct balance + decrease seats + transfer funds
        const ticket = await prisma.$transaction(async (tx) => {
            // 1. Decrease available seats on the show
            const updatedShow = await tx.concert_shows.update({
                where: { id: concertShowId },
                data: { seats: { decrement: noOfSeats } },
            });

            // Double-check seats didn't go negative (race condition guard)
            if (updatedShow.seats < 0) {
                throw new Error("Not enough seats available");
            }

            // 2. Deduct user balance
            const updatedUser = await tx.users.update({
                where: { id: userId },
                data: { balance: { decrement: amount } },
            });

            // Guard against negative balance
            if (Number(updatedUser.balance) < 0) {
                throw new Error("Insufficient balance");
            }

            // 3. Transfer funds to concert vendor
            await tx.users.update({
                where: { id: concert.vendor_id },
                data: { balance: { increment: amount } },
            });

            // 4. Create concert ticket
            const newTicket = await tx.concert_tickets.create({
                data: {
                    id: randomUUID(),
                    seats: noOfSeats,
                    amount,
                    users: { connect: { id: userId } },
                    concert_shows: { connect: { id: concertShowId } },
                },
            });

            return { ticket: newTicket, newBalance: Number(updatedUser.balance) };
        });

        const ticketData = {
            booking_id: ticket.ticket.id,
            amount,
            noOfSeats,
            date: show.date,
            time: show.time,
            location: show.location,
            concert: {
                title: concert.title,
                image: concert.image,
                ageRating: concert.ageRating,
            },
        };

        // Send ticket email (fire-and-forget — booking is already successful)
        sendConcertTicketEmail(ticketData, user.email).catch((e) =>
            console.error("Failed to send concert ticket email:", e)
        );

        return NextResponse.json({
            success: true,
            ticketData,
            newBalance: ticket.newBalance,
        });
    } catch (e: any) {
        console.error("Concert booking error:", e);
        return NextResponse.json(
            { success: false, error: e.message || "Booking failed. Please try again." },
            { status: 500 }
        );
    }
}
