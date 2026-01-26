import  prisma from '@/lib/db';
import {ConcertCardDTO, MovieCardDTO, TrainCardDTO} from "@/lib/types/main";
import {CursorPaginationParams, PaginatedResponse} from "@/lib/types/pagination";
import {mapConcertToCard, mapMovieToCard, mapTrainToCard} from "@/lib/main/mappers";


export async function getMovies(
    params: CursorPaginationParams
): Promise<PaginatedResponse<MovieCardDTO>> {
    const movies = await prisma.movies.findMany({
        take: params.take + 1,
        ...(params.cursor && {
            cursor: { id: params.cursor },
            skip: 1,
        }),
        orderBy: { createdAt: "desc" },
    });

    const hasNext = movies.length > params.take;
    const items = movies.slice(0, params.take);

    return {
        items: items.map(mapMovieToCard),
        nextCursor: hasNext ? items[items.length - 1].id : null,
    };
}

export async function getConcerts(
    params: CursorPaginationParams
): Promise<PaginatedResponse<ConcertCardDTO>> {
    const concerts = await prisma.concerts.findMany({
        take: params.take + 1,
        ...(params.cursor && {
            cursor: { id: params.cursor },
            skip: 1,
        }),
        orderBy: { createdAt: "desc" },
    });

    const hasNext = concerts.length > params.take;
    const items = concerts.slice(0, params.take);

    return {
        items: items.map(mapConcertToCard),
        nextCursor: hasNext ? items[items.length - 1].id : null,
    };
}

export async function getTrains(
    params: CursorPaginationParams
): Promise<PaginatedResponse<TrainCardDTO>> {
    const trains = await prisma.trains.findMany({
        take: params.take + 1,
        ...(params.cursor && {
            cursor: { id: params.cursor },
            skip: 1,
        }),
        orderBy: { createdAt: "desc" },
    });

    const hasNext = trains.length > params.take;
    const items = trains.slice(0, params.take);

    return {
        items: items.map(mapTrainToCard),
        nextCursor: hasNext ? items[items.length - 1].id : null,
    };
}

