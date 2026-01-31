"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function MovieCardSkeleton() {
    return (
        <div className="border mb-1 mr-2 rounded-2xl w-96 border-b-white flex flex-col overflow-hidden">
            {/* Image placeholder */}
            <Skeleton className="h-52 w-full rounded-t-2xl rounded-b-none" />

            <div className="p-3 space-y-2">
                {/* Title */}
                <Skeleton className="h-6 w-3/4" />

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

                {/* Duration */}
                <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                </div>
            </div>
        </div>
    );
}
