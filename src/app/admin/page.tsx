import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import AdminPanel from "./AdminPanel";

export default async function AdminPage() {
    const session = await auth();
    if (!session || session.user.role !== "admin") redirect("/");

    const [users, movies, concerts, trains, movieTickets, concertTickets, trainTickets] =
        await Promise.all([
            prisma.users.findMany({
                select: { id: true, name: true, email: true, role: true, balance: true, google_id: true },
                orderBy: { name: "asc" },
            }),
            prisma.movies.count(),
            prisma.concerts.count(),
            prisma.trains.count(),
            prisma.tickets.count(),
            prisma.concert_tickets.count(),
            prisma.train_tickets.count(),
        ]);

    const stats = { users: users.length, movies, concerts, trains, movieTickets, concertTickets, trainTickets };

    return (
        <AdminPanel
            initialUsers={users.map((u) => ({
                ...u,
                name: u.name ?? null,
                balance: u.balance ? Number(u.balance) : null,
            }))}
            stats={stats}
        />
    );
}
