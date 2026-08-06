import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { randomUUID } from "crypto";
import prisma from "@/lib/db";
import { sendTrainTicketEmail } from "@/lib/email/tickets/sendTicketEmail";

type SeatRow = { code: string; status: string }[];
type Compartment = { compartment: number; seats: SeatRow[] };

// Grabs the first N available seats from compartment 1
function pickSeats(layout: Compartment[], count: number): string[] {
    const comp = layout.find((c) => c.compartment === 1);
    if (!comp) return [];
    const picked: string[] = [];
    for (const row of comp.seats) {
        for (const seat of row) {
            if (seat.status === "available" && picked.length < count) {
                picked.push(seat.code);
            }
        }
        if (picked.length >= count) break;
    }
    return picked;
}

function markSeatsBooked(layout: Compartment[], codes: string[]): Compartment[] {
    return layout.map((c) =>
        c.compartment === 1
            ? { ...c, seats: c.seats.map((row) => row.map((s) => codes.includes(s.code) ? { ...s, status: "booked" } : s)) }
            : c
    );
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { trainId, fromStation, toStation, passengers } = await req.json();

    if (!trainId || !fromStation || !toStation || !Array.isArray(passengers) || passengers.length === 0) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [train, user] = await Promise.all([
        prisma.trains.findUnique({ where: { id: trainId } }),
        prisma.users.findUnique({ where: { id: userId } }),
    ]);

    if (!train) return NextResponse.json({ error: "Train not found" }, { status: 404 });
    if (!user?.email) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const noOfSeats = passengers.length;
    const cost = fromStation.cost && toStation.cost ? toStation.cost - fromStation.cost : train.additional * noOfSeats;
    const amount = Math.max(cost * noOfSeats, train.additional * noOfSeats);

    if (Number(user.balance) < amount) {
        return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    const layout = train.seatLayout as Compartment[];
    const bookedSeats = pickSeats(layout, noOfSeats);

    if (bookedSeats.length < noOfSeats) {
        return NextResponse.json({ error: "Not enough seats available" }, { status: 400 });
    }

    const updatedLayout = markSeatsBooked(layout, bookedSeats);

    let ticket;
    try {
        const result = await prisma.$transaction(async (tx) => {
            await tx.trains.update({ where: { id: trainId }, data: { seatLayout: updatedLayout } });
            const updatedUser = await tx.users.update({ where: { id: userId }, data: { balance: { decrement: amount } } });
            if (Number(updatedUser.balance) < 0) throw new Error("Insufficient balance");
            await tx.users.update({ where: { id: train.vendor_id }, data: { balance: { increment: amount } } });
            return tx.train_tickets.create({
                data: {
                    id: randomUUID(),
                    amount,
                    seats: bookedSeats,
                    passengers,
                    from_station: fromStation,
                    to_station: toStation,
                    users: { connect: { id: userId } },
                    trains: { connect: { id: trainId } },
                },
            });
        });
        ticket = result;
    } catch (e: any) {
        console.error("Train booking failed:", e);
        return NextResponse.json({ error: e.message ?? "Booking failed" }, { status: 500 });
    }

    const ticketData = {
        booking_id: ticket.id,
        title: train.title,
        trainId: train.train_id,
        amount,
        bookedSeats,
        passengers,
        from: fromStation,
        to: toStation,
    };

    sendTrainTicketEmail(ticketData, user.email).catch((e) =>
        console.error("Failed to send train ticket email:", e)
    );

    return NextResponse.json({
        success: true,
        newBalance: Number(user.balance) - amount,
    });
}
