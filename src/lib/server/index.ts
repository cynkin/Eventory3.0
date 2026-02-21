import { Server } from "socket.io";
import prisma from "@/lib/db";
import { randomUUID } from "crypto";

const HOLD_DURATION = 60 * 1000;

const io = new Server(4000, {
    cors: {
        origin: ["https://eventory-1gfmp43sx-lohith-vs-projects.vercel.app"],
        methods: ["GET", "POST"]
    }
});

const heldSeatsBySlot = new Map<string, Map<string, any>>();
const seatsHeldBySocket = new Map<string, any[]>();

function findSeatIndex(layout: any[][], code: string) {
    for (let i = 0; i < layout.length; i++) {
        for (let j = 0; j < layout[i].length; j++) {
            if (layout[i][j].code === code) {
                return { rowIndex: i, seatIndex: j };
            }
        }
    }
    return { rowIndex: -1, seatIndex: -1 };
}

io.on("connection", (socket) => {
    console.log("Connected:", socket.id);
    console.log("Total clients:", io.engine.clientsCount);

    socket.on("auth:user", (userId) => {
        socket.data.userId = userId;
        console.log("User:", userId);
    });

    socket.on("join-room", ({ slotId }) => {
        socket.join(slotId);

        const heldMap = heldSeatsBySlot.get(slotId) || new Map();
        socket.emit("seats:init-held", {
            slotId,
            heldSeats: Array.from(heldMap.keys()),
        });
    });

    socket.on("seat:select", ({ code, slotId }) => {
        const userId = socket.data.userId;
        if (!userId) return;

        if (!heldSeatsBySlot.has(slotId)) heldSeatsBySlot.set(slotId, new Map());
        const slotMap = heldSeatsBySlot.get(slotId)!;

        if (slotMap.has(code)) return;

        const timeout = setTimeout(() => {
            slotMap.delete(code);
            io.to(slotId).emit("seat:deleted", { userId });
        }, HOLD_DURATION);

        slotMap.set(code, { userId, timeout });

        if (!seatsHeldBySocket.has(socket.id)) seatsHeldBySocket.set(socket.id, []);
        seatsHeldBySocket.get(socket.id)!.push({ slotId, seatCode: code });

        socket.to(slotId).emit("seat:locked", { code, slotId });
    });

    socket.on("seat:unselect", ({ code, slotId }) => {
        const slotMap = heldSeatsBySlot.get(slotId);
        if (!slotMap) return;

        const entry = slotMap.get(code);
        if (entry?.timeout) clearTimeout(entry.timeout);

        slotMap.delete(code);

        const socketSeats = seatsHeldBySocket.get(socket.id);
        if (socketSeats) {
            seatsHeldBySocket.set(
                socket.id,
                socketSeats.filter(seat => !(seat.slotId === slotId && seat.seatCode === code))
            );
        }

        socket.to(slotId).emit("seat:unlocked", { code, slotId });
    });

    socket.on("seat:confirm", async ({ slotId, amount, selectedSeats: seats }) => {
        const userId = socket.data.userId;
        if (!userId || !seats.length) return;
        console.log("Confirming Seats. userId:", userId, "slotId:", slotId, "amount:", amount, "seats:", seats);

        if (typeof amount !== "number" || amount <= 0) {
            socket.emit("seat:confirm:error", { errors: ["Invalid amount"] });
            return;
        }

        const show = await prisma.shows.findUnique({
            where: { id: slotId },
            include: { movies: true, theatres: true },
        });

        if (!show) {
            socket.emit("seat:confirm:error", { errors: ["Show not found"] });
            return;
        }

        const showSeats = show.seats as any[][];
        const errors: string[] = [];

        // --- Validate all seats before touching anything ---
        for (const code of seats) {
            const { rowIndex, seatIndex } = findSeatIndex(showSeats, code);
            if (rowIndex === -1 || seatIndex === -1) {
                errors.push(`Seat ${code} not found`);
                continue;
            }

            const seat = showSeats[rowIndex][seatIndex];
            if (seat.status === "booked") {
                errors.push(`Seat ${code} is already booked`);
                continue;
            }

            const entry = heldSeatsBySlot.get(slotId)?.get(code);
            if (!entry || entry.userId !== userId) {
                errors.push(`Seat ${code} is not yours`);
                continue;
            }
        }

        if (errors.length > 0) {
            socket.emit("seat:confirm:error", { errors });
            return;
        }

        // --- Check user balance ---
        const user = await prisma.users.findUnique({ where: { id: userId } });
        if (!user || !user.email) {
            socket.emit("seat:confirm:error", { errors: ["User not found"] });
            return;
        }

        const currentBalance = Number(user.balance);
        if (currentBalance < amount) {
            socket.emit("seat:confirm:error", { errors: ["Insufficient balance"] });
            return;
        }

        // --- Mark seats as booked in the layout copy ---
        for (const code of seats) {
            const { rowIndex, seatIndex } = findSeatIndex(showSeats, code);
            showSeats[rowIndex][seatIndex].status = "booked";
        }

        // --- Atomic transaction: update seats + create ticket + deduct balance + transfer funds ---
        const movie = show.movies;
        const theatre = show.theatres;
        const commission = movie.commission; // percentage that goes to movie vendor
        const movieCut = amount * (commission / 100);
        const theatreCut = amount - movieCut;

        // Build a net balance change map to avoid updating the same user row multiple times
        // (which causes conflicts/deadlocks in a transaction)
        const balanceChanges = new Map<string, number>();
        balanceChanges.set(userId, -(amount));
        balanceChanges.set(movie.vendor_id, (balanceChanges.get(movie.vendor_id) ?? 0) + movieCut);
        balanceChanges.set(theatre.vendor_id, (balanceChanges.get(theatre.vendor_id) ?? 0) + theatreCut);

        let ticket;
        try {
            const result = await prisma.$transaction(async (tx) => {
                // 1. Update show seats
                console.log("[TX] Step 1: Updating show seats...");
                await tx.shows.update({
                    where: { id: slotId },
                    data: { seats: showSeats },
                });

                // 2. Apply all balance changes (one update per unique user)
                for (const [uid, change] of balanceChanges.entries()) {
                    if (change === 0) continue;
                    console.log("[TX] Balance change for", uid, ":", change > 0 ? `+${change}` : change);
                    if (change > 0) {
                        await tx.users.update({
                            where: { id: uid },
                            data: { balance: { increment: change } },
                        });
                    } else {
                        await tx.users.update({
                            where: { id: uid },
                            data: { balance: { decrement: Math.abs(change) } },
                        });
                    }
                }

                // 3. Create ticket
                console.log("[TX] Creating ticket...");
                const newTicket = await tx.tickets.create({
                    data: {
                        id: randomUUID(),
                        seats,
                        amount,
                        users: { connect: { id: userId } },
                        shows: { connect: { id: slotId } },
                    },
                });

                console.log("[TX] All steps complete. Ticket:", newTicket.id);
                return newTicket;
            });

            ticket = result;
        } catch (e) {
            console.error("Transaction failed:", e);

            // Rollback: revert seat statuses in memory
            for (const code of seats) {
                const { rowIndex, seatIndex } = findSeatIndex(showSeats, code);
                if (rowIndex !== -1 && seatIndex !== -1) {
                    showSeats[rowIndex][seatIndex].status = "available";
                }
            }

            socket.emit("seat:confirm:error", { errors: ["Payment failed. Please try again."] });
            return;
        }

        // --- Success: clean up holds and notify all clients ---
        for (const code of seats) {
            const entry = heldSeatsBySlot.get(slotId)?.get(code);
            if (entry?.timeout) clearTimeout(entry.timeout);
            heldSeatsBySlot.get(slotId)?.delete(code);
        }

        const heldList = seatsHeldBySocket.get(socket.id) || [];
        seatsHeldBySocket.set(
            socket.id,
            heldList.filter(seat => !seats.includes(seat.seatCode))
        );

        for (const code of seats) {
            io.to(slotId).emit("seat:booked", { code, slotId });
        }

        const newBalance = currentBalance + (balanceChanges.get(userId) ?? 0);

        const ticketData = {
            amount,
            seats,
            time: show.time,
            date: show.date,
            language: show.language,
            booking_id: ticket.id,
            location: theatre.location,
            movie: {
                title: movie.title,
                image: movie.image,
                ageRating: movie.ageRating,
            },
        };

        console.log("[Socket Server]: Seat confirmed");
        socket.emit("seat:confirm:success", { success: true, ticketData, newBalance });
    });

    socket.on("disconnect", () => {
        console.log("Disconnected:", socket.id);
        const socketSeats = seatsHeldBySocket.get(socket.id);
        if (socketSeats) {
            for (const { slotId, seatCode } of socketSeats) {
                const slotMap = heldSeatsBySlot.get(slotId);
                if (!slotMap) continue;
                const entry = slotMap.get(seatCode);

                if (entry?.timeout) clearTimeout(entry.timeout);
                slotMap.delete(seatCode);
                io.to(slotId).emit("seat:unlocked", { code: seatCode, slotId });
            }
            seatsHeldBySocket.delete(socket.id);
        }
        console.log("Remaining clients:", io.engine.clientsCount);
    });
})
