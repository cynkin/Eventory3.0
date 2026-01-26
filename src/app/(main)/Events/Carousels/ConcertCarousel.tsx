"use client";

import * as React from "react";
import { CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { BaseCarousel } from "@/components/ui/BaseCarousel";
import { ConcertCard } from "../Cards/ConcertCard";
import { ConcertCardDTO } from "@/lib/types/main";
import { getConcerts } from "@/lib/main/getData";

interface Props {
    title: string;
    initialItems: ConcertCardDTO[];
    initialCursor: string | null;
}

export function ConcertCarousel({
                                    title,
                                    initialItems,
                                    initialCursor,
                                }: Props) {
    const [items, setItems] = React.useState(initialItems);
    const [cursor, setCursor] = React.useState<string | null>(initialCursor);
    const [loading, setLoading] = React.useState(false);

    const loadMore = async () => {
        if (!cursor || loading) return;
        setLoading(true);

        const res = await getConcerts({ take: 10, cursor });
        setItems(prev => [...prev, ...res.items]);
        setCursor(res.nextCursor);
        setLoading(false);
    };

    const onApiReady = (api?: CarouselApi) => {
        if (!api) return; // ✅ FIX

        api.on("scroll", () => {
            if (api.scrollProgress() > 0.75) {
                loadMore();
            }
        });
    };

    return (
        <BaseCarousel title={title} onApiReady={onApiReady}>
            {items.map(concert => (
                <CarouselItem key={concert.id} className="pl-6 basis-auto">
                    <ConcertCard {...concert} />
                </CarouselItem>
            ))}

            {loading && (
                <CarouselItem className="pl-6 basis-auto">
                    <div className="w-[314px] h-[360px] flex items-center justify-center">
                        Loading…
                    </div>
                </CarouselItem>
            )}
        </BaseCarousel>
    );
}
