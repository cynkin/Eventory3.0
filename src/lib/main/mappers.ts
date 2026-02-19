import type { movies, concerts, trains } from "@prisma/client";
import { ConcertCardDTO, MovieCardDTO, TrainCardDTO } from "../types/main";

export function mapMovieToCard(movie: movies): MovieCardDTO {
    return {
        id: movie.id,
        title: movie.title,
        image: movie.image,
        ageRating: movie.ageRating,
        genres: movie.genres,
        duration: movie.duration,
    };
}

export function mapConcertToCard(concert: concerts): ConcertCardDTO {
    return {
        id: concert.id,
        title: concert.title,
        image: concert.image,
        ageRating: concert.ageRating,
        genres: concert.genres,
        duration: concert.duration,
        cost: concert.cost,
        languages: concert.languages,
        startDate: concert.start_date,
        endDate: concert.end_date,
    };
}

export function mapTrainToCard(train: trains): TrainCardDTO {
    return {
        id: train.id,
        title: train.title,
        trainId: train.train_id,
        stations: train.stations as { name: string; code: string }[],
    };
}