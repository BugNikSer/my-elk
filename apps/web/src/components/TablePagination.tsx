import { MenuItem, Pagination, Select, Stack, Typography } from "@mui/material";
import type { UsePaginationState } from "../utils/hooks";
import { useMemo } from "react";

export default function TablePagination({
    page,
    pageSize,
    setPage,
    setPageSize,
    total,
}: UsePaginationState & {  total: number | null }) {
    const count = useMemo(() => {
        if (total === null) return 0;
        return Math.ceil(total / pageSize);
    }, [total, pageSize]);

    return (
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 1 }}>
            <Typography>Total: {total === null ? "Unknown" : total}</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
                <Typography>Rows per page:</Typography>
                <Select
                    size="small"
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                >
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
                </Select>
                
                <Pagination count={count} page={page} onChange={(_, page) => setPage(page)} />
             </Stack>
         </Stack>
    );
}