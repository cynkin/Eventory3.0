'use client'
import {useRouter} from "next/navigation";
import {Dot, Plus, Minus} from "lucide-react";
import React, {useState} from "react";
import {useSession} from "next-auth/react";

function formatDate(dateStr: string){
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();

    return `${day} ${month}, ${year}`;
}

type Show = {
    seats: number;
    id: string;
    date: string;
    time: string;
    location: string;
}

type Concert = {
    id: string;
    title: string;
    image: string;
    description: string;
    ageRating: string;
    languages: string[];
    genres: string[];
    duration: number;
    cost: number;
}

type Data = {
    show : Show;
    concert: Concert;
}

export default function PaymentPage(data: Data) {
    const { data: session, status, update } = useSession();
    const router = useRouter();

    const [noOfSeats, setNoOfSeats] = useState<number>(0);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [bookingError, setBookingError] = useState<string | null>(null);

    const amount = noOfSeats * data.concert.cost;

    const handleSubmit = async () => {
        if (!noOfSeats) return;
        if (!session || !session.user || !session.user.id) return;
        if (submitting) return;

        if (noOfSeats > data.show.seats) {
            setBookingError("Exceeds available seats");
            return;
        }

        const userBalance = Number(session.user.balance);
        if (userBalance < amount) {
            setBookingError("Insufficient balance");
            return;
        }

        setSubmitting(true);
        setBookingError(null);

        try {
            const res = await fetch("/api/booking/concert", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: session.user.id,
                    concertShowId: data.show.id,
                    noOfSeats,
                }),
            });

            const result = await res.json();

            if (!res.ok || !result.success) {
                setBookingError(result.error || "Booking failed. Please try again.");
                setSubmitting(false);
                return;
            }

            // Update session with the new balance (no DB query — passed directly to JWT)
            await update({ balance: result.newBalance });

            router.push("/account/history");
        } catch (e) {
            console.error("Concert booking error:", e);
            setBookingError("Something went wrong. Please try again.");
            setSubmitting(false);
        }
    };

    return(
        <div className="xl:px-44 px-4 mt-10">
                <div className="flex flex-row">
                    <div className="flex w-fit p-4 m-3 border border-gray-700 rounded-3xl items-center flex-col">
                        <img src={data.concert.image} alt="banner" className="w-fit  h-auto border-2 rounded-xl border-gray-300 p-2"/>
                        <div className="h-[1.5px] m-3 bg-gray-300 rounded-full relative w-full"></div>
                        <div className={"self-start text-2xl font-medium"}>{data.concert.title.toUpperCase()}</div>
                        <div className="flex self-start flex-col mt-1 space-x-2">
                            <div className="">{data.concert.ageRating}</div>
                            <div className="flex items-center space-x-3">
                                <div className="font-medium">{formatDate(data.show.date)}</div>
                                <Dot className=""/>
                                <div className="font-medium">{data.show.time}</div>
                            </div>
                            <div className="">{data.concert.languages.map((language:string, index:number)=>(
                                <span key={index}>{index !== 0 && " ,  "}{language}</span>
                            ))}
                            </div>
                            <div className="text-nowrap">
                                {data.concert.duration > 60 && `${Math.floor(data.concert.duration/60)} hours`}
                                {data.concert.duration%60 > 0 && ` ${data.concert.duration%60} minutes`}
                            </div>
                            <div className="font-medium">{data.show.location}</div>
                        </div>
                    </div>
                    <div className="w-fit h-fit py-3 px-4 m-3 border border-gray-700 rounded-xl items-center flex-col">
                        <div className="text-xl font-medium">Seat Options</div>
                        <div className="border-2 p-2 text-blue-900 flex justify-between text-lg mt-3 rounded-xl border-red-400">
                            <button className="cursor-pointer" onClick={() => setNoOfSeats(prev  =>{
                                if(prev > 0) return (prev - 1);
                                return prev;
                            } )}><Minus/></button>
                            <div>{noOfSeats}</div>
                            <button className="cursor-pointer" onClick={() => setNoOfSeats(prev => prev + 1)}><Plus/></button>
                        </div>
                    </div>
                    <div className="w-fit h-fit py-3 px-4 m-3 border border-gray-700 rounded-xl items-center flex-col">
                        <div className="text-xl font-medium">Payment Details</div>
                        <div>
                            <div className="mt-4">Seat Info</div>
                            <div className="flex px-2 justify-between font-bold">
                                <div>No. of Seats:</div>
                                <div>{noOfSeats}</div>
                            </div>

                            <div className="mt-3">Payment Total</div>
                            <div className="flex px-2 justify-between font-bold">
                                <div>Total</div>
                                <div>&#8377; {amount}</div>
                            </div>
                        </div>

                        {bookingError && (
                            <div className="mt-3 w-full text-center text-sm text-red-600 font-medium">
                                {bookingError}
                            </div>
                        )}

                        <div className="mt-5 flex justify-center w-full rounded-xl">
                            <button
                                disabled={noOfSeats === 0 || submitting}
                                onClick={handleSubmit}
                                className=" px-4 py-2 w-full cursor-pointer rounded-full bg-[#1568e3] text-white hover:bg-[#0d4eaf] disabled:opacity-50 disabled:cursor-not-allowed">
                                {submitting ? "Processing..." : "Proceed to Payment"}
                            </button>
                        </div>
                    </div>
                </div>
        </div>
    )
}