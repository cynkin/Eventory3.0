'use client'

import { useState } from "react";
import type {
    MovieTicket,
    ConcertTicket,
    TrainTicket,
    VendorMovieData,
    VendorConcertData,
    VendorTrainData,
} from "@/server-components/account/getTickets";

function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const weekday = date.toLocaleString('en-US', { weekday: 'short' });
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    return `${weekday}, ${day} ${month}`;
}

function to12(time24: string) {
    return new Date(`1970-01-01T${time24}:00`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

// ---- USER VIEW ----

type UserHistoryProps = {
    movieTickets: MovieTicket[];
    concertTickets: ConcertTicket[];
    trainTickets: TrainTicket[];
};

function UserHistory({ movieTickets, concertTickets, trainTickets }: UserHistoryProps) {
    return (
        <div className="flex mt-6 flex-row items-center flex-wrap">
            {movieTickets.length > 0 &&
                movieTickets.map((ticket, index) => (
                    <div key={index} className={`border-2 relative ${ticket.status === 'cancelled' && 'bg-red-50'} p-2 m-2 text-sm rounded-xl w-fit border-pink-600 shadow-xs`}>
                        {ticket.status === 'cancelled' && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-30deg] tracking-widest text-red-600 text-4xl font-bold opacity-50 pointer-events-none select-none">
                                CANCELLED
                            </div>
                        )}
                        <div className="font-medium mb-1 text-lg">{ticket.movie.title}</div>
                        <div>{ticket.time}</div>
                        <div>{formatDate(ticket.date)}</div>
                        <div>{ticket.location}</div>
                        <div className="mt-1 font-bold">Total : &#8377; {ticket.amount}</div>
                        {ticket.status !== 'cancelled' && ticket.status !== 'expired' ?
                            <div className="flex mt-2 justify-between items-center">
                                <button className="bg-blue-400 hover:bg-blue-500 cursor-pointer p-1 px-3 text-white rounded-full mr-2">Download Ticket</button>
                                <button className="bg-red-400 hover:bg-red-500 cursor-pointer p-1 px-3 text-white rounded-full">Cancel Ticket</button>
                            </div>
                            :
                            <div className="h-9"></div>
                        }
                    </div>
                ))
            }

            {concertTickets.length > 0 &&
                concertTickets.map((ticket, index) => (
                    <div key={index} className={`border-2 relative ${ticket.status === 'cancelled' && 'bg-red-50'} p-2 m-2 text-sm rounded-xl w-fit border-purple-600 shadow-xs`}>
                        {ticket.status === 'cancelled' && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-30deg] tracking-widest text-red-600 text-4xl font-bold opacity-50 pointer-events-none select-none">
                                CANCELLED
                            </div>
                        )}
                        <div className="font-medium mb-1 text-lg">{ticket.concert.title}</div>
                        <div>{ticket.time}</div>
                        <div>{formatDate(ticket.date)}</div>
                        <div>{ticket.location}</div>
                        <div className="mt-1 font-bold">Total : &#8377; {ticket.amount}</div>
                        {ticket.status !== 'cancelled' && ticket.status !== 'expired' ?
                            <div className="flex mt-2 justify-between items-center">
                                <button className="bg-blue-400 hover:bg-blue-500 cursor-pointer p-1 px-3 text-white rounded-full mr-2">Download Ticket</button>
                                <button className="bg-red-400 hover:bg-red-500 cursor-pointer p-1 px-3 text-white rounded-full">Cancel Ticket</button>
                            </div>
                            :
                            <div className="h-9"></div>
                        }
                    </div>
                ))
            }

            {trainTickets.length > 0 &&
                trainTickets.map((ticket, index) => (
                    <div key={index} className={`border-2 relative ${ticket.status === 'cancelled' && 'bg-red-50'} p-2 m-2 text-sm rounded-xl w-fit border-green-600 shadow-xs`}>
                        {ticket.status === 'cancelled' && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-30deg] tracking-widest text-red-600 text-4xl font-bold opacity-50 pointer-events-none select-none">
                                CANCELLED
                            </div>
                        )}
                        <div className="font-medium mb-1 text-lg">{ticket.title}</div>
                        <div>From: <span className="font-bold">{ticket.from.location}</span></div>
                        <div>To: <span className="font-bold">{ticket.to.location}</span></div>
                        <div>Boarding Date: <span className="font-bold">{formatDate(ticket.from.date)}</span></div>
                        <div>Boarding Time: <span className="font-bold">{to12(ticket.from.time)}</span></div>
                        <div className="mt-1 font-bold">Total : &#8377; {ticket.amount}</div>
                        {ticket.status !== 'cancelled' && ticket.status !== 'expired' ?
                            <div className="flex mt-2 justify-between items-center">
                                <button className="bg-blue-400 hover:bg-blue-500 cursor-pointer p-1 px-3 text-white rounded-full mr-2">Download Ticket</button>
                                <button className="bg-red-400 hover:bg-red-500 cursor-pointer p-1 px-3 text-white rounded-full">Cancel Ticket</button>
                            </div>
                            :
                            <div className="h-9"></div>
                        }
                    </div>
                ))
            }

            {trainTickets.length === 0 && movieTickets.length === 0 && concertTickets.length === 0 &&
                <div className="m-10 text-3xl">So dry!</div>
            }
        </div>
    );
}

