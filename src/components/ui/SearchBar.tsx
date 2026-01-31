'use client';

import * as React from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSearch } from "@/components/hooks/useSearch";
import { SearchResultsDropdown } from "./SearchResultsDropdown";

export default function SearchBar() {
    const router = useRouter();
    const [isFocused, setIsFocused] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const {
        query,
        setQuery,
        results,
        isLoading,
        clear,
    } = useSearch({
        debounceMs: 300,
        minQueryLength: 2,
        take: 5,
    });

    // Handle form submission - navigate to search page
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
            clear();
            setIsFocused(false);
        }
    };

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    };

    // Handle clear button
    const handleClear = () => {
        clear();
    };

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsFocused(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            setIsFocused(false);
            clear();
        }
    };

    const showDropdown = isFocused && query.length >= 2;

    return (
        <div ref={containerRef} className="w-full relative">
            <form onSubmit={handleSubmit} className="flex items-center">
                <div className="relative w-full">
                    <input
                        type="text"
                        name="q"
                        value={query}
                        onChange={handleChange}
                        onFocus={() => setIsFocused(true)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search for events...."
                        autoComplete="off"
                        className="w-full border ml-12 my-2 py-3 pl-12 pr-10 text tracking-wide border-gray-300 rounded-3xl
                        shadow-xs focus:outline-none focus:ring-2 focus:ring-[#1568e3] hover:shadow-md focus:shadow-xl
                        focus:border-transparent transition-all duration-200"
                    />
                    <Search className="absolute left-15 top-1/2 -translate-y-1/2 text-gray-400" />

                    {/* Clear button */}
                    {query && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    )}

                    {/* Loading indicator */}
                    {isLoading && (
                        <div className="absolute right-10 top-1/2 -translate-y-1/2">
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                </div>
                <button
                    type="submit"
                    className="ml-14 mr-32 bg-[#1568e3] rounded-3xl px-6 py-3 text-white text
                    transition-all duration-200 hover:bg-[#0d4eaf] disabled:opacity-50"
                    disabled={!query.trim()}
                >
                    Search
                </button>
            </form>

            {/* Live search results dropdown */}
            {showDropdown && (
                <SearchResultsDropdown
                    results={results}
                    isLoading={isLoading}
                    query={query}
                    onClose={() => {
                        setIsFocused(false);
                        clear();
                    }}
                />
            )}
        </div>
    );
}