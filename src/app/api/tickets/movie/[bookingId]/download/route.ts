import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/auth';
import { generateMovieTicketPDF } from '@/lib/email/tickets/sendTicketEmail';
import type { MovieTicketData } from '@/lib/email/tickets/types';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ bookingId: string }> }
) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId } = await params;

    const ticket = await prisma.tickets.findFirst({
        where: {
            id: bookingId,
            user_id: session.user.id,
            NOT: {
                status: {
                    in: ['cancelled', 'expired'],
                },
            },
        },
        include: {
            shows: {
                include: {
                    movies: true,
                    theatres: true,
                },
            },
        },
    });

    if (!ticket) {
        return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const ticketData: MovieTicketData = {
        booking_id: ticket.id,
        amount: ticket.amount,
        seats: ticket.seats,
        time: ticket.shows.time,
        date: ticket.shows.date,
        language: ticket.shows.language,
        location: ticket.shows.theatres.location,
        movie: {
            title: ticket.shows.movies.title,
            image: ticket.shows.movies.image,
            ageRating: ticket.shows.movies.ageRating,
        },
    };

    const pdfBuffer = await generateMovieTicketPDF(ticketData);
    const pdfBytes = new Uint8Array(pdfBuffer);

    return new NextResponse(pdfBytes, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="ticket_${ticket.id}.pdf"`,
        },
    });
}