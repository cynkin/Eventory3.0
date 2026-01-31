import { getMovies, getConcerts, getTrains } from "@/lib/main/getData";
import CheckTag from "./CheckTag"
import { Suspense } from "react";
import { MovieCarousel } from "@/app/(main)/Events/Carousels/MovieCarousel";
import { ConcertCarousel } from "@/app/(main)/Events/Carousels/ConcertCarousel";
import { TrainCarousel } from "@/app/(main)/Events/Carousels/TrainCarousel";
import { CarouselSkeleton } from "@/components/skeletons/CarouselSkeleton";

export default async function HomePage() {
    const [movies, concerts, trains] = await Promise.all([
        getMovies({ take: 10 }),
        getConcerts({ take: 10 }),
        getTrains({ take: 10 }),
    ]);

    return (
        <>
            <CheckTag />
            <Suspense fallback={<CarouselSkeleton type="movie" titleWidth="w-72" />}>
                <MovieCarousel
                    title="Movies Trending Right Now"
                    initialItems={movies.items}
                    initialCursor={movies.nextCursor}
                />
            </Suspense>

            <Suspense fallback={<CarouselSkeleton type="concert" titleWidth="w-72" />}>
                <ConcertCarousel
                    title="Enjoy the Most Awaited Concerts!"
                    initialItems={concerts.items}
                    initialCursor={concerts.nextCursor}
                />
            </Suspense>


            <Suspense fallback={<CarouselSkeleton type="train" titleWidth="w-72" />}>
                <TrainCarousel
                    title="Travel and Explore!"
                    initialItems={trains.items}
                    initialCursor={trains.nextCursor}
                />
            </Suspense>
        </>
    );
}

