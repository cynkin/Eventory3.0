'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Hash, Info, Minus, Plus } from "lucide-react";

type Station = { location: string; date: string; time: string; cost: number };
type Train = { id: string; title: string; train_id: number; stations: Station[]; additional: number };
type Passenger = { name: string; gender: string; age: number };

export default function TrainBooking({ train }: { train: Train }) {
    const { data: session, update } = useSession();
    const router = useRouter();

    const [from, setFrom] = useState<Station | null>(null);
    const [to, setTo] = useState<Station | null>(null);
    const [step, setStep] = useState<"from" | "to">("from");

    const [passengers, setPassengers] = useState<Passenger[]>([{ name: "", gender: "", age: 0 }]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const stations = train.stations as Station[];
    const cost = from && to ? to.cost - from.cost : 0;
    const total = cost * passengers.length;

    function selectStation(station: Station) {
        // Clicking an already-selected station deselects it
        if (from?.location === station.location) {
            setFrom(null);
            setTo(null);
            setStep("from");
            setError(null);
            return;
        }
        if (to?.location === station.location) {
            setTo(null);
            setStep("to");
            setError(null);
            return;
        }

        if (step === "from") {
            setFrom(station);
            setTo(null);
            setStep("to");
            setError(null);
        } else {
            const fromIdx = stations.findIndex((s) => s.location === from!.location);
            const toIdx = stations.findIndex((s) => s.location === station.location);
            if (toIdx <= fromIdx) {
                setError("'To' must come after 'From'");
                return;
            }
            setTo(station);
            setError(null);
            setStep("from");
        }
    }

    function updatePassenger(i: number, field: keyof Passenger, value: string | number) {
        setPassengers((prev) => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
    }

    async function handleBook() {
        if (!session?.user?.id) return;
        if (!from || !to) { setError("Select from and to stations"); return; }
        if (passengers.some((p) => !p.name || !p.gender || !p.age)) {
            setError("Fill in all passenger details");
            return;
        }
        if (Number(session.user.balance) < total) { setError("Insufficient balance"); return; }

        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch("/api/booking/train", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ trainId: train.id, fromStation: from, toStation: to, passengers }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error ?? "Booking failed"); return; }
            await update({ balance: data.newBalance });
            router.push("/account/history");
        } catch {
            setError("Something went wrong");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="xl:px-44 px-4 py-8 flex gap-10 flex-wrap">
            {/* Left: route selector */}
            <div className="flex flex-col items-start">
                <div className="text-4xl font-bold mb-1">{train.title}</div>
                <div className="flex items-center text-gray-500 mb-6">
                    <Hash className="w-4 h-4 mr-1" />{train.train_id}
                </div>

                <div className="text-sm font-medium text-gray-500 mb-3">
                    Selecting: <span className="font-bold text-gray-900">{step === "from" ? "From station" : "To station"}</span>
                </div>

                <div className="relative">
                    <div className="absolute top-10 left-5 bottom-0 w-px bg-blue-300 z-0" />
                    {stations.map((s, i) => {
                        const isFrom = from?.location === s.location;
                        const isTo = to?.location === s.location;
                        return (
                            <div key={i} className="relative z-10 flex items-center gap-4 my-4">
                                <button
                                    onClick={() => selectStation(s)}
                                    className={`w-4 h-4 rounded-full border-2 border-white shadow ${isFrom ? "bg-red-500" : isTo ? "bg-blue-500" : "bg-gray-700"}`}
                                />
                                <button
                                    onClick={() => selectStation(s)}
                                    className={`border-2 rounded-lg px-4 py-2 bg-white cursor-pointer ${isFrom ? "border-red-400 text-red-500" : isTo ? "border-blue-400 text-blue-500" : "border-gray-300"}`}
                                >
                                    <div className="font-medium">{s.location}</div>
                                    <div className="text-xs text-gray-400">{s.date} · {s.time}</div>
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                    <Info className="w-4 h-4" /> Click a station to select From, then To
                </div>
            </div>

            {/* Right: passengers + payment */}
            <div className="flex flex-col gap-4 min-w-[300px]">
                <div className="border border-gray-300 rounded-xl p-4">
                    <div className="font-semibold text-lg mb-3">Passengers</div>
                    {passengers.map((p, i) => (
                        <div key={i} className="flex gap-2 mb-3 flex-wrap">
                            <input
                                className="border rounded px-2 py-1 flex-1 min-w-[120px]"
                                placeholder="Full name"
                                value={p.name}
                                onChange={(e) => updatePassenger(i, "name", e.target.value)}
                            />
                            <select
                                className="border rounded px-2 py-1 bg-white"
                                value={p.gender}
                                onChange={(e) => updatePassenger(i, "gender", e.target.value)}
                            >
                                <option value="">Gender</option>
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>
                            <input
                                type="number"
                                className="border rounded px-2 py-1 w-16"
                                placeholder="Age"
                                value={p.age || ""}
                                onChange={(e) => updatePassenger(i, "age", Number(e.target.value))}
                            />
                        </div>
                    ))}
                    <div className="flex gap-2 mt-1">
                        <button onClick={() => setPassengers((p) => [...p, { name: "", gender: "", age: 0 }])}
                            className="flex items-center gap-1 text-sm text-blue-600 cursor-pointer">
                            <Plus className="w-4 h-4" /> Add
                        </button>
                        {passengers.length > 1 && (
                            <button onClick={() => setPassengers((p) => p.slice(0, -1))}
                                className="flex items-center gap-1 text-sm text-red-500 cursor-pointer">
                                <Minus className="w-4 h-4" /> Remove
                            </button>
                        )}
                    </div>
                </div>

                {from && to && (
                    <div className="border border-gray-300 rounded-xl p-4">
                        <div className="font-semibold text-lg mb-2">Payment</div>
                        <div className="text-sm text-gray-600 mb-1">{from.location} → {to.location}</div>
                        <div className="flex justify-between font-medium">
                            <span>{passengers.length} × ₹{cost}</span>
                            <span>₹{total}</span>
                        </div>
                    </div>
                )}

                {error && <div className="text-sm text-red-600 font-medium">{error}</div>}

                <button
                    disabled={!from || !to || submitting}
                    onClick={handleBook}
                    className="px-4 py-2 rounded-full bg-[#1568e3] text-white hover:bg-[#0d4eaf] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                    {submitting ? "Booking..." : "Confirm Booking"}
                </button>
            </div>
        </div>
    );
}
