'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus } from "lucide-react";

type ShowSlot = { date: string; time: string; location: string };

export default function CreateConcertPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        title: "", description: "", ageRating: "U", seats: "500", genres: "",
        languages: "", cost: "", duration: "", image: "",
    });
    const [shows, setShows] = useState<ShowSlot[]>([{ date: "", time: "", location: "" }]);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm((f) => ({ ...f, [k]: e.target.value }));

    function updateShow(i: number, k: keyof ShowSlot, v: string) {
        setShows((s) => s.map((show, idx) => idx === i ? { ...show, [k]: v } : show));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        const res = await fetch("/api/create/concert", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...form,
                seats: Number(form.seats),
                cost: Number(form.cost),
                duration: Number(form.duration),
                genres: form.genres.split(",").map((g) => g.trim()).filter(Boolean),
                languages: form.languages.split(",").map((l) => l.trim()).filter(Boolean),
                shows,
            }),
        });
        const data = await res.json();
        setSubmitting(false);
        if (data.success) router.push("/account/history");
        else setError(data.error ?? "Failed to create concert");
    }

    return (
        <div className="xl:px-44 px-4 py-10 max-w-xl">
            <h1 className="text-2xl font-bold mb-6">Add Concert</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input required placeholder="Title" value={form.title} onChange={set("title")} className="border rounded px-3 py-2" />
                <textarea required placeholder="Description" value={form.description} onChange={set("description")} className="border rounded px-3 py-2 h-24" />
                <select value={form.ageRating} onChange={set("ageRating")} className="border rounded px-3 py-2 bg-white">
                    {["U", "U/A 7+", "U/A 13+", "U/A 16+", "A"].map((r) => <option key={r}>{r}</option>)}
                </select>
                <input required type="number" placeholder="Total seats" value={form.seats} onChange={set("seats")} className="border rounded px-3 py-2" />
                <input required type="number" placeholder="Cost per person (₹)" value={form.cost} onChange={set("cost")} className="border rounded px-3 py-2" />
                <input required type="number" placeholder="Duration (minutes)" value={form.duration} onChange={set("duration")} className="border rounded px-3 py-2" />
                <input placeholder="Genres (comma-separated)" value={form.genres} onChange={set("genres")} className="border rounded px-3 py-2" />
                <input placeholder="Languages (comma-separated)" value={form.languages} onChange={set("languages")} className="border rounded px-3 py-2" />
                <input required placeholder="Poster image URL" value={form.image} onChange={set("image")} className="border rounded px-3 py-2" />

                <div className="border rounded p-3">
                    <div className="font-medium mb-2">Show Dates</div>
                    {shows.map((s, i) => (
                        <div key={i} className="flex gap-2 mb-2 flex-wrap">
                            <input required type="date" value={s.date} onChange={(e) => updateShow(i, "date", e.target.value)} className="border rounded px-2 py-1" />
                            <input required type="time" value={s.time} onChange={(e) => updateShow(i, "time", e.target.value)} className="border rounded px-2 py-1" />
                            <input required placeholder="Location" value={s.location} onChange={(e) => updateShow(i, "location", e.target.value)} className="border rounded px-2 py-1 flex-1" />
                        </div>
                    ))}
                    <div className="flex gap-3 mt-1">
                        <button type="button" onClick={() => setShows((s) => [...s, { date: "", time: "", location: "" }])} className="flex items-center gap-1 text-sm text-blue-600 cursor-pointer">
                            <Plus className="w-4 h-4" /> Add show
                        </button>
                        {shows.length > 1 && (
                            <button type="button" onClick={() => setShows((s) => s.slice(0, -1))} className="flex items-center gap-1 text-sm text-red-500 cursor-pointer">
                                <Minus className="w-4 h-4" /> Remove
                            </button>
                        )}
                    </div>
                </div>

                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button disabled={submitting} className="bg-[#1568e3] text-white rounded-full py-2 cursor-pointer hover:bg-[#0d4eaf] disabled:opacity-50">
                    {submitting ? "Creating..." : "Create Concert"}
                </button>
            </form>
        </div>
    );
}
