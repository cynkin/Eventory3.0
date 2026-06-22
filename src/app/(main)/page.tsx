import { getMovies, getConcerts, getTrains } from "@/lib/main/getData";
import CheckTag from "./CheckTag";
import { SimpleCarousel } from "@/components/ui/SimpleCarousel";
import { MovieCard } from "@/app/(main)/Events/Cards/MovieCard";
import { ConcertCard } from "@/app/(main)/Events/Cards/ConcertCard";
import { TrainCard } from "@/app/(main)/Events/Cards/TrainCard";

export default async function HomePage() {
    const [movies, concerts, trains] = await Promise.all([
        getMovies({ take: 20 }),
        getConcerts({ take: 20 }),
        getTrains({ take: 20 }),
    ]);

    return (
        <>
            <CheckTag />

            <SimpleCarousel title="Movies Trending Right Now">
                {movies.items.map((m) => <MovieCard key={m.id} {...m} />)}
            </SimpleCarousel>

            <SimpleCarousel title="Enjoy the Most Awaited Concerts!">
                {concerts.items.map((c) => <ConcertCard key={c.id} {...c} />)}
            </SimpleCarousel>

            <SimpleCarousel title="Travel and Explore!">
                {trains.items.map((t) => <TrainCard key={t.id} {...t} />)}
            </SimpleCarousel>
        </>
    );
}
