"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function RemoveSearchParam(key: string) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);

    const query = params.toString();
    router.replace(query ? `?${query}` : "", { scroll: false });
}
