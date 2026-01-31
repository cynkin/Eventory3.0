'use client';
import { InfiniteCarousel } from "@/components/ui/InfiniteCarousel";
import { MovieCard } from "../Cards/MovieCard";
import { MovieCardSkeleton } from "../Cards/MovieCardSkeleton";
import { MovieCardDTO } from "@/lib/types/main";
import { getMovies } from "@/lib/main/getData";

interface Props {
    title: string;
    initialItems: MovieCardDTO[];
    initialCursor: string | null;
}

export function MovieCarousel({ title, initialItems, initialCursor }: Props) {

    return (
        <InfiniteCarousel
            title={title}
            initialItems={initialItems}
            initialCursor={initialCursor}
            fetchMore={(cursor) => getMovies({ take: 10, cursor })}
            renderItem={(movie) => <MovieCard {...movie} />}
            renderSkeleton={() => <MovieCardSkeleton />}
            keyExtractor={(movie) => movie.id}
        />
    );
}
