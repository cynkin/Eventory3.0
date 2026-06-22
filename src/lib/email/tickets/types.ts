export type MovieTicketData = {
    booking_id: string;
    amount: number;
    seats: string[];
    time: string;
    date: string;
    language: string;
    location: string;
    movie: {
        title: string;
        image: string;
        ageRating: string;
    };
};

export type ConcertTicketData = {
    booking_id: string;
    amount: number;
    noOfSeats: number;
    date: string;
    time: string;
    location: string;
    concert: {
        title: string;
        image: string;
        ageRating: string;
    };
};

export type TrainTicketData = {
    booking_id: string;
    title: string;
    trainId: number;
    amount: number;
    bookedSeats: string[];
    passengers: { name: string; age: number; gender: string }[];
    from: { location: string; date: string; time: string };
    to: { location: string; date: string; time: string };
};
