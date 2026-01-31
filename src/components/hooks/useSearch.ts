"use client";

import * as React from "react";
import { useDebounce } from "./useDebounce";
import type { SearchResults } from "@/lib/types/search";

export interface UseSearchOptions {
    /** Debounce delay in milliseconds (default: 300ms) */
    debounceMs?: number;
    /** Minimum query length to trigger search (default: 2) */
    minQueryLength?: number;
    /** Number of results per category (default: 5) */
    take?: number;
}

export interface UseSearchReturn {
    /** Current search query */
    query: string;
    /** Update the search query */
    setQuery: (query: string) => void;
    /** Debounced query value */
    debouncedQuery: string;
    /** Search results */
    results: SearchResults | null;
    /** Loading state */
    isLoading: boolean;
    /** Error state */
    error: string | null;
    /** Clear search */
    clear: () => void;
}

const EMPTY_RESULTS: SearchResults = {
    items: [],
    movies: [],
    concerts: [],
    trains: [],
    totalCount: 0,
};

export function useSearch(options: UseSearchOptions = {}): UseSearchReturn {
    const {
        debounceMs = 300,
        minQueryLength = 2,
        take = 5,
    } = options;

    const [query, setQuery] = React.useState("");
    const [results, setResults] = React.useState<SearchResults | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Abort controller for request cancellation
    const abortControllerRef = React.useRef<AbortController | null>(null);

    // Debounce the query to avoid excessive API calls
    const debouncedQuery = useDebounce(query, debounceMs);

    // Clear function
    const clear = React.useCallback(() => {
        setQuery("");
        setResults(null);
        setError(null);
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    }, []);

    // Perform search when debounced query changes
    React.useEffect(() => {
        // Skip if query is too short
        if (debouncedQuery.length < minQueryLength) {
            setResults(null);
            setIsLoading(false);
            return;
        }

        // Cancel any in-flight request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new abort controller
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        const performSearch = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const params = new URLSearchParams({
                    q: debouncedQuery,
                    take: take.toString(),
                });

                const response = await fetch(`/api/search?${params}`, { signal });

                if (!response.ok) {
                    throw new Error("Search failed");
                }

                const data: SearchResults = await response.json();
                setResults(data);
            } catch (err) {
                // Ignore abort errors
                if (err instanceof Error && err.name === "AbortError") {
                    return;
                }
                setError(err instanceof Error ? err.message : "Search failed");
                setResults(EMPTY_RESULTS);
            } finally {
                setIsLoading(false);
            }
        };

        performSearch();

        // Cleanup: cancel request on unmount or query change
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [debouncedQuery, minQueryLength, take]);

    return {
        query,
        setQuery,
        debouncedQuery,
        results,
        isLoading,
        error,
        clear,
    };
}
