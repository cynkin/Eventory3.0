'use server'

import prisma from "@/lib/db";

export type MovieTicket = {
    amount: number;
    seats: string[];
    time: string;
    date: string;
    location: string;
    movie: {
        title: string;
        image: string;
        ageRating: string;
    };
    language: string;
    booking_id: string;
    status: string | null;
};

export type ConcertTicket = {
    id: string;
    amount: number;
    seats: number;
    time: string;
    date: string;
    location: string;
    concert: {
        title: string;
        image: string;
        ageRating: string;
    };
    status: string | null;
};

export type TrainTicket = {
    id: string;
    amount: number;
    title: string;
    trainId: number;
    from: any;
    to: any;
    bookedSeats: string[];
    passengers: any;
    status: string | null;
};

export type VendorMovieData = {
    movie: {
        id: string;
        title: string;
        image: string;
        ageRating: string;
        genres: string[];
        duration: number;
        description: string;
        commission: number;
    };
    theatres: {
        location: string;
        shows: {
            date: string;
            details: { time: string; language: string }[];
        }[];
    }[];
};

export type VendorConcertData = {
    concert: {
        id: string;
        title: string;
        image: string;
        ageRating: string;
        genres: string[];
        duration: number;
        description: string;
    };
    shows: {
        id: string;
        date: string;
        time: string;
        location: string;
        seats: number;
    }[];
};

export type VendorTrainData = {
    id: string;
    title: string;
    number: number;
    from: any;
    to: any;
    duration: string;
    stations: any[];
    vendor_id: string;
};

/**
 * Fetches all ticket data for a user in a single parallel batch.
 * Industry-standard: no client-side API calls, no waterfall,
 * one Promise.all with 3 Prisma queries.
 */
export async function getUserTickets(userId: string) {
    const [movieTickets, concertTickets, trainTickets] = await Promise.all([
        prisma.tickets.findMany({
            where: { user_id: userId },
            include: {
                shows: {
                    include: {
                        movies: true,
                        theatres: true,
                    },
                },
            },
        }),
        prisma.concert_tickets.findMany({
            where: { user_id: userId },
            include: {
                concert_shows: {
                    include: {
                        concerts: true,
                    },
                },
            },
        }),
        prisma.train_tickets.findMany({
            where: { user_id: userId },
            include: {
                trains: true,
            },
        }),
    ]);

    const movies: MovieTicket[] = movieTickets.map((t) => ({
        amount: t.amount,
        seats: t.seats,
        time: t.shows.time,
        date: t.shows.date,
        location: t.shows.theatres.location,
        movie: {
            title: t.shows.movies.title,
            image: t.shows.movies.image,
            ageRating: t.shows.movies.ageRating,
        },
        language: t.shows.language,
        booking_id: t.id,
        status: t.status,
    }));

    const concerts: ConcertTicket[] = concertTickets.map((t) => ({
        id: t.id,
        amount: t.amount,
        seats: t.seats,
        time: t.concert_shows.time,
        date: t.concert_shows.date,
        location: t.concert_shows.location,
        concert: {
            title: t.concert_shows.concerts.title,
            image: t.concert_shows.concerts.image,
            ageRating: t.concert_shows.concerts.ageRating,
        },
        status: t.status,
    }));

    const trains: TrainTicket[] = trainTickets.map((t) => ({
        id: t.id,
        amount: t.amount,
        title: t.trains.title,
        trainId: t.trains.train_id,
        from: t.from_station,
        to: t.to_station,
        bookedSeats: t.seats,
        passengers: t.passengers,
        status: t.status,
    }));

    return { movies, concerts, trains };
}

/**
 * Fetches vendor event data in a single parallel batch.
 */
export async function getVendorTickets(vendorId: string) {
    const [movies, concerts, trains] = await Promise.all([
        prisma.movies.findMany({
            where: { vendor_id: vendorId },
            include: {
                theatres: {
                    include: { shows: true },
                },
            },
        }),
        prisma.concerts.findMany({
            where: { vendor_id: vendorId },
            include: {
                concert_shows: true,
            },
        }),
        prisma.trains.findMany({
            where: { vendor_id: vendorId },
            include: {
                train_tickets: true,
            },
        }),
    ]);

    const movieData: VendorMovieData[] = movies.map((movie) => {
        const theatres = movie.theatres.map((theatre) => {
            const grouped: { date: string; details: { time: string; language: string }[] }[] = [];
            for (const show of theatre.shows) {
                let group = grouped.find((g) => g.date === show.date);
                if (!group) {
                    group = { date: show.date, details: [] };
                    grouped.push(group);
                }
                group.details.push({ time: show.time, language: show.language });
            }
            return { location: theatre.location, shows: grouped };
        });

        return {
            movie: {
                id: movie.id,
                title: movie.title,
                image: movie.image,
                ageRating: movie.ageRating,
                genres: movie.genres,
                duration: movie.duration,
                description: movie.description,
                commission: movie.commission,
            },
            theatres,
        };
    });

    const concertData: VendorConcertData[] = concerts.map((concert) => ({
        concert: {
            id: concert.id,
            title: concert.title,
            image: concert.image,
            ageRating: concert.ageRating,
            genres: concert.genres,
            duration: concert.duration,
            description: concert.description,
        },
        shows: concert.concert_shows.map((s) => ({
            id: s.id,
            date: s.date,
            time: s.time,
            location: s.location,
            seats: s.seats,
        })),
    }));

    const trainData: VendorTrainData[] = trains.map((train) => {
        const stations = train.stations as any[];
        const start = stations[0];
        const end = stations[stations.length - 1];

        const startDateTime = new Date(`${start.date}T${start.time}`);
        const endDateTime = new Date(`${end.date}T${end.time}`);
        const msDiff = endDateTime.getTime() - startDateTime.getTime();
        const totalMinutes = Math.floor(msDiff / 1000 / 60);
        const days = Math.floor(totalMinutes / (60 * 24));
        const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
        const minutes = totalMinutes % 60;
        let duration = "";
        if (days > 0) duration += `${days}d `;
        if (hours > 0 || days > 0) duration += `${hours}h `;
        if (minutes > 0 || (days === 0 && hours === 0)) duration += `${minutes}m`;
        duration = duration.trim();

        return {
            id: train.id,
            title: train.title,
            number: train.train_id,
            from: start,
            to: end,
            duration,
            stations,
            vendor_id: train.vendor_id,
        };
    });

    return { movies: movieData, concerts: concertData, trains: trainData };
}
