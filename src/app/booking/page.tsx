'use server';
import MovieBooking from "@/app/booking/MovieBooking";
import ConcertBooking from "@/app/booking/ConcertBooking";
import {getMovieDetails, getConcertDetails} from "@/lib/main/getData";


type PageProps = {
    searchParams: {
        q?: string
        id: string
        date?: string
    }
}

export default async function Booking({ searchParams }: PageProps) {
    const {q, id, date} = await searchParams;
    const selectedDate = date ?? new Date().toISOString().split('T')[0];

    if (q === "movie") {
        const data = await getMovieDetails(id, selectedDate);
        if (!data) return <div>Movie not found</div>;
        return <MovieBooking movie={data.movie} theatres={data.theatres}/>;
    }

    if (q === "concert") {
        const data = await getConcertDetails(id, selectedDate);
        if (!data) return <div>Concert not found</div>;
        return <ConcertBooking concert={data.concert} venues={data.venues}/>;
    }

    return <div>Invalid event type</div>;
}
