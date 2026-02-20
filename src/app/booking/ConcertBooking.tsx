'use client'
import {useRouter} from "next/navigation";
import {Metamorphous} from "next/font/google";
import EventBooking from "@/components/ui/EventBooking";

const font = Metamorphous({
    subsets:['latin'],
    weight:['400']
});

type Concert = {
    id: string;
    title: string;
    image: string;
    ageRating: string;
    genres: string[];
    duration: number;
    description: string;
};

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

type ConcertProps = {
    concert: Concert;
    venues: Venue[];
}

export default function ConcertBooking({concert, venues}: ConcertProps) {
    const router = useRouter();

    function handleSlotSelect(slot: Slot, venue: Venue) {
        router.push("/booking/seats?id=" + concert.id);
    }

    return (
        <EventBooking
            event={concert}
            venues={venues}
            eventType="concert"
            titleFont={font.className}
            onSlotSelect={handleSlotSelect}
        />
    )
}