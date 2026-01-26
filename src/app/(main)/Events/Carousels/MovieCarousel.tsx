"use client";

import * as React from "react";
import { CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { BaseCarousel } from "@/components/ui/BaseCarousel";
import { MovieCard } from "../Cards/MovieCard";
import { MovieCardDTO } from "@/lib/types/main";
import { getMovies } from "@/lib/main/getData";

interface MovieCarouselProps {
    title: string;
    initialItems: MovieCardDTO[];
    initialCursor: string | null;
}

export function MovieCarousel({
                                  title,
                                  initialItems,
                                  initialCursor,
                              }: MovieCarouselProps) {
    const [items, setItems] = React.useState(initialItems);
    const [cursor, setCursor] = React.useState<string | null>(initialCursor);
    const [loading, setLoading] = React.useState(false);

    const apiRef = React.useRef<CarouselApi | null>(null);

    const loadMore = async () => {
        if (!cursor || loading) return;

        setLoading(true);
        const res = await getMovies({ take: 10, cursor });

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
            {items.map(movie => (
                <CarouselItem
                    key={movie.id}
                    className="pl-6 basis-auto"
                >
                    <MovieCard {...movie} />
                </CarouselItem>
            ))}

            {loading && (
                <CarouselItem className="pl-6 basis-auto">
                    <div className="w-[311px] h-[300px] flex items-center justify-center">
                        Loading…
                    </div>
                </CarouselItem>
            )}
        </BaseCarousel>
    );
}
