import { Suspense } from "react";
import Link from "next/link";
import prisma from "@/lib/db";
import { mapMovieToCard, mapConcertToCard, mapTrainToCard } from "@/lib/main/mappers";
import { MovieCardDTO, ConcertCardDTO, TrainCardDTO } from "@/lib/types/main";

interface SearchPageProps {
    searchParams: Promise<{ q?: string }>;
}

async function searchMovies(query: string): Promise<MovieCardDTO[]> {
    const movies = await prisma.movies.findMany({
        where: {
            OR: [
                { title: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
            ],
        },
        take: 20,
        orderBy: { createdAt: "desc" },
    });
    return movies.map(mapMovieToCard);
}

async function searchConcerts(query: string): Promise<ConcertCardDTO[]> {
    const concerts = await prisma.concerts.findMany({
        where: {
            OR: [
                { title: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
            ],
        },
        take: 20,
        orderBy: { createdAt: "desc" },
    });
    return concerts.map(mapConcertToCard);
}

async function searchTrains(query: string): Promise<TrainCardDTO[]> {
    const trains = await prisma.trains.findMany({
        where: {
            title: { contains: query, mode: "insensitive" },
        },
        take: 20,
        orderBy: { createdAt: "desc" },
    });
    return trains.map(mapTrainToCard);
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const { q: query } = await searchParams;

    if (!query) {
        return (
            <div className="px-4 py-8 md:px-8 lg:px-44">
                <h1 className="text-2xl font-bold mb-4">Search</h1>
                <p className="text-gray-500">Enter a search query to find events.</p>
            </div>
        );
    }

    const [movies, concerts, trains] = await Promise.all([
        searchMovies(query),
        searchConcerts(query),
        searchTrains(query),
    ]);

    const totalResults = movies.length + concerts.length + trains.length;

    return (
        <div className="px-4 py-8 md:px-8 lg:px-44">
            <h1 className="text-2xl font-bold mb-2">Search Results</h1>
            <p className="text-gray-500 mb-8">
                Found {totalResults} result{totalResults !== 1 ? 's' : ''} for "{query}"
            </p>

            {totalResults === 0 ? (
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">🔍</div>
                    <h2 className="text-xl font-semibold mb-2">No results found</h2>
                    <p className="text-gray-500">Try searching with different keywords</p>
                </div>
            ) : (
                <div className="space-y-12">
                    {/* Movies Section */}
                    {movies.length > 0 && (
                        <section>
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <span>🎬</span> Movies ({movies.length})
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {movies.map((movie) => (
                                    <Link
                                        key={movie.id}
                                        href={`/movies/${movie.id}`}
                                        className="group block rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-shadow"
                                    >
                                        <div className="aspect-[2/3] overflow-hidden bg-gray-200">
                                            {movie.image && (
                                                <img
                                                    src={movie.image}
                                                    alt={movie.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            )}
                                        </div>
                                        <div className="p-3">
                                            <h3 className="font-medium truncate">{movie.title}</h3>
                                            <div className="text-sm text-gray-500 flex items-center gap-1">
                                                <span>{movie.ageRating}</span>
                                                <span>•</span>
                                                <span>{movie.duration} min</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Concerts Section */}
                    {concerts.length > 0 && (
                        <section>
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <span>🎵</span> Concerts ({concerts.length})
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {concerts.map((concert) => (
                                    <Link
                                        key={concert.id}
                                        href={`/concerts/${concert.id}`}
                                        className="group block rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-shadow"
                                    >
                                        <div className="aspect-[2/3] overflow-hidden bg-gray-200">
                                            {concert.image && (
                                                <img
                                                    src={concert.image}
                                                    alt={concert.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            )}
                                        </div>
                                        <div className="p-3">
                                            <h3 className="font-medium truncate">{concert.title}</h3>
                                            <div className="text-sm text-gray-500">
                                                ₹{concert.cost}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Trains Section */}
                    {trains.length > 0 && (
                        <section>
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <span>🚂</span> Trains ({trains.length})
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {trains.map((train) => (
                                    <Link
                                        key={train.id}
                                        href={`/trains/${train.id}`}
                                        className="group block rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-shadow p-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                                <span className="text-lg font-bold text-blue-600 dark:text-blue-300">
                                                    {train.trainId}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="font-medium">{train.title}</h3>
                                                <div className="text-sm text-gray-500">
                                                    {train.stations.length} stations
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}
