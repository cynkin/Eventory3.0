'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateMoviePage() {
    const router = useRouter();
    const [form, setForm] = useState({
        title: "", description: "", ageRating: "U", duration: "", genres: "", image: "", commission: "10",
    });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm((f) => ({ ...f, [k]: e.target.value }));

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        const res = await fetch("/api/create/movie", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...form,
                duration: Number(form.duration),
                commission: Number(form.commission),
                genres: form.genres.split(",").map((g) => g.trim()).filter(Boolean),
            }),
        });
        const data = await res.json();
        setSubmitting(false);
        if (data.success) router.push("/account/history");
        else setError(data.error ?? "Failed to create movie");
    }

    return (
        <div className="xl:px-44 px-4 py-10 max-w-xl">
            <h1 className="text-2xl font-bold mb-6">Add Movie</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input required placeholder="Title" value={form.title} onChange={set("title")} className="border rounded px-3 py-2" />
                <textarea required placeholder="Description" value={form.description} onChange={set("description")} className="border rounded px-3 py-2 h-24" />
                <select value={form.ageRating} onChange={set("ageRating")} className="border rounded px-3 py-2 bg-white">
                    {["U", "U/A 7+", "U/A 13+", "U/A 16+", "A"].map((r) => <option key={r}>{r}</option>)}
                </select>
                <input required type="number" placeholder="Duration (minutes)" value={form.duration} onChange={set("duration")} className="border rounded px-3 py-2" />
                <input placeholder="Genres (comma-separated)" value={form.genres} onChange={set("genres")} className="border rounded px-3 py-2" />
                <input required placeholder="Poster image URL" value={form.image} onChange={set("image")} className="border rounded px-3 py-2" />
                <input required type="number" placeholder="Commission %" value={form.commission} onChange={set("commission")} className="border rounded px-3 py-2" />
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button disabled={submitting} className="bg-[#1568e3] text-white rounded-full py-2 cursor-pointer hover:bg-[#0d4eaf] disabled:opacity-50">
                    {submitting ? "Creating..." : "Create Movie"}
                </button>
            </form>
        </div>
    );
}
