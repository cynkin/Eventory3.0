'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, BarChart3 } from "lucide-react";

type User = {
    id: string;
    name: string | null;
    email: string;
    role: string;
    balance: number | null;
    google_id: string | null;
};

type Stats = {
    users: number; movies: number; concerts: number; trains: number;
    movieTickets: number; concertTickets: number; trainTickets: number;
};

export default function AdminPanel({ initialUsers, stats }: { initialUsers: User[]; stats: Stats }) {
    const router = useRouter();
    const [tab, setTab] = useState<"stats" | "users">("stats");
    const [users, setUsers] = useState(initialUsers);
    const [loading, setLoading] = useState<string | null>(null);

    async function toggleSuspend(user: User) {
        setLoading(user.id);
        await fetch("/api/admin/user/suspend", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: user.id, action: user.google_id }),
        });
        setUsers((prev) =>
            prev.map((u) =>
                u.id === user.id
                    ? { ...u, google_id: u.google_id === "suspended" ? "old" : "suspended" }
                    : u
            )
        );
        setLoading(null);
    }

    async function deleteUser(user: User) {
        if (!confirm(`Delete ${user.name ?? user.email}? This cannot be undone.`)) return;
        setLoading(user.id);
        await fetch("/api/admin/user/delete", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: user.id }),
        });
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        setLoading(null);
        router.refresh();
    }

    const statCards = [
        { label: "Users", value: stats.users },
        { label: "Movies", value: stats.movies },
        { label: "Concerts", value: stats.concerts },
        { label: "Trains", value: stats.trains },
        { label: "Movie Tickets", value: stats.movieTickets },
        { label: "Concert Tickets", value: stats.concertTickets },
        { label: "Train Tickets", value: stats.trainTickets },
    ];

    return (
        <div className="xl:px-44 px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

            <div className="flex gap-2 mb-6 border-b">
                <button
                    onClick={() => setTab("stats")}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${tab === "stats" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}
                >
                    <BarChart3 className="w-4 h-4" /> Statistics
                </button>
                <button
                    onClick={() => setTab("users")}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${tab === "users" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}
                >
                    <Users className="w-4 h-4" /> Users
                </button>
            </div>

            {tab === "stats" && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {statCards.map(({ label, value }) => (
                        <div key={label} className="border rounded-xl p-5 flex flex-col gap-1">
                            <div className="text-3xl font-bold">{value}</div>
                            <div className="text-sm text-gray-500">{label}</div>
                        </div>
                    ))}
                </div>
            )}

            {tab === "users" && (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="border-b text-left text-gray-500">
                                <th className="py-3 pr-4 font-medium">Name</th>
                                <th className="py-3 pr-4 font-medium">Email</th>
                                <th className="py-3 pr-4 font-medium">Role</th>
                                <th className="py-3 pr-4 font-medium">Balance</th>
                                <th className="py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => {
                                const isSuspended = user.google_id === "suspended";
                                const isMe = user.role === "admin";
                                return (
                                    <tr key={user.id} className="border-b hover:bg-gray-50">
                                        <td className="py-3 pr-4">
                                            <div className="font-medium">{user.name ?? "—"}</div>
                                            {isSuspended && (
                                                <span className="text-xs text-red-500 font-medium">Suspended</span>
                                            )}
                                        </td>
                                        <td className="py-3 pr-4 text-gray-600">{user.email}</td>
                                        <td className="py-3 pr-4">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                                user.role === "admin" ? "bg-red-100 text-red-700" :
                                                user.role === "vendor" ? "bg-yellow-100 text-yellow-700" :
                                                "bg-blue-100 text-blue-700"
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-3 pr-4 text-gray-600">₹{user.balance ?? 0}</td>
                                        <td className="py-3 flex gap-2">
                                            {!isMe && (
                                                <>
                                                    <button
                                                        disabled={loading === user.id}
                                                        onClick={() => toggleSuspend(user)}
                                                        className={`text-xs px-3 py-1 rounded border cursor-pointer disabled:opacity-50 transition-colors ${
                                                            isSuspended
                                                                ? "border-green-500 text-green-600 hover:bg-green-50"
                                                                : "border-orange-400 text-orange-600 hover:bg-orange-50"
                                                        }`}
                                                    >
                                                        {isSuspended ? "Unsuspend" : "Suspend"}
                                                    </button>
                                                    <button
                                                        disabled={loading === user.id}
                                                        onClick={() => deleteUser(user)}
                                                        className="text-xs px-3 py-1 rounded border border-red-400 text-red-600 hover:bg-red-50 cursor-pointer disabled:opacity-50 transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
