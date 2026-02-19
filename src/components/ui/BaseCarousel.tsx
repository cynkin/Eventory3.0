"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
    Carousel,
    CarouselContent,
    type CarouselApi,
} from "@/components/ui/carousel";

interface BaseCarouselProps {
    title: string;
    children: React.ReactNode;
    onApiReady?: (api: CarouselApi) => void;
}

export function BaseCarousel({
                                 title,
                                 children,
                                 onApiReady,
                             }: BaseCarouselProps) {
    const [api, setApi] = React.useState<CarouselApi | null>(null);
    const [canPrev, setCanPrev] = React.useState(false);
    const [canNext, setCanNext] = React.useState(false);

    React.useEffect(() => {
        if (!api) return;

        onApiReady?.(api);

        const update = () => {
            setCanPrev(api.canScrollPrev());
            setCanNext(api.canScrollNext());
        };

        update();
        api.on("select", update);
        api.on("reInit", update);

        return () => {
            api.off("select", update);
            api.off("reInit", update);
        };
    }, [api, onApiReady]);

    return (
        <section className="mx-8 xl:px-44 my-10 relative">
            <h2 className="text-2xl font-semibold mb-4">{title}</h2>

            <div className="relative">
                <Carousel
                    setApi={setApi}
                    opts={{ align: "start", dragFree: true }}
                >
                    <CarouselContent className="-ml-6">
                        {children}
                    </CarouselContent>
                </Carousel>

                {canPrev && (
                    <button
                        onClick={() => api?.scrollPrev()}
                        className="absolute -left-5 top-1/2 -translate-y-1/2 z-5
                       bg-white/90 shadow-lg rounded-full p-2 hover:scale-110"
                    >
                        <ChevronLeft className="w-6 h-6 text-blue-700" />
                    </button>
                )}

                {canNext && (
                    <button
                        onClick={() => api?.scrollNext()}
                        className="absolute -right-5 top-1/2 -translate-y-1/2 z-5
                       bg-white/90 shadow-lg rounded-full p-2 hover:scale-110"
                    >
                        <ChevronRight className="w-6 h-6 text-blue-700" />
                    </button>
                )}
            </div>
        </section>
    );
}
