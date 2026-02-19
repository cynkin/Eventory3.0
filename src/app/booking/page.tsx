'use server';
type PageProps = {
    searchParams: {
        q?: string
        id?: string
    }
}

export default async function Booking({ searchParams }: PageProps) {
    const {q, id} = await searchParams;
    return (
        <div>
            {q}
            {id}
        </div>
    )
}
