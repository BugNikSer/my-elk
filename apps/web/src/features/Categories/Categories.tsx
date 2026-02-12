import { DataGrid } from '@mui/x-data-grid';
import { useQuery } from "@tanstack/react-query";

import PageHeader from "../../components/PageHeader";
import { expensesTRPC } from "../../utils/trpc";
import { categoriesColumns } from './data';
import { Alert, AlertTitle, IconButton, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { Refresh } from '@mui/icons-material';
import CreateCategory from './CreateCategory';

export default function Categories () {
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 100 });
    const { data, error, isLoading, refetch } = useQuery(expensesTRPC.categories.getMany.queryOptions());

    useEffect(() => console.log(data), [data]);

    if (error) return (
        <Alert
            severity="error"
            sx={{ margin: "auto" }}
            action={
                <IconButton color="inherit" onClick={() => refetch()} size="large">
                    <Refresh />
                </IconButton>
            }
        >
            <AlertTitle>Failed to load categories</AlertTitle>
            {[error.message, error.data?.code].filter(Boolean).join(": ")}
        </Alert>
    )

    return (
        <DataGrid
            columns={categoriesColumns}
            loading={isLoading}
            rows={data || []}
            autoHeight
            paginationMode='server'
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            showToolbar
            slots={{
                toolbar: () => (
                    <PageHeader
                        title="Categories"
                        actions={(
                            <>
                                <TextField label="Filter" size="small" />
                                <CreateCategory />
                            </>
                        )}
                    />
                ),
            }}
            sx={{
                borderRadius: 0,
            }}
        />
    )
}