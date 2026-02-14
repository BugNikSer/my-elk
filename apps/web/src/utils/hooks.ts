import { useEffect, useState } from "react";

export function usePagination() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(100);

    useEffect(() => setPage(1), [pageSize]);
    
    return {
        page,
        pageSize,
        setPage,
        setPageSize,
    }
};

export type UsePaginationState = ReturnType<typeof usePagination>;
