"use client";

import { InfiniteCarousel } from "@/components/ui/Carousels/InfiniteCarousel";
import { ConcertCard } from "../Cards/ConcertCard";
import { ConcertCardSkeleton } from "../Cards/ConcertCardSkeleton";
import { ConcertCardDTO } from "@/lib/types/main";
import { getConcerts } from "@/lib/main/getData";

interface Props {
    title: string;
    initialItems: ConcertCardDTO[];
    initialCursor: string | null;
}

export function ConcertCarousel({ title, initialItems, initialCursor }: Props) {
    return (
        <InfiniteCarousel
            title={title}
            initialItems={initialItems}
            initialCursor={initialCursor}
            fetchMore={(cursor) => getConcerts({ take: 10, cursor })}
            renderItem={(concert) => <ConcertCard {...concert} />}
            renderSkeleton={() => <ConcertCardSkeleton />}
            keyExtractor={(concert) => concert.id}
        />
    );
}
