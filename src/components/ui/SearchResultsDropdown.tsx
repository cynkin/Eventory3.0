'use client';

import * as React from "react";
import Link from "next/link";
import type { SearchResults } from "@/lib/types/search";
import Spinner from "./Spinner";
import { Search } from "lucide-react";

interface SearchResultsDropdownProps {
    results: SearchResults | null;
    isLoading: boolean;
    query: string;
    onClose: () => void;
}

export function SearchResultsDropdown({
    results,
    isLoading,
    query,
    onClose,
}: SearchResultsDropdownProps) {
    // Don't show if no query
    if (!query || query.length < 2) return null;

    return (
        <div className="absolute top-full left-12 right-0 mt-1 bg-white dark:bg-[#1a1f3d] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Spinner />
                    <span className="ml-2 text-gray-500">Searching...</span>
                </div>
            ) : results && results.totalCount > 0 ? (
                <div className="py-2">
                    {/* Movies Section */}
                    {results.movies.length > 0 && (
                        <div className="mb-2">
                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 dark:bg-gray-800/50">
                                🎬 Movies
                            </div>
                            {results.movies.map((movie) => (
                                <Link
                                    key={movie.id}
                                    href={`/movies/${movie.id}`}
                                    onClick={onClose}
                                    className="flex items-center px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                                >
                                    <div className="w-10 h-14 rounded overflow-hidden bg-gray-200 flex-shrink-0">
                                        {movie.image && (
                                            <img
                                                src={movie.image}
                                                alt={movie.title}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="ml-3 flex-1 min-w-0">
                                        <div className="font-medium text-gray-900 dark:text-white truncate">
                                            {movie.title}
                                        </div>
                                        <div className="text-sm text-gray-500 flex items-center gap-2">
                                            <span>{movie.ageRating}</span>
                                            <span>•</span>
                                            <span>{movie.duration} min</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Concerts Section */}
                    {results.concerts.length > 0 && (
                        <div className="mb-2">
                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 dark:bg-gray-800/50">
                                🎵 Concerts
                            </div>
                            {results.concerts.map((concert) => (
                                <Link
                                    key={concert.id}
                                    href={`/concerts/${concert.id}`}
                                    onClick={onClose}
                                    className="flex items-center px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                                >
                                    <div className="w-10 h-14 rounded overflow-hidden bg-gray-200 flex-shrink-0">
                                        {concert.image && (
                                            <img
                                                src={concert.image}
                                                alt={concert.title}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="ml-3 flex-1 min-w-0">
                                        <div className="font-medium text-gray-900 dark:text-white truncate">
                                            {concert.title}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            ₹{concert.cost}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Trains Section */}
                    {results.trains.length > 0 && (
                        <div>
                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 dark:bg-gray-800/50">
                                🚂 Trains
                            </div>
                            {results.trains.map((train) => (
                                <Link
                                    key={train.id}
                                    href={`/trains/${train.id}`}
                                    onClick={onClose}
                                    className="flex items-center px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                                        <span className="text-sm font-bold text-blue-600 dark:text-blue-300">
                                            {train.trainId}
                                        </span>
                                    </div>
                                    <div className="ml-3 flex-1 min-w-0">
                                        <div className="font-medium text-gray-900 dark:text-white truncate">
                                            {train.title}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {train.stations.length} stations
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="py-8 text-center text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-2" />
                    <div>No results found for "{query}"</div>
                </div>
            )}
        </div>
    );
}
