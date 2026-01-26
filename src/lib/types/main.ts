export interface MovieCardDTO {
    id: string;
    title: string;
    image: string;
    ageRating: string;
    genres: string[];
    duration: number;
}

export interface MovieDTO extends MovieCardDTO {
    description: string;
    commission: number;
    vendorId: string;
    createdAt: string; // ISO string
}

export interface ConcertCardDTO {
    id: string;
    title: string;
    image: string;
    ageRating: string;
    genres: string[];
    languages: string[];
    duration: number;
    cost: number;
    startDate: string;
    endDate: string;
}

export interface TrainCardDTO {
    id: string;
    title: string;
    trainId: number;
    stations: StationDTO[];
}

export interface StationDTO {
    name: string;
    code: string;
}

