import  prisma from '@/lib/db';
import {getMovies, getConcerts, getTrains} from "@/lib/main/getData";
import CheckTag from "./CheckTag"
import {MovieCarousel} from "@/app/(main)/Events/Carousels/MovieCarousel";
import {ConcertCarousel} from "@/app/(main)/Events/Carousels/ConcertCarousel";
import {TrainCarousel} from "@/app/(main)/Events/Carousels/TrainCarousel";

export default async function HomePage() {
    const [movies, concerts, trains] = await Promise.all([
        getMovies({ take: 10 }),
        getConcerts({ take: 10 }),
        getTrains({ take: 10 }),
    ]);

    return (
        <>
            <CheckTag/>
            <MovieCarousel
                title="Movies Trending Right Now"
                initialItems={movies.items}
                initialCursor={movies.nextCursor}
            />

            <ConcertCarousel
                title="Enjoy the Most Awaited Concerts!"
                initialItems={concerts.items}
                initialCursor={concerts.nextCursor}
            />

            <TrainCarousel
                title="Travel and Explore!"
                initialItems={trains.items}
                initialCursor={trains.nextCursor}
            />
        </>
    );
}
