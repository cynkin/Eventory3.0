"use client";

import * as React from "react";
import { CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { BaseCarousel } from "@/components/ui/BaseCarousel";
import { TrainCard } from "../Cards/TrainCard";
import { TrainCardDTO } from "@/lib/types/main";
import { getTrains } from "@/lib/main/getData";

interface Props {
    title: string;
    initialItems: TrainCardDTO[];
    initialCursor: string | null;
}

export function TrainCarousel({
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

        const res = await getTrains({ take: 10, cursor });
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
            {items.map(train => (
                <CarouselItem key={train.id} className="pl-6 basis-auto">
                    <TrainCard {...train} />
                </CarouselItem>
            ))}

            {loading && (
                <CarouselItem className="pl-6 basis-auto">
                    <div className="w-[340px] h-[260px] flex items-center justify-center">
                        Loading…
                    </div>
                </CarouselItem>
            )}
        </BaseCarousel>
    );
}
