export interface CursorPaginationParams {
    take: number;
    cursor?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    nextCursor: string | null;
}
