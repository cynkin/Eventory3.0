import { Suspense } from "react";

interface CarouselSuspenseProps {
    fallback: React.ReactNode;
    children: React.ReactNode;
}

/**
 * A Suspense wrapper for carousels that enables server-side data fetching
 * with loading states.
 * 
 * Usage:
 * ```tsx
 * <CarouselSuspense fallback={<CarouselSkeletonFallback />}>
 *   <MovieCarouselWithData />
 * </CarouselSuspense>
 * ```
 */
export function CarouselSuspense({ fallback, children }: CarouselSuspenseProps) {
    return <Suspense fallback={fallback}>{children}</Suspense>;
}
