"use client";

import { InfiniteCarousel } from "@/components/ui/Carousels/InfiniteCarousel";
import { TrainCard } from "../Cards/TrainCard";
import { TrainCardSkeleton } from "../Cards/TrainCardSkeleton";
import { TrainCardDTO } from "@/lib/types/main";
import { getTrains } from "@/lib/main/getData";

interface Props {
    title: string;
    initialItems: TrainCardDTO[];
    initialCursor: string | null;
}

export function TrainCarousel({ title, initialItems, initialCursor }: Props) {
    return (
        <InfiniteCarousel
            title={title}
            initialItems={initialItems}
            initialCursor={initialCursor}
            fetchMore={(cursor) => getTrains({ take: 10, cursor })}
            renderItem={(train) => <TrainCard {...train} />}
            renderSkeleton={() => <TrainCardSkeleton />}
            keyExtractor={(train) => train.id}
        />
    );
}
