'use client';
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
    title: string;
    children: React.ReactNode;
}

export function SimpleCarousel({ title, children }: Props) {
    const ref = useRef<HTMLDivElement>(null);

    function scroll(dir: "left" | "right") {
        ref.current?.scrollBy({ left: dir === "left" ? -400 : 400, behavior: "smooth" });
    }

    return (
        <section className="my-8 xl:px-44">
            <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-xl font-semibold">{title}</h2>
                <div className="flex gap-2">
                    <button onClick={() => scroll("left")} className="p-1 rounded-full border hover:bg-gray-100 transition" aria-label="Scroll left">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={() => scroll("right")} className="p-1 rounded-full border hover:bg-gray-100 transition" aria-label="Scroll right">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <div ref={ref} className="flex overflow-x-auto gap-4 px-2 pb-2 scrollbar-hide scroll-smooth">
                {children}
            </div>
        </section>
    );
}
