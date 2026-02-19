"use client";

import Link from "next/link";
import { Hash } from "lucide-react";
import { TrainCardDTO } from "@/lib/types/main";

export function TrainCard({ id, title, trainId, stations }: TrainCardDTO) {
    const from = stations[0];
    const to = stations[stations.length - 1];

    return (
        <Link
            href={`/train-booking?q=train&id=${id}`}
            className="border rounded-2xl w-[320px] p-4 hover:shadow-md transition"
        >
            <div className="text-lg font-medium mb-1">{title}</div>

            <div className="flex items-center text-sm text-gray-600 mb-3">
                <Hash className="w-4 h-4 mr-1" />
                {trainId}
            </div>

            <div className="flex justify-between items-center">
                <span className="font-medium">{from.name}</span>
                <span className="text-xs text-gray-400">→</span>
                <span className="font-medium">{to.name}</span>
            </div>
        </Link>
    );
}
