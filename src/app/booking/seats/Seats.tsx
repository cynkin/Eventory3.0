'use client'
import React, { useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import Spinner from "@/components/ui/Spinner";
import socket from "@/lib/utils/socket"
import { useSession } from "next-auth/react";
import { Dot } from "lucide-react";

type Movie = {
    id: string;
    title: string;
    image: string;
    ageRating: string;
    genres: string[];
    duration: number;
    description: string;
    commission: number;
};

type Theatre = {
    id: string;
    location: string;
    seatLayout: any[][]
}

type Show = {
    id: string;
    date: string;
    time: string;
    language: string;
    cost: number;
    premium_cost: number;
}

type Data = {
    show: Show;
    movie: Movie;
    theatre: Theatre;
}

function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const day = date.getDate(); // returns 23 (no leading zero)
    const month = date.toLocaleString('en-US', { month: 'short' }); // "Jul"
    const year = date.getFullYear(); // 2025

    return `${day} ${month}, ${year}`;
}

export default function SeatSelection(data: Data) {
    const router = useRouter();

    const slotId = data.show.id;
    const COSTS = [data.show.cost, data.show.premium_cost];

    const { data: session, status, update } = useSession();
    const user = session?.user;
    const userId = user?.id;
    const email = user?.email;
    const balance = user?.balance;

    const [seatLayout, setLayout] = useState<any[][]>(data.theatre.seatLayout ?? []);
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [amount, setAmount] = useState<number>(0);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [bookingError, setBookingError] = useState<string | null>(null);
    const [type, setType] = useState<{ vip: number; regular: number }>({
        vip: 0,
        regular: 0,
    });

    useEffect(() => {
        if (status !== 'authenticated' || !userId || !slotId) return;

        socket.connect();
        console.log("Connected to server with ID:", socket.id);
        socket.emit("auth:user", userId);
        socket.emit("join-room", { slotId });

        const updateSeatStatus = (code: string, newStatus: "held" | "available") => {
            setLayout(prev =>
                prev?.map(row =>
                    row.map(seat =>
                        seat.code === code && seat.status !== "booked"
                            ? { ...seat, status: newStatus }
                            : seat
                    )
                )
            );
        };

        socket.on("seats:init-held", ({ slotId: incomingId, heldSeats }) => {
            if (slotId !== incomingId) return;
            setLayout(prev =>
                prev?.map(row =>
                    row.map(seat =>
                        heldSeats.includes(seat.code) ? { ...seat, status: "held" } : seat
                    )
                )
            );
        });

        socket.on("seat:locked", ({ code, slotId: incomingId }) => {
            if (slotId !== incomingId) return;
            updateSeatStatus(code, "held");
        });

        socket.on("seat:unlocked", ({ code, slotId: incomingId }) => {
            if (slotId !== incomingId) return;
            updateSeatStatus(code, "available");
        });

        socket.on("seat:deleted", ({ userId: incomingId }) => {
            if (incomingId !== userId) return;
            router.push("/booking?q=movie&id=" + data.movie.id);
        })

        socket.on("seat:booked", ({ code, slotId: incomingId }) => {
            if (slotId !== incomingId) return;

            setLayout(prev =>
                prev?.map(row =>
                    row.map(seat =>
                        seat.code === code
                            ? { ...seat, status: "booked" }
                            : seat
                    )
                )
            );
        })

        socket.on("seat:confirm:success", async ({ ticketData, newBalance }) => {
            console.log("[SEAT CONFIRM SUCCESS]");
            setSubmitting(false);
            setBookingError(null);

            // Update session with the new balance (no DB query — passed directly to JWT)
            await update({ balance: newBalance });

            router.push("/account/history");
        });

        socket.on("seat:confirm:error", ({ errors }: { errors: string[] }) => {
            console.error("Booking failed:", errors);
            setSubmitting(false);
            setBookingError(errors.join(", "));
        });


        return () => {
            socket.disconnect();
            socket.off("seat:locked");
            socket.off("seat:unlocked");
            socket.off("seat:booked");
            socket.off("seat:confirm:success");
            socket.off("seat:confirm:error");
            socket.off("seats:init-held");
        };
    }, [status, userId, slotId, router]);

    async function handleSubmit() {
        if (!user || user.balance === undefined || user.balance === null) return;
        if (submitting) return;

        const userBalance = Number(user.balance);
        console.log("Attempting to book seats. User balance:", userBalance, "Amount:", amount);
        if (userBalance < amount) {
            setBookingError("Insufficient balance");
            return;
        }

        setSubmitting(true);
        setBookingError(null);
        socket.emit("seat:confirm", { slotId, selectedSeats, amount });
    }

    function select(row: number, col: number) {
        const currentSeat = seatLayout?.[row]?.[col];
        if (!currentSeat || currentSeat.status === "booked" || currentSeat.status === "held" || currentSeat.type === 'disabled') return;

        const { code, status, type } = currentSeat;

        const isSelecting = status === "available";
        const isDeselecting = status === "select";

        if (isSelecting) {
            if (selectedSeats.length > 9) {
                alert("You can only select 10 seats at a time");
                return;
            }

            if (type === "vip") {
                setAmount(prev => prev + COSTS[1]!);
                setType(prev => ({ ...prev, vip: prev.vip + 1 }));
            }
            else {
                setAmount(prev => prev + COSTS[0]!);
                setType(prev => ({ ...prev, regular: prev.regular + 1 }));
            }
            setSelectedSeats(prev => [...prev, code]);
            socket.emit("seat:select", { code, slotId });
        }
        else if (isDeselecting) {
            if (type === "vip") {
                setAmount(prev => prev - COSTS[1]!);
                setType(prev => ({ ...prev, vip: prev.vip - 1 }));
            }
            else {
                setAmount(prev => prev - COSTS[0]!);
                setType(prev => ({ ...prev, regular: prev.regular - 1 }));
            }
            setSelectedSeats(prev => prev.filter(c => c !== code));
            socket.emit("seat:unselect", { code, slotId });
        }

        setLayout(prev =>
            prev?.map((r, i) =>
                r.map((s, j) =>
                    i === row && j === col
                        ? { ...s, status: isSelecting ? "select" : "available" }
                        : s
                )
            )
        );
    }

    const getSeatColor = (seat: any) => {
        if (seat.type === "disabled") return;

        if (seat.status === 'booked') return ('bg-gray-300')
        if (seat.status === 'held') return ('bg-gray-300')
        if (seat.status === 'select') return ('bg-blue-500 text-white')
        // const key = `${row}-${col}`;
        // if(lockedSeats.includes(key)) return ("bg-gray-300")
        // if (selected.some(seat => seat.row === row && seat.col === col)) return "bg-blue-500 text-white";

        switch (seat.type) {
            case "vip": return "border-2 border-yellow-500";
            case "disabled": return "";
            case "regular": return "border border-gray-500";
            default: return "bg-white";
        }
    };

    const cols = seatLayout.length > 0 ? seatLayout[0].length : 0;

    if (cols === 0) {
        return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    }

    return (
        <div className="grid px-4 sm:px-8 lg:px-20 xl:px-44 gap-x-10 text-[#151515] transition-all duration-1100" style={{ gridTemplateColumns: "minmax(0px,300px) auto minmax(100px,400px)" }}>
            <div className="flex flex-col justify-center items-center col-start-2">
                <div className="text-3xl my-10 tracking-wider font-bold">Select Your Seats</div>
                <div className="flex items-center -ml-9 mt-5">
                    <div className="w-8"></div>
                    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, 2rem)` }}>
                        {Array.from({ length: cols! }).map((_, i) => (
                            <div key={i} className="select-none flex items-center justify-center font-bold w-7 h-7 text-gray-600 cursor-pointer">{i + 1}</div>
                        ))}
                    </div>
                </div>
                <div>
                    {seatLayout.map((row, rowIdx) => (
                        <div key={rowIdx} className="flex items-center gap-4">
                            {/* Row label */}
                            <div className="w-8 text-right pr-1 select-none cursor-pointer font-semibold text-gray-600">{String.fromCharCode(65 + rowIdx)}</div>

                            <div className="grid gap-1 my-1" style={{ gridTemplateColumns: `repeat(${cols}, 2rem)` }}>
                                {row.map((seat, colIdx) => {
                                    return (
                                        <div
                                            key={`${rowIdx}-${colIdx}`}
                                            className={`w-7 h-7 rounded-xs select-none ${seat.type !== 'disabled' && 'cursor-pointer'} ${getSeatColor(seat)} flex items-center justify-center text-gray-700 text-[11px] font-medium`}
                                            onClick={() => select(rowIdx, colIdx)}
                                        // title={`Row ${rowIdx + 1}, Col ${colIdx + 1}`}
                                        >
                                            {seat.type !== 'disabled' && colIdx + 1}
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="w-8 text-left select-none cursor-pointer font-semibold text-gray-600">{String.fromCharCode(65 + rowIdx)}</div>
                        </div>
                    ))}
                </div>
                <div className="flex items-center mt-6 gap-4">
                    <div className="w-6 h-6 rounded-xs select-none border border-gray-500 "></div>
                    <div className="text-sm font-medium text-gray-500">Available</div>
                    <div className="w-6 h-6 rounded-xs select-none bg-blue-500 "></div>
                    <div className="text-sm font-medium text-gray-500">Selected</div>
                    <div className="w-6 h-6 rounded-xs select-none bg-gray-300 "></div>
                    <div className="text-sm font-medium text-gray-500">Occupied</div>
                </div>
                <>
                    <svg
                        viewBox="0 0 800 100"
                        className="w-[800px] mt-15 h-[100px] scale-y-[-1] relative"
                        fill="none"
                        stroke="black"
                        strokeWidth="10"
                    >
                        <path d="M10,90 Q400,0 790,90" />
                    </svg>
                    <div className="relative font-bold bottom-22">SCREEN</div>
                </>
                {/*{selectedSeats.length > 0 &&*/}
                {/*    <button onClick={handleSubmit} className=" px-4 py-2 cursor-pointer rounded-full bg-[#1568e3] text-white hover:bg-[#0d4eaf]">*/}
                {/*        Proceed to Payment*/}
                {/*    </button>*/}
                {/*}*/}
            </div>
            <div className="flex flex-col mt-10 ml-auto col-start-3 max-w-[500px] justify-end items-end">
                <div className="flex w-full p-4 m-3 border border-gray-700 rounded-3xl items-center flex-col">
                    <img src={data.movie.image} alt="banner" className="w-150 self-start h-auto border-2 rounded-3xl border-gray-300" />
                    <div className="h-[1.5px] m-3 bg-gray-300 rounded-full relative w-full"></div>
                    <div className={"self-start text-2xl font-medium"}>{data.movie.title.toUpperCase()}</div>
                    <div className="flex self-start flex-col mt-1 space-x-2">
                        <div className="">{data.movie.ageRating}</div>
                        <div className="flex items-center space-x-3">
                            <div className="font-medium">{data.show.language}</div>
                            <Dot className="" />
                            <div className="font-medium">{formatDate(data.show.date)}</div>
                            <Dot className="" />
                            <div className="font-medium">{data.show.time}</div>

                        </div>

                        <div className="text-nowrap">
                            {data.movie.duration > 60 && `${Math.floor(data.movie.duration / 60)} hours`}
                            {data.movie.duration % 60 > 0 && ` ${data.movie.duration % 60} minutes`}
                        </div>

                        {/*<div className="text-nowrap">{movie.genres.join(", ")}</div>*/}
                        {data.theatre.location}
                    </div>
                </div>
                <div className="w-full py-3 px-4 m-3 border border-gray-700 rounded-xl items-center flex-col">
                    <div className="text-xl font-medium">Payment Details</div>
                    <div>
                        <div className="mt-4">Seat Info</div>
                        <div className="flex space-x-3">
                            {selectedSeats.length === 0 &&
                                <div className="h-8"></div>}
                            {selectedSeats.map((code, index) => (
                                <div key={index} className=" font-medium p-1 text-white rounded-xl bg-yellow-500">{code}</div>
                            ))}
                        </div>
                        <div className="mt-3">Ticket Info</div>
                        <div className="flex px-2 justify-between font-bold">
                            <div>{type["regular"]} X {COSTS[0]} </div>
                            <div>&#8377; {type["regular"] * COSTS[0]!}</div>
                        </div>
                        <div className="flex px-2 justify-between font-bold">
                            <div>{type["vip"]} X {COSTS[1]} </div>
                            <div>&#8377; {type["vip"] * COSTS[1]!}</div>
                        </div>

                        <div className="mt-3">Payment Total</div>
                        <div className="flex px-2 justify-between font-bold">
                            <div>Sub Total</div>
                            <div>&#8377; {amount}</div>
                        </div>
                    </div>

                    {bookingError && (
                        <div className="mt-3 w-full text-center text-sm text-red-600 font-medium">
                            {bookingError}
                        </div>
                    )}

                    <div className="mt-5 flex justify-center rounded-xl">
                        <button
                            onClick={handleSubmit}
                            className="px-4 py-2 cursor-pointer rounded-full bg-[#1568e3] text-white hover:bg-[#0d4eaf] disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={selectedSeats.length === 0 || submitting}
                        >
                            {submitting ? "Processing..." : "Proceed to Payment"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}