'use server';
import {getMovieShowDetails} from "@/lib/main/getData";
import SeatSelection from "./Seats";

type PageProps = {
    searchParams: {
        id: string
    }
}

export default async function Seats({ searchParams }: PageProps) {
    const {id} = await searchParams;
    console.log(id);

    const data = await getMovieShowDetails(id);
    if (!data) return <div>Show Not Found</div>;
    console.log(data);

    return (<SeatSelection movie={data.movie} show={data.show} theatre={data.theatre}/>);
}
