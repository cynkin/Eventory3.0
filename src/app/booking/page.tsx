'use server';
import MovieBooking from "@/app/booking/MovieBooking";
import ConcertBooking from "@/app/booking/ConcertBooking";
import TrainBooking from "@/app/booking/TrainBooking";
import { getMovieDetails, getConcertDetails, getTrainDetails } from "@/lib/main/getData";

type PageProps = {
    searchParams: Promise<{ q?: string; id: string; date?: string }>;
}

export default async function Booking({ searchParams }: PageProps) {
    const { q, id, date } = await searchParams;
    const selectedDate = date ?? new Date().toISOString().split('T')[0];

    if (q === "movie") {
        const data = await getMovieDetails(id, selectedDate);
        if (!data) return <div>Movie not found</div>;
        return <MovieBooking movie={data.movie} theatres={data.theatres} />;
    }

    if (q === "concert") {
        const data = await getConcertDetails(id, selectedDate);
        if (!data) return <div>Concert not found</div>;
        return <ConcertBooking concert={data.concert} venues={data.venues} />;
    }

    if (q === "train") {
        const train = await getTrainDetails(id);
        if (!train) return <div>Train not found</div>;
        return <TrainBooking train={train as any} />;
    }

    return <div>Invalid event type</div>;
}
