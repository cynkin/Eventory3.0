import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { mapMovieToCard, mapConcertToCard, mapTrainToCard } from "@/lib/main/mappers";
import type { SearchResults, SearchResult } from "@/lib/types/search";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const take = parseInt(searchParams.get("take") || "5", 10);

    if (!query || query.length < 2) {
        return NextResponse.json({
            items: [],
            movies: [],
            concerts: [],
            trains: [],
            totalCount: 0
        } satisfies SearchResults);
    }

    try {
        // Search across all entities in parallel
        const [movies, concerts, trains] = await Promise.all([
            prisma.movies.findMany({
                where: {
                    OR: [
                        { title: { contains: query, mode: "insensitive" } },
                        { description: { contains: query, mode: "insensitive" } },
                    ],
                },
                take,
                orderBy: { createdAt: "desc" },
            }),
            prisma.concerts.findMany({
                where: {
                    OR: [
                        { title: { contains: query, mode: "insensitive" } },
                        { description: { contains: query, mode: "insensitive" } },
                    ],
                },
                take,
                orderBy: { createdAt: "desc" },
            }),
            prisma.trains.findMany({
                where: {
                    OR: [
                        { title: { contains: query, mode: "insensitive" } },
                    ],
                },
                take,
                orderBy: { createdAt: "desc" },
            }),
        ]);

        // Map to DTOs
        const movieDTOs = movies.map(mapMovieToCard);
        const concertDTOs = concerts.map(mapConcertToCard);
        const trainDTOs = trains.map(mapTrainToCard);

        // Create combined items array with type labels
        const items: SearchResult[] = [
            ...movieDTOs.map((item) => ({ type: 'movie' as const, item })),
            ...concertDTOs.map((item) => ({ type: 'concert' as const, item })),
            ...trainDTOs.map((item) => ({ type: 'train' as const, item })),
        ];

        const response: SearchResults = {
            items,
            movies: movieDTOs,
            concerts: concertDTOs,
            trains: trainDTOs,
            totalCount: items.length,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json(
            { error: "Search failed" },
            { status: 500 }
        );
    }
}
