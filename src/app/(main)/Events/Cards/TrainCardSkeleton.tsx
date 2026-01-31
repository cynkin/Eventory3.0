"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function TrainCardSkeleton() {
    return (
        <div className="border rounded-2xl w-[320px] p-4">
            {/* Title */}
            <Skeleton className="h-6 w-3/4 mb-1" />

            {/* Train ID */}
            <div className="flex items-center gap-1 mb-3">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-16" />
            </div>

            {/* Stations */}
            <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-3 w-4" />
                <Skeleton className="h-5 w-24" />
            </div>
        </div>
    );
}
