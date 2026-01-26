import prisma from "@/lib/db";
import {NextRequest, NextResponse} from "next/server";

export async function GET(req: NextRequest){
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor');

    const movies = await prisma.movies.findMany({
        take: 10,
        ...(cursor && {
            cursor: {id: cursor},
            skip: 1,
        }),
        orderBy: {
            createdAt : "desc",
        },
    })
    return NextResponse.json(movies);
}