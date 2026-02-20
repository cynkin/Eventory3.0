'use client'
import {useRouter, useSearchParams} from "next/navigation";
import {useMemo} from "react";
import {Dot} from "lucide-react";
import Link from "next/link";

type Slot = {
    time: string,
    language: string,
}

type Venue = {
    cost?: number,
    premiumCost?: number,
    slots: Slot[],
    location: string,
    seatLayout?: any,
    vendorId?: string
}

type Event = {
    id: string;
    title: string;
    image: string;
    ageRating: string;
    genres: string[];
    duration: number;
    description: string;
    commission?: number;
};

type EventBookingProps = {
    event: Event;
    venues: Venue[];
    eventType: 'movie' | 'concert';
    titleFont: string;
    onSlotSelect?: (slot: Slot, venue: Venue) => void;
}

export default function EventBooking({event, venues, eventType, titleFont, onSlotSelect}: EventBookingProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    let dateParam = searchParams.get('date');
    const today = new Date();

    if(!dateParam){
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        dateParam = `${year}-${month}-${day}`;
    }

    function seatSelect(slot: Slot, venue: Venue) {
        if(onSlotSelect) {
            onSlotSelect(slot, venue);
        } else {
            router.push(`/booking/seats?id=${event.id}`);
        }
    }

    const days = useMemo(() => {
        const list = [];
        for(let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(today.getDate() + i);

            const dayName = date
                .toLocaleDateString("en-US", { weekday: "short"})
                .toUpperCase();

            const dayNum = date.getDate();

            const monthName = date
                .toLocaleDateString("en-US", { month: "short"})
                .toUpperCase();

            list.push({
                name: dayName,
                num: dayNum,
                month: monthName,
                fullDate: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
                isToday: i === 0,
            });
        }
        return list;
    }, []);

    return(
        <div className="xl:px-44 pl-7 pr-4 py-10">
            <div className="flex items-center space-x-40 xl:space-x-50">
                <img src={event.image} alt="banner" className="border-2 w-160 border-black p-5"/>
                <div className="flex justify-center items-center flex-col">
                    <div className={`${titleFont} self-start text-8xl`}>{event.title.toUpperCase()}</div>
                    <div className="flex items-center self-start flex-row mt-4 space-x-2">
                        <div className="">{event.ageRating}</div><Dot className="w-9 h-auto"/>

                        <div className="text-nowrap">
                            {event.duration > 60 && `${Math.floor(event.duration/60)} hours`}
                            {event.duration%60 > 0 && ` ${event.duration%60} minutes`}
                        </div><Dot className="w-9 h-auto"/>

                        <div className="text-nowrap">{event.genres.join(", ")}</div>
                    </div>
                    <div className="mt-5 text-xl self-start">{event.description}</div>
                </div>
            </div>
            <div className="flex justify-between items-center mt-20">
                <div className="bg-[#151515] p-0.5 rounded-3xl w-fit text-white">
                    <div className="flex flex-row items-center">
                        {days.map((day, index) => (
                            <div key={index} className="select-none m-2">
                                <Link draggable={false} href={`/booking?q=${eventType}&id=${event.id}&date=${day.fullDate}`} className={`transition-all duration-250 cursor-pointer ${dateParam === day.fullDate && "bg-white text-[#151515]"} px-4 py-1 rounded-2xl flex flex-col justify-between items-center`}>
                                    <div className="text-sm">{day.name}</div>
                                    <div className="text-lg font-bold">{day.num}</div>
                                    <div className="text-sm">{day.month}</div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mt-10 flex flex-col space-y-5">
                <>
                    {venues.length === 0 ? <div className="text-center">No {eventType === 'movie' ? 'theatres' : 'venues'} available</div>
                        :
                        <>
                            {venues.map((venue: Venue, index: number) => (
                                <div key={index} className="bg-blue-100 py-3 px-6 font-medium text-lg flex rounded-lg items-center space-x-60 xl:space-x-120 ">
                                    <div className="text-2xl font-extrabold">{venue.location.toUpperCase()}</div>
                                    <div className="flex text-nowrap gap-6">
                                        {venue.slots.map((slot: Slot, idx: number) => (
                                            <button onClick={() => seatSelect(slot, venue)} key={idx} className="relative cursor-pointer border-2 border-blue-700 text-center rounded-xl px-6 pt-5 pb-2">
                                                <div className="absolute shadow -top-2 left-1/2 -translate-x-1/2 px-2 rounded-lg bg-white font-extrabold text-xs tracking-wide">
                                                    {slot.language}
                                                </div>
                                                <div className="self-center">{slot.time}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </>
                    }
                </>
            </div>
        </div>
    )
}
