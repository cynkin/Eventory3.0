'use server';
import {getConcertShowDetails} from "@/lib/main/getData";
import PaymentPage from "@/app/booking/payment/Payment";

type PageProps = {
    searchParams: {
        id: string
    }
}

export default async function ConcertPayment({ searchParams }: PageProps) {
    const {id} = await searchParams;
    console.log(id);

    const data = await getConcertShowDetails(id);
    if (!data) return <div>Show Not Found</div>;
    console.log(data);

    return <PaymentPage show={data.show} concert={data.concert}/>
}
