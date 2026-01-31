"use client";

import * as React from "react";
import { CarouselItem } from "@/components/ui/carousel";
import { BaseCarousel } from "@/components/ui/BaseCarousel";
import {
    useInfiniteCarousel,
    type UseInfiniteCarouselOptions,
} from "@/components/hooks/useInfiniteCarousel";

export interface InfiniteCarouselProps<T> {
    title: string;
    initialItems: T[];
    initialCursor: string | null;
    fetchMore: UseInfiniteCarouselOptions<T>["fetchMore"];
    renderItem: (item: T) => React.ReactNode;
    renderSkeleton: () => React.ReactNode;
    keyExtractor: (item: T) => string;
    prefetchThreshold?: number;
    pageSize?: number;
    itemClassName?: string;
}

export function InfiniteCarousel<T>({
    title,
    initialItems,
    initialCursor,
    fetchMore,
    renderItem,
    renderSkeleton,
    keyExtractor,
    prefetchThreshold = 0.7,
    pageSize = 10,
    itemClassName = "pl-6 basis-auto",
}: InfiniteCarouselProps<T>) {
    const { items, isLoading, skeletonCount, onApiReady } = useInfiniteCarousel({
        initialItems,
        initialCursor,
        fetchMore,
        prefetchThreshold,
        pageSize,
    });

    return (
        <BaseCarousel title={title} onApiReady={onApiReady}>
            {/* Render actual items */}
            {items.map((item) => (
                <CarouselItem key={keyExtractor(item)} className={itemClassName}>
                    {renderItem(item)}
                </CarouselItem>
            ))}

            {/* Render skeletons while loading */}
            {isLoading &&
                Array.from({ length: skeletonCount }).map((_, index) => (
                    <CarouselItem key={`skeleton-${index}`} className={itemClassName}>
                        {renderSkeleton()}
                    </CarouselItem>
                ))}
        </BaseCarousel>
    );
}
