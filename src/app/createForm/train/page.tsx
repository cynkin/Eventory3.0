'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus } from "lucide-react";

type Station = { location: string; date: string; time: string; cost: number };

export default function CreateTrainPage() {
    const router = useRouter();
    const [form, setForm] = useState({ title: "", trainId: "", compartments: "1", rows: "8", cols: "10", additional: "0" });
    const [stations, setStations] = useState<Station[]>([
        { location: "", date: "", time: "", cost: 0 },
        { location: "", date: "", time: "", cost: 0 },
    ]);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [k]: e.target.value }));

    function updateStation(i: number, k: keyof Station, v: string | number) {
        setStations((s) => s.map((st, idx) => idx === i ? { ...st, [k]: v } : st));
    }

    function buildSeatLayout(rows: number, cols: number) {
        return {
            layout: Array.from({ length: rows }, (_, r) =>
                Array.from({ length: cols }, (_, c) => ({
                    code: `${String.fromCharCode(65 + r)} ${c + 1}`,
                    type: "regular",
                    status: "available",
                }))
            ),
        };
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        const res = await fetch("/api/create/train", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: form.title,
                trainId: Number(form.trainId),
                compartments: Number(form.compartments),
                additional: Number(form.additional),
                stations,
                seatLayout: buildSeatLayout(Number(form.rows), Number(form.cols)),
            }),
        });
        const data = await res.json();
        setSubmitting(false);
        if (data.success) router.push("/account/history");
        else setError(data.error ?? "Failed to create train");
    }

    return (
        <div className="xl:px-44 px-4 py-10 max-w-xl">
            <h1 className="text-2xl font-bold mb-6">Add Train</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input required placeholder="Train name" value={form.title} onChange={set("title")} className="border rounded px-3 py-2" />
                <input required type="number" placeholder="Train number" value={form.trainId} onChange={set("trainId")} className="border rounded px-3 py-2" />
                <div className="flex gap-3">
                    <label className="flex flex-col text-sm flex-1">
                        Compartments
                        <input type="number" min={1} value={form.compartments} onChange={set("compartments")} className="border rounded px-3 py-2 mt-1" />
                    </label>
                    <label className="flex flex-col text-sm flex-1">
                        Rows per compartment
                        <input type="number" min={1} max={26} value={form.rows} onChange={set("rows")} className="border rounded px-3 py-2 mt-1" />
                    </label>
                    <label className="flex flex-col text-sm flex-1">
                        Seats per row
                        <input type="number" min={1} max={20} value={form.cols} onChange={set("cols")} className="border rounded px-3 py-2 mt-1" />
                    </label>
                </div>
                <input type="number" placeholder="Additional charge per seat (₹)" value={form.additional} onChange={set("additional")} className="border rounded px-3 py-2" />

                <div className="border rounded p-3">
                    <div className="font-medium mb-2">Stations</div>
                    {stations.map((s, i) => (
                        <div key={i} className="flex gap-2 mb-2 flex-wrap">
                            <input required placeholder="Station name" value={s.location} onChange={(e) => updateStation(i, "location", e.target.value)} className="border rounded px-2 py-1 flex-1 min-w-[120px]" />
                            <input required type="date" value={s.date} onChange={(e) => updateStation(i, "date", e.target.value)} className="border rounded px-2 py-1" />
                            <input required type="time" value={s.time} onChange={(e) => updateStation(i, "time", e.target.value)} className="border rounded px-2 py-1" />
                            <input type="number" placeholder="Cost (₹)" value={s.cost} onChange={(e) => updateStation(i, "cost", Number(e.target.value))} className="border rounded px-2 py-1 w-24" />
                        </div>
                    ))}
                    <div className="flex gap-3 mt-1">
                        <button type="button" onClick={() => setStations((s) => [...s, { location: "", date: "", time: "", cost: 0 }])} className="flex items-center gap-1 text-sm text-blue-600 cursor-pointer">
                            <Plus className="w-4 h-4" /> Add station
                        </button>
                        {stations.length > 2 && (
                            <button type="button" onClick={() => setStations((s) => s.slice(0, -1))} className="flex items-center gap-1 text-sm text-red-500 cursor-pointer">
                                <Minus className="w-4 h-4" /> Remove
                            </button>
                        )}
                    </div>
                </div>

                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button disabled={submitting} className="bg-[#1568e3] text-white rounded-full py-2 cursor-pointer hover:bg-[#0d4eaf] disabled:opacity-50">
                    {submitting ? "Creating..." : "Create Train"}
                </button>
            </form>
        </div>
    );
}