// ---- VENDOR VIEW ----

type VendorHistoryProps = {
    movieData: VendorMovieData[];
    concertData: VendorConcertData[];
    trainData: VendorTrainData[];
};

function VendorHistory({ movieData, concertData, trainData }: VendorHistoryProps) {
    const [theatre, setTheatre] = useState<{ theatre: any; id: string | null }>({
        theatre: null,
        id: null,
    });
    const [concertShow, setConcertShow] = useState<{ show: any; id: string | null }>({
        show: null,
        id: null,
    });

    return (
        <div className="flex mt-6 flex-row items-center flex-wrap">
            {movieData.length > 0 &&
                movieData.map((item, index) => (
                    <div key={index} className="border-2 p-2 flex flex-col m-2 text-sm rounded-xl w-full border-pink-600 shadow-xs">
                        <div className="flex flex-row">
                            <div className="m-2">
                                <img alt="" className="rounded-xl scale-100 h-full w-auto overflow-hidden transition-all ease-in-out duration-300"
                                    style={{ objectFit: "cover", objectPosition: "center" }}
                                    src={item.movie.image} />
                            </div>
                            <div className="my-2 mx-2">
                                <div className="font-medium my-1 text-xl">{item.movie.title}</div>
                                <div className="ml-1 mb-1 text-nowrap font-medium">
                                    <div>{item.movie.ageRating}</div>
                                    <div className="flex">
                                        {item.movie.genres.map((genre, idx) => (
                                            <div key={idx}>{idx !== 0 && ', '}{genre}</div>
                                        ))}
                                    </div>
                                    <div>
                                        {item.movie.duration > 60 && `${Math.floor(item.movie.duration / 60)} hr`}
                                        {item.movie.duration % 60 > 0 && ` ${item.movie.duration % 60} min`}
                                    </div>
                                    <div>Commission: {item.movie.commission}%</div>
                                </div>
                                <div className="ml-1">
                                    {item.movie.description.split(" ").slice(0, 18).join(" ") + "..."}
                                </div>
                            </div>
                            <div className="text-nowrap">
                                {item.theatres.map((t, idx) => (
                                    <div key={idx} onClick={() => setTheatre({ theatre: t, id: item.movie.id })}
                                        className="bg-pink-700 hover:bg-pink-900 cursor-pointer py-2 px-3 text-white rounded-xl my-2">
                                        {t.location}
                                    </div>
                                ))}
                            </div>
                        </div>
                        {theatre.theatre && theatre.id === item.movie.id && (
                            <div className="mx-6">
                                <div className="text-right mb-4">
                                    <button onClick={() => setTheatre({ theatre: null, id: null })}
                                        className="bg-red-400 hover:bg-red-500 cursor-pointer p-1 px-3 text-white rounded-full">
                                        Show less
                                    </button>
                                </div>
                                {theatre.theatre.shows.map((show: any, idx: number) => (
                                    <div key={idx} className="flex p-3 px-4 mt-1 mb-3 bg-pink-50 rounded-2xl text-nowrap items-center flex-row space-x-20">
                                        <div className="font-medium">{formatDate(show.date)}</div>
                                        <div className="flex space-x-5 items-center w-full">
                                            {show.details.map((detail: any, i: number) => (
                                                <div key={i} className="relative cursor-pointer bg-pink-50 border-2 border-pink-600 text-center rounded-xl px-6 pt-5 pb-2">
                                                    <div className="absolute shadow -top-2 left-1/2 -translate-x-1/2 px-2 rounded-lg bg-white font-extrabold text-xs tracking-wide">
                                                        {detail.language}
                                                    </div>
                                                    <div className="self-center">{detail.time}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))
            }

            {concertData.length > 0 &&
                concertData.map((item, index) => (
                    <div key={index} className="border-2 p-2 flex flex-col m-2 text-sm rounded-xl w-full border-purple-600 shadow-xs">
                        <div className="flex flex-row">
                            <div className="m-2">
                                <img alt="" className="rounded-xl scale-100 h-full w-auto overflow-hidden transition-all ease-in-out duration-300"
                                    style={{ objectFit: "cover", objectPosition: "center" }}
                                    src={item.concert.image} />
                            </div>
                            <div className="my-2 mx-2">
                                <div className="font-medium my-1 text-xl">{item.concert.title}</div>
                                <div className="ml-1 mb-1 text-nowrap font-medium">
                                    <div>{item.concert.ageRating}</div>
                                    <div className="flex">
                                        {item.concert.genres.map((genre, idx) => (
                                            <div key={idx}>{idx !== 0 && ', '}{genre}</div>
                                        ))}
                                    </div>
                                    <div>
                                        {item.concert.duration > 60 && `${Math.floor(item.concert.duration / 60)} hr`}
                                        {item.concert.duration % 60 > 0 && ` ${item.concert.duration % 60} min`}
                                    </div>
                                </div>
                                <div className="ml-1">
                                    {item.concert.description.split(" ").slice(0, 18).join(" ") + "..."}
                                </div>
                            </div>
                            <div className="text-nowrap">
                                {item.shows.map((show, idx) => (
                                    <div key={idx} onClick={() => setConcertShow({ show, id: item.concert.id })}
                                        className="bg-purple-700 hover:bg-purple-900 cursor-pointer py-2 px-3 text-white rounded-xl my-2">
                                        {show.location}
                                    </div>
                                ))}
                            </div>
                        </div>
                        {concertShow.show && concertShow.id === item.concert.id && (
                            <div className="mx-6">
                                <div className="text-right my-4">
                                    <button onClick={() => setConcertShow({ show: null, id: null })}
                                        className="bg-red-400 hover:bg-red-500 cursor-pointer p-1 px-3 text-white rounded-full">
                                        Show less
                                    </button>
                                </div>
                                <div className="flex p-3 px-4 mt-1 mb-3 bg-pink-50 rounded-2xl text-nowrap items-center flex-row space-x-20">
                                    <div className="font-medium">{formatDate(concertShow.show.date)}</div>
                                    <div className="font-medium">{to12(concertShow.show.time)}</div>
                                    <div className="font-medium">{concertShow.show.seats} seats left</div>
                                </div>
                            </div>
                        )}
                    </div>
                ))
            }

            {trainData.length > 0 &&
                trainData.map((ticket, index) => (
                    <div key={index} className="border-2 p-2 w-fit flex flex-col m-2 text-sm rounded-xl border-cyan-600 shadow-xs">
                        <div className="flex flex-row">
                            <div className="my-2 mx-2">
                                <div className="font-medium my-1 text-xl">{ticket.title}</div>
                                <div className="ml-3 font-medium">#{ticket.number}</div>
                                <div className="flex mt-3 items-center justify-center space-x-2">
                                    <div className="text-gray-800 text-nowrap ml-3 text-lg">{ticket.from.location}</div>
                                    <div className="flex-grow min-w-10 h-0.5 bg-gray-300"></div>
                                    <div className="text-green-500 text-nowrap text-sm font-medium">{ticket.duration}</div>
                                    <div className="flex-grow min-w-10 h-0.5 bg-gray-300"></div>
                                    <div className="text-gray-800 text-nowrap mr-3 text-lg">{ticket.to.location}</div>
                                </div>
                                <div className="flex items-center justify-between space-x-2">
                                    <div className="text-gray-600 ml-5 text-sm font-medium">{to12(ticket.from.time)}</div>
                                    <div className="text-gray-600 mr-5 text-sm font-medium">{to12(ticket.to.time)}</div>
                                </div>
                                <div className="flex items-center justify-between space-x-2 mb-4">
                                    <div className="text-gray-600 ml-5 text-sm font-medium">{formatDate(ticket.from.date)}</div>
                                    <div className="text-gray-600 mr-5 text-sm font-medium">{formatDate(ticket.to.date)}</div>
                                </div>
                            </div>
                        </div>
                        <div className="border rounded-xl border-cyan-600 p-2 mt-2">
                            {ticket.stations.map((station: any, idx: number) => (
                                <div key={idx}>
                                    <div className="flex items-center space-x-8">
                                        <div className="w-3/7">{station.location}</div>
                                        <div className="w-1/7 font-medium">{to12(station.time)}</div>
                                        <div className="w-2/7 font-medium">{formatDate(station.date)}</div>
                                        <div className="w-1/7 font-medium">&#8377; {station.cost}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            }
        </div>
    );
}

// ---- MAIN COMPONENT ----

type HistoryPageProps = {
    role: string;
    userTickets?: {
        movies: MovieTicket[];
        concerts: ConcertTicket[];
        trains: TrainTicket[];
    };
    vendorData?: {
        movies: VendorMovieData[];
        concerts: VendorConcertData[];
        trains: VendorTrainData[];
    };
};

export default function HistoryPage({ role, userTickets, vendorData }: HistoryPageProps) {
    return (
        <div className="w-full border pt-13 pb-11 px-12 border-gray-300 rounded-xl m-5">
            <div className="text-3xl font-bold">
                {role === "vendor" ? "Event History" : "Booking History"}
            </div>
            {role === "vendor" && vendorData ? (
                <VendorHistory
                    movieData={vendorData.movies}
                    concertData={vendorData.concerts}
                    trainData={vendorData.trains}
                />
            ) : userTickets ? (
                <UserHistory
                    movieTickets={userTickets.movies}
                    concertTickets={userTickets.concerts}
                    trainTickets={userTickets.trains}
                />
            ) : (
                <div className="m-10 text-3xl">So dry!</div>
            )}
        </div>
    );
}
