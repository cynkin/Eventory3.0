import React from 'react';
import QRCode from 'qrcode';
import { renderToBuffer } from '@react-pdf/renderer';
import { sendEmail } from '@/lib/email/send-email';
import { formatDate } from '@/lib/utils/formatDate';
import MovieTicketPDF from './MovieTicketPDF';
import ConcertTicketPDF from './ConcertTicketPDF';
import type { MovieTicketData, ConcertTicketData } from './types';

/**
 * Fetches a remote image and returns it as a base64 data URI.
 * This is required because @react-pdf/renderer often fails to
 * fetch remote images on its own (CORS, redirects, timeout, etc.).
 */
async function fetchImageAsBase64(url: string): Promise<string> {
    try {
        const res = await fetch(url);
        const buffer = await res.arrayBuffer();
        const contentType = res.headers.get('content-type') || 'image/jpeg';
        const base64 = Buffer.from(buffer).toString('base64');
        return `data:${contentType};base64,${base64}`;
    } catch (e) {
        console.error('Failed to fetch image for PDF:', url, e);
        return ''; // Return empty string — the Image component will be skipped
    }
}

/**
 * Generates a PDF ticket and sends it via email for a movie booking.
 * This should be called fire-and-forget (no await) after a successful transaction.
 */
export async function sendMovieTicketEmail(ticketData: MovieTicketData, userEmail: string) {
    const [qrCodeBase64, movieImageBase64] = await Promise.all([
        QRCode.toDataURL(JSON.stringify({ id: ticketData.booking_id })),
        fetchImageAsBase64(ticketData.movie.image),
    ]);

    const pdfBuffer = await renderToBuffer(
        <MovieTicketPDF
            ticket={ticketData}
            qrCodeBase64={qrCodeBase64}
            movieImageBase64={movieImageBase64}
        />
    );

    await sendEmail(
        userEmail,
        `Ticket for ${ticketData.movie.title} on ${formatDate(ticketData.date)}`,
        'Thank you for choosing us to entertain you! For verification and check-in, please download the ticket attached below!',
        {
            attachments: [
                {
                    filename: `ticket_${ticketData.booking_id}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf',
                },
            ],
        }
    );
}

/**
 * Generates a PDF ticket and sends it via email for a concert booking.
 * This should be called fire-and-forget (no await) after a successful transaction.
 */
export async function sendConcertTicketEmail(ticketData: ConcertTicketData, userEmail: string) {
    const [qrCodeBase64, concertImageBase64] = await Promise.all([
        QRCode.toDataURL(JSON.stringify({ id: ticketData.booking_id })),
        fetchImageAsBase64(ticketData.concert.image),
    ]);

    const pdfBuffer = await renderToBuffer(
        <ConcertTicketPDF
            ticket={ticketData}
            qrCodeBase64={qrCodeBase64}
            concertImageBase64={concertImageBase64}
        />
    );

    await sendEmail(
        userEmail,
        `Ticket for ${ticketData.concert.title} on ${formatDate(ticketData.date)}`,
        'Thank you for choosing us to entertain you! For verification and check-in, please download the ticket attached below!',
        {
            attachments: [
                {
                    filename: `ticket_${ticketData.booking_id}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf',
                },
            ],
        }
    );
}
