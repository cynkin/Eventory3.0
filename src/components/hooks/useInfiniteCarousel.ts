"use client";

import * as React from "react";
import type { CarouselApi } from "@/components/ui/Carousels/carousel";
import type { PaginatedResponse } from "@/lib/types/pagination";

export interface UseInfiniteCarouselOptions<T> {
    initialItems: T[];
    initialCursor: string | null;
    fetchMore: (cursor: string) => Promise<PaginatedResponse<T>>;
    prefetchThreshold?: number;
    pageSize?: number;
}

export interface UseInfiniteCarouselReturn<T> {
    items: T[];
    isLoading: boolean;
    hasMore: boolean;
    onApiReady: (api: CarouselApi) => void;
    skeletonCount: number;
}

export function useInfiniteCarousel<T>({
    initialItems,
    initialCursor,
    fetchMore,
    prefetchThreshold = 0.7,
    pageSize = 10,
}: UseInfiniteCarouselOptions<T>): UseInfiniteCarouselReturn<T> {
    const [items, setItems] = React.useState<T[]>(initialItems);
    const [cursor, setCursor] = React.useState<string | null>(initialCursor);
    const [isLoading, setIsLoading] = React.useState(false);

    // Ref to prevent duplicate in-flight requests
    const isFetchingRef = React.useRef(false);
    // Ref to store the API instance
    const apiRef = React.useRef<CarouselApi | null>(null);
    // Ref to store the latest cursor value for closure access
    const cursorRef = React.useRef(cursor);

    // Keep cursorRef in sync with cursor state
    React.useEffect(() => {
        cursorRef.current = cursor;
    }, [cursor]);

    const loadMore = React.useCallback(async () => {
        // Guard: no cursor means no more data
        if (!cursorRef.current) return;
        // Guard: already fetching - prevent duplicates
        if (isFetchingRef.current) return;

        isFetchingRef.current = true;
        setIsLoading(true);

        try {
            const response = await fetchMore(cursorRef.current);

            setItems((prev) => [...prev, ...response.items]);
            setCursor(response.nextCursor);
        } catch (error) {
            console.error("Failed to fetch more items:", error);
        } finally {
            isFetchingRef.current = false;
            setIsLoading(false);
        }
    }, [fetchMore]);

    const onApiReady = React.useCallback(
        (api: CarouselApi) => {
            if (!api) return;

            apiRef.current = api;

            const handleScroll = () => {
                const progress = api.scrollProgress();

                // Trigger prefetch when user scrolls past threshold
                if (progress > prefetchThreshold) {
                    loadMore();
                }
            };

            // Listen for scroll events (works with touch, mouse, wheel)
            api.on("scroll", handleScroll);

            // Also check on select (when slide changes)
            api.on("select", handleScroll);

            // Cleanup function
            return () => {
                api.off("scroll", handleScroll);
                api.off("select", handleScroll);
            };
        },
        [loadMore, prefetchThreshold]
    );

    // Determine skeleton count based on loading state and remaining data
    const skeletonCount = React.useMemo(() => {
        if (!isLoading) return 0;
        // Show appropriate number of skeletons while loading
        return Math.min(pageSize, 3);
    }, [isLoading, pageSize]);

    const hasMore = cursor !== null;

    return {
        items,
        isLoading,
        hasMore,
        onApiReady,
        skeletonCount,
    };
}
