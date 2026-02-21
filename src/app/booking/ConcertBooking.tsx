'use client'
import {Metamorphous} from "next/font/google";
import EventBooking from "@/app/booking/EventBooking";

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
    id: string,
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
    return (
        <EventBooking
            event={concert}
            venues={venues}
            eventType="concert"
            titleFont={font.className}
        />
    )
}