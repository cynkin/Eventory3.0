import React from 'react';
import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { getBase64 } from '@/lib/utils/getBase64';
import { formatDate } from '@/lib/utils/formatDate';
import type { MovieTicketData } from './types';

const logoBase64 = getBase64('src/images/logo.png');

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 14,
        fontFamily: 'Helvetica',
        backgroundColor: '#f9fafb',
    },
    header: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        padding: 12,
        borderRadius: 12,
        border: '1 solid #e5e7eb',
        marginVertical: 16,
    },
    movieImage: {
        width: 100,
        height: 140,
        borderRadius: 8,
        objectFit: 'cover',
        marginRight: 16,
    },
    movieDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    movieTitle: {
        fontSize: 24,
        fontWeight: 700,
        color: '#111827',
        marginBottom: 6,
        letterSpacing: 1.05,
    },
    subtitle: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 3,
    },
    section: {
        padding: 16,
        backgroundColor: '#ffffff',
        border: '1 solid #e5e7eb',
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontWeight: 600,
        color: '#374151',
        marginBottom: 5,
    },
    infoDetails: {
        fontSize: 13,
        color: '#374151',
        marginLeft: 3,
    },
    seatBox: {
        padding: 6,
        borderRadius: 6,
        backgroundColor: '#e0f2fe',
        color: '#0284c7',
        marginRight: 6,
        marginBottom: 2,
        fontSize: 15,
    },
    qrCode: {
        width: 140,
        height: 140,
    },
});

type Props = {
    ticket: MovieTicketData;
    qrCodeBase64: string;
    movieImageBase64: string;
};

const MovieTicketPDF = ({ ticket, qrCodeBase64, movieImageBase64 }: Props) => (
    <Document>
        <Page size={[615, 620]} style={styles.page}>
            <Image src={logoBase64} style={{ width: 150 }} />

            <View style={styles.header}>
                {movieImageBase64 ? (
                    <Image src={movieImageBase64} style={styles.movieImage} />
                ) : null}
                <View style={styles.movieDetails}>
                    <Text style={styles.movieTitle}>{ticket.movie.title.toUpperCase()}</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={[styles.subtitle, { marginRight: 25, marginBottom: 5 }]}>
                            {ticket.movie.ageRating}
                        </Text>
                        <Text style={styles.subtitle}>{ticket.language}</Text>
                    </View>
                    <Text style={styles.subtitle}>{ticket.location}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <View>
                    <View style={{ marginBottom: 8 }}>
                        <Text style={styles.label}>Show Date & Time</Text>
                        <Text style={styles.infoDetails}>
                            {formatDate(ticket.date)}, {ticket.time}
                        </Text>
                    </View>

                    <Text style={[styles.label, { marginTop: 8 }]}>Seats Info:</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 }}>
                        {ticket.seats.map((seat, i) => (
                            <View key={i} style={styles.seatBox}>
                                <Text>{seat}</Text>
                            </View>
                        ))}
                    </View>

                    <View>
                        <Text style={[styles.label, { marginBottom: 7, marginTop: 16 }]}>
                            Booking ID:
                        </Text>
                        <Text style={styles.infoDetails}>{ticket.booking_id}</Text>
                    </View>
                </View>

                <View>
                    <Image src={qrCodeBase64} style={styles.qrCode} />
                </View>
            </View>
        </Page>
    </Document>
);

export default MovieTicketPDF;
