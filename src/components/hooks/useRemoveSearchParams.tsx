"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function useRemoveSearchParams() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    return (key: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete(key);

        const query = params.toString();
        router.replace(
            query ? `${pathname}?${query}` : pathname,
            { scroll: false }
        );
    };
}
