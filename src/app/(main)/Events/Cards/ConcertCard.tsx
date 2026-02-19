"use client";

import Link from "next/link";
import { Clock3, Languages, LibraryBig, UserLock } from "lucide-react";
import { ConcertCardDTO } from "@/lib/types/main";

function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const day = date.getDate(); // returns 23 (no leading zero)
    const month = date.toLocaleString('en-US', { month: 'short' }); // "Jul"
    const year = date.getFullYear(); // 2025

    return `${day} ${month}, ${year}`;
}

export function ConcertCard({
    id,
    title,
    image,
    ageRating,
    genres,
    languages,
    duration,
    cost,
    startDate,
    endDate,
}: ConcertCardDTO) {
    return (
        <Link
            href={`/concert-booking?q=concert&id=${id}`}
            className="border rounded-2xl mb-1 mr-2 border-b-white w-96 flex flex-col overflow-hidden hover:shadow-md transition"
        >
            <img
                src={image}
                alt={title}
                className="h-52 w-full object-cover"
            />

            <div className="p-3 space-y-1">
                <div className="font-medium text-lg mb-2">{title}</div>

                <div className="flex text-gray-800">
                    <UserLock className="w-5 h-5 mr-2" />
                    {ageRating}
                </div>

                <div className="flex text-gray-800">
                    <LibraryBig className="w-5 h-5 mr-2" />
                    {genres.join(", ")}
                </div>

                <div className="flex text-gray-800">
                    <Languages className="w-5 h-5 mr-2" />
                    {languages.join(", ")}
                </div>

                <div className="flex text-gray-800">
                    <Clock3 className="w-5 h-5 mr-2" />
                    {Math.floor(duration / 60)}h {duration % 60}m
                </div>

                <div className="flex flex-col space-y-0.5 text-right text-xs text-gray-900">
                    <div className="text-xl tracking-wider mt-2 ">&#8377; {cost}</div>
                    <div className="">per person</div>
                    <div className="">Includes taxes and fees</div>
                    <div
                        className=" mb-3 font-medium">
                        {formatDate(startDate)} {endDate && " to " + formatDate(endDate)}
                    </div>
                </div>
            </div>
        </Link>
    );
}
