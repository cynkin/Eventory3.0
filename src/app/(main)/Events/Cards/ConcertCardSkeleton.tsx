"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ConcertCardSkeleton() {
    return (
        <div className="border rounded-2xl mb-1 mr-2 border-b-white w-96 flex flex-col overflow-hidden">
            {/* Image placeholder */}
            <Skeleton className="h-52 w-full rounded-b-none" />

            <div className="p-3 space-y-2">
                {/* Title */}
                <Skeleton className="h-6 w-3/4 mb-2" />

                {/* Age rating */}
                <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-4 w-12" />
                </div>

                {/* Genres */}
                <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                </div>

                {/* Languages */}
                <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-4 w-28" />
                </div>

                {/* Duration */}
                <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                </div>

                {/* Price section */}
                <div className="flex flex-col items-end space-y-1 mt-2">
                    <Skeleton className="h-7 w-20" />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-4 w-36" />
                </div>
            </div>
        </div>
    );
}
