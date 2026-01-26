"use client";

import Link from "next/link";
import { Clock3, LibraryBig, UserLock } from "lucide-react";
import { MovieCardDTO } from "@/lib/types/main";

export function MovieCard({
                              id,
                              title,
                              image,
                              ageRating,
                              genres,
                              duration,
                          }: MovieCardDTO) {
    return (
        <Link
            href={`/booking?movieId=${id}`}
            className="border mb-1 mr-2 rounded-2xl w-80 border-b-white flex flex-col overflow-hidden hover:shadow-md transition"
        >
            <img
                src={image}
                alt={title}
                className="h-[170px] rounded-t-2xl  w-full object-cover"
            />

            <div className="p-3 space-y-1.5">
                <div className="font-medium text-lg">{title}</div>

                <div className="flex items-center text-sm text-gray-800">
                    <UserLock className="w-5 h-5 mr-2" />
                    {ageRating}
                </div>

                <div className="flex items-center text-sm text-gray-800">
                    <LibraryBig className="w-5 h-5 mr-2" />
                    {genres.join(", ")}
                </div>

                <div className="flex items-center text-sm text-gray-800">
                    <Clock3 className="w-5 h-5 mr-2" />
                    {Math.floor(duration / 60)}h {duration % 60}m
                </div>
            </div>
        </Link>
    );
}
