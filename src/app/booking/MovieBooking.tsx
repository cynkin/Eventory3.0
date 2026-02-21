'use client'
import {New_Rocker} from "next/font/google";
import EventBooking from "@/app/booking/EventBooking";

const font = New_Rocker({
    subsets:['latin'],
    weight:['400']
});

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

type Slot = {
    id: string,
    time: string,
    language: string,
}

type Theatre = {
    cost?: number,
    premiumCost?: number,
    slots: Slot[],
    location: string,
    seatLayout?: any,
    vendorId?: string
}

type MovieProps = {
    movie: Movie;
    theatres: Theatre[];
}

export default function MovieBooking({movie, theatres}: MovieProps) {
    return (
        <EventBooking
            event={movie}
            venues={theatres}
            eventType="movie"
            titleFont={font.className}
        />
    )
}