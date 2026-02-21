import  prisma from '@/lib/db';
import {ConcertCardDTO, MovieCardDTO, TrainCardDTO} from "@/lib/types/main";
import {CursorPaginationParams, PaginatedResponse} from "@/lib/types/pagination";
import {mapConcertToCard, mapMovieToCard, mapTrainToCard} from "@/lib/main/mappers";
import SeatSelection from "@/app/booking/seats/Seats";

const isUUID = (id: string) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id);
};

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

export async function getMovieDetails(id: string, date?: string) {
    if (!isUUID(id)) return null;
    try {
        const movie = await prisma.movies.findUnique({
            where: {id},
            include: {
                theatres: {
                    include: {
                        shows: {
                            where: date ? {date} : undefined, // ✅ filter by date
                        },
                    },
                },
            },
        });

        if (!movie) return null;

        const theatres = movie.theatres
            // optional: remove theatres with no shows for that date
            .filter((t) => t.shows.length > 0)
            .map((t) => ({
                location: t.location,
                vendorId: t.vendor_id,
                seatLayout: t.seatLayout,
                cost: 0,
                premiumCost: 0,
                slots: t.shows.map((s) => ({
                    id: s.id,
                    time: s.time,
                    language: s.language,
                })),
            }));

        return {movie, theatres};
    }
    catch (err) {
        console.error(err);
        return null;
    }
}

export async function getConcertDetails(id: string, date?: string) {
    if (!isUUID(id)) return null;
    try {
        const concert = await prisma.concerts.findUnique({
            where: {id},
            include: {
                concert_shows: {
                    where: date ? {date} : undefined,
                },
            },
        });

        if (!concert) return null;

        // Group shows by location
        const venueMap = new Map<string, any[]>();
        concert.concert_shows.forEach((show) => {
            if (!venueMap.has(show.location)) {
                venueMap.set(show.location, []);
            }
            venueMap.get(show.location)!.push(show);
        });

        const venues = Array.from(venueMap.entries()).map(([location, shows]) => ({
            location,
            vendorId: concert.vendor_id,
            slots: shows.map((s) => ({
                id: s.id,
                time: s.time,
                language: concert.languages[0] || 'EN', // concerts don't have per-show language
            })),
        }));

        return {concert, venues};
    }
    catch (err) {
        console.error(err);
        return null;
    }
}

export async function getMovieShowDetails(id: string) {
    if (!isUUID(id)) return null;

    const show = await prisma.shows.findUnique({
        where: { id: id },

        include: {
            movies: true,
            theatres: true,
        },
    });

    if (!show) return null;

    return {
        show: {
            id: show.id,
            date: show.date,
            time: show.time,
            language: show.language,
            cost: show.cost,
            premium_cost: Number(show.premium_cost),
            seats: Number(show.seats),
        },

        movie: show.movies,

        theatre: {
            id: show.theatres.id,
            location: show.theatres.location,
            seatLayout: show.theatres.seatLayout as any[][],
        },
    };
}

export async function getConcertShowDetails(id: string) {
    if (!isUUID(id)) return null;
    const show = await prisma.concert_shows.findUnique({
        where: { id: id },

        include: {
            concerts: true,
        },
    });

    if (!show) return null;

    return {
        concert: show.concerts,
        show
    }
}