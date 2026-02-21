import React from 'react';
import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { getBase64 } from '@/lib/utils/getBase64';
import { formatDate } from '@/lib/utils/formatDate';
import type { ConcertTicketData } from './types';

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
        marginBottom: 16,
    },
    concertImage: {
        width: 100,
        height: 140,
        borderRadius: 8,
        objectFit: 'cover',
        marginRight: 16,
    },
    concertDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    concertTitle: {
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
    qrCode: {
        width: 140,
        height: 140,
    },
});

type Props = {
    ticket: ConcertTicketData;
    qrCodeBase64: string;
    concertImageBase64: string;
};

const ConcertTicketPDF = ({ ticket, qrCodeBase64, concertImageBase64 }: Props) => (
    <Document>
        <Page size={[595, 620]} style={styles.page}>
            <Image src={logoBase64} style={{ width: 150 }} />

            <View style={styles.header}>
                {concertImageBase64 ? (
                    <Image src={concertImageBase64} style={styles.concertImage} />
                ) : null}
                <View style={styles.concertDetails}>
                    <Text style={styles.concertTitle}>
                        {ticket.concert.title.toUpperCase()}
                    </Text>
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

                    <Text style={[styles.label, { marginTop: 8 }]}>Seats:</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 }}>
                        <Text style={styles.infoDetails}>{ticket.noOfSeats}</Text>
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

export default ConcertTicketPDF;
