'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";

// Default 8×10 seat layout — vendor can paste their own JSON
const DEFAULT_LAYOUT = {
    layout: Array.from({ length: 8 }, (_, row) =>
        Array.from({ length: 10 }, (_, col) => ({
            code: `${String.fromCharCode(65 + row)}${col + 1}`,
            type: row < 2 ? "vip" : "regular",
            status: "available",
        }))
    ),
};

export default function CreateTheatrePage() {
    const router = useRouter();
    const [location, setLocation] = useState("");
    const [movieId, setMovieId] = useState("");
    const [rows, setRows] = useState(8);
    const [cols, setCols] = useState(10);
    const [vipRows, setVipRows] = useState(2);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    function buildLayout() {
        return {
            layout: Array.from({ length: rows }, (_, r) =>
                Array.from({ length: cols }, (_, c) => ({
                    code: `${String.fromCharCode(65 + r)}${c + 1}`,
                    type: r < vipRows ? "vip" : "regular",
                    status: "available",
                }))
            ),
        };
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        const res = await fetch("/api/create/theatre", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ location, movieId, seatLayout: buildLayout() }),
        });
        const data = await res.json();
        setSubmitting(false);
        if (data.success) router.push("/account/history");
        else setError(data.error ?? "Failed to create theatre");
    }

    return (
        <div className="xl:px-44 px-4 py-10 max-w-xl">
            <h1 className="text-2xl font-bold mb-6">Add Theatre</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input required placeholder="Location / Theatre name" value={location} onChange={(e) => setLocation(e.target.value)} className="border rounded px-3 py-2" />
                <input required placeholder="Movie ID (UUID)" value={movieId} onChange={(e) => setMovieId(e.target.value)} className="border rounded px-3 py-2" />
                <div className="flex gap-3">
                    <label className="flex flex-col text-sm flex-1">
                        Rows
                        <input type="number" min={1} max={26} value={rows} onChange={(e) => setRows(Number(e.target.value))} className="border rounded px-3 py-2 mt-1" />
                    </label>
                    <label className="flex flex-col text-sm flex-1">
                        Columns
                        <input type="number" min={1} max={30} value={cols} onChange={(e) => setCols(Number(e.target.value))} className="border rounded px-3 py-2 mt-1" />
                    </label>
                    <label className="flex flex-col text-sm flex-1">
                        VIP rows
                        <input type="number" min={0} max={rows} value={vipRows} onChange={(e) => setVipRows(Number(e.target.value))} className="border rounded px-3 py-2 mt-1" />
                    </label>
                </div>
                <p className="text-sm text-gray-500">Layout: {rows} rows × {cols} cols · {vipRows} VIP row(s)</p>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button disabled={submitting} className="bg-[#1568e3] text-white rounded-full py-2 cursor-pointer hover:bg-[#0d4eaf] disabled:opacity-50">
                    {submitting ? "Creating..." : "Create Theatre"}
                </button>
            </form>
        </div>
    );
}
