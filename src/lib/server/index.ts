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

    socket.on("seat:confirm", async ({ slotId, amount, selectedSeats: seats, show }) => {
        const userId = socket.data.userId;
        if (!userId || !seats.length) return;
        console.log("Confirming Seats");

        if (!show) {
            socket.emit("seat:confirm:error", { errors: ["Show not found"] });
            return;
        }

        const showSeats = show.seats;
        const errors: string[] = [];

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

            showSeats[rowIndex][seatIndex].status = "booked";

            clearTimeout(entry.timeout);
            heldSeatsBySlot.get(slotId)?.delete(code);
        }

        if (errors.length > 0) {
            socket.emit("seat:confirm:error", { errors });
            return;
        }

        for (const code of seats) {
            io.to(slotId).emit("seat:booked", { code, slotId });
        }

        await prisma.shows.update({
            where: { id: slotId },
            data: { seats: showSeats }
        });

        const heldList = seatsHeldBySocket.get(socket.id) || [];
        seatsHeldBySocket.set(
            socket.id,
            heldList.filter(seat => !seats.includes(seat.seatCode))
        );

        let ticket;
        try {
            ticket = await prisma.tickets.create({
                data: {
                    id: randomUUID(),
                    seats,
                    amount,
                    users: { connect: { id: userId } },
                    shows: { connect: { id: slotId } },
                }
            });
        } catch (e) {
            console.log(e);
            socket.emit("seat:confirm:error", { errors: ["Error booking tickets"] });
            return;
        }

        const theatre = await prisma.theatres.findUnique({ where: { id: show.theatre_id } });
        const movie = await prisma.movies.findUnique({ where: { id: show.movie_id } });
        if (!theatre || !movie) {
            socket.emit("seat:confirm:error", { errors: ["Movie or Theatre not found"] });
            return;
        }

        const user = await prisma.users.findUnique({ where: { id: userId } });
        if (!user || !user.email) {
            socket.emit("seat:confirm:error", { errors: ["User email not found"] });
            return;
        }

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

        socket.emit("seat:confirm:success", { success: true, ticketData });
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
