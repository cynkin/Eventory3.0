import { MovieCardDTO, ConcertCardDTO, TrainCardDTO } from "./main";

export type SearchResultType = 'movie' | 'concert' | 'train';

export interface MovieSearchResult {
    type: 'movie';
    item: MovieCardDTO;
}

export interface ConcertSearchResult {
    type: 'concert';
    item: ConcertCardDTO;
}

export interface TrainSearchResult {
    type: 'train';
    item: TrainCardDTO;
}

export type SearchResult = MovieSearchResult | ConcertSearchResult | TrainSearchResult;

export interface SearchResults {
    items: SearchResult[];
    movies: MovieCardDTO[];
    concerts: ConcertCardDTO[];
    trains: TrainCardDTO[];
    totalCount: number;
}

export interface SearchParams {
    query: string;
    take?: number;
}
