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
