"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { MovieCardSkeleton } from "@/app/(main)/Events/Cards/MovieCardSkeleton";
import { ConcertCardSkeleton } from "@/app/(main)/Events/Cards/ConcertCardSkeleton";
import { TrainCardSkeleton } from "@/app/(main)/Events/Cards/TrainCardSkeleton";

type CarouselType = "movie" | "concert" | "train";

interface CarouselSkeletonProps {
    type?: CarouselType;
    titleWidth?: string;
    cardCount?: number;
}

function getCardSkeleton(type: CarouselType) {
    switch (type) {
        case "movie":
            return <MovieCardSkeleton />;
        case "concert":
            return <ConcertCardSkeleton />;
        case "train":
            return <TrainCardSkeleton />;
        default:
            return <MovieCardSkeleton />;
    }
}

export function CarouselSkeleton({
    type = "movie",
    titleWidth = "w-64",
    cardCount = 4,
}: CarouselSkeletonProps) {
    return (
        <section className="mx-8 xl:px-44 my-10 relative">
            {/* Title skeleton */}
            <Skeleton className={`h-8 ${titleWidth} mb-4`} />

            {/* Cards container */}
            <div className="relative">
                <div className="overflow-hidden">
                    <div className="flex -ml-6">
                        {Array.from({ length: cardCount }).map((_, index) => (
                            <div key={index} className="pl-6 shrink-0">
                                {getCardSkeleton(type)}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
