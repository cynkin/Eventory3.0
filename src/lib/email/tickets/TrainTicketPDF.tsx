import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import type { TrainTicketData } from './types';

function to12Hour(time: string) {
    return new Date(`1970-01-01T${time}:00`).toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', hour12: true,
    });
}

function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return `${d.toLocaleString('en-US', { weekday: 'short' })}, ${d.getDate()} ${d.toLocaleString('en-US', { month: 'short' })}`;
}

const s = StyleSheet.create({
    page: { padding: 30, fontSize: 13, fontFamily: 'Helvetica', backgroundColor: '#f9fafb' },
    title: { fontSize: 22, fontWeight: 700, marginBottom: 4 },
    section: { padding: 14, backgroundColor: '#ffffff', border: '1 solid #e5e7eb', borderRadius: 10, marginTop: 12, flexDirection: 'row', justifyContent: 'space-between' },
    label: { fontWeight: 600, color: '#374151', marginBottom: 4, marginTop: 8 },
    info: { color: '#374151', marginLeft: 4, marginBottom: 2 },
    seatBox: { padding: 5, borderRadius: 5, backgroundColor: '#e0f2fe', color: '#0284c7', marginRight: 5, marginBottom: 4 },
    passenger: { padding: 5, borderRadius: 5, backgroundColor: '#fef5e0', marginBottom: 5 },
});

type Props = { ticket: TrainTicketData; qrCodeBase64: string };

const TrainTicketPDF = ({ ticket, qrCodeBase64 }: Props) => (
    <Document>
        <Page size={[595, 650]} style={s.page}>
            <Text style={s.title}>{ticket.title.toUpperCase()}</Text>
            <Text style={{ color: '#6b7280', marginBottom: 8 }}>Train #{ticket.trainId}</Text>

            <View style={s.section}>
                <View style={{ flex: 1 }}>
                    <Text style={s.label}>Journey</Text>
                    <Text style={s.info}>From: {ticket.from.location}</Text>
                    <Text style={[s.info, { marginLeft: 16 }]}>{to12Hour(ticket.from.time)} · {formatDate(ticket.from.date)}</Text>
                    <Text style={[s.info, { marginTop: 6 }]}>To: {ticket.to.location}</Text>
                    <Text style={[s.info, { marginLeft: 16 }]}>{to12Hour(ticket.to.time)} · {formatDate(ticket.to.date)}</Text>

                    <Text style={s.label}>Seats</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
                        {ticket.bookedSeats.map((seat, i) => (
                            <View key={i} style={s.seatBox}><Text>{seat}</Text></View>
                        ))}
                    </View>

                    <Text style={s.label}>Passengers</Text>
                    {ticket.passengers.map((p, i) => (
                        <View key={i} style={s.passenger}>
                            <Text>{p.name} · {p.age} yrs · {p.gender}</Text>
                        </View>
                    ))}

                    <Text style={[s.label, { marginTop: 12 }]}>Amount: ₹{ticket.amount}</Text>
                    <Text style={[s.info, { marginTop: 8, fontSize: 11, color: '#9ca3af' }]}>Booking ID: {ticket.booking_id}</Text>
                </View>

                <Image src={qrCodeBase64} style={{ width: 120, height: 120 }} />
            </View>
        </Page>
    </Document>
);

export default TrainTicketPDF;
