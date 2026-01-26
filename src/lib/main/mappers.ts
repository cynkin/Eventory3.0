import {ConcertCardDTO, MovieCardDTO, TrainCardDTO} from "../types/main";

export function mapMovieToCard(movie: any): MovieCardDTO {
    return {
        id: movie.id,
        title: movie.title,
        image: movie.image,
        ageRating: movie.ageRating,
        genres: movie.genres,
        duration: movie.duration,
    };
}

export function mapConcertToCard(concert: any): ConcertCardDTO {
    return {
        id: concert.id,
        title: concert.title,
        image: concert.image,
        ageRating: concert.ageRating,
        genres: concert.genres,
        duration: concert.duration,
        cost: concert.cost,
        languages: concert.languages,
        startDate: concert.startDate,
        endDate: concert.endDate,
    };
}

export function mapTrainToCard(train: any): TrainCardDTO {
    return {
        id: train.id,
        title: train.title,
        trainId: train.trainId,
        stations: train.stations,
    };
}