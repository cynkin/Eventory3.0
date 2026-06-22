import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/auth';
import { generateConcertTicketPDF } from '@/lib/email/tickets/sendTicketEmail';
import type { ConcertTicketData } from '@/lib/email/tickets/types';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ bookingId: string }> }
) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId } = await params;

    const ticket = await prisma.concert_tickets.findFirst({
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
            concert_shows: {
                include: {
                    concerts: true,
                },
            },
        },
    });

    if (!ticket) {
        return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const ticketData: ConcertTicketData = {
        booking_id: ticket.id,
        amount: ticket.amount,
        noOfSeats: ticket.seats,
        date: ticket.concert_shows.date,
        time: ticket.concert_shows.time,
        location: ticket.concert_shows.location,
        concert: {
            title: ticket.concert_shows.concerts.title,
            image: ticket.concert_shows.concerts.image,
            ageRating: ticket.concert_shows.concerts.ageRating,
        },
    };

    const pdfBuffer = await generateConcertTicketPDF(ticketData);
    const pdfBytes = new Uint8Array(pdfBuffer);

    return new NextResponse(pdfBytes, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="ticket_${ticket.id}.pdf"`,
        },
    });
}