import { useCallback } from "react";
import { TextField } from "@mui/material";

import { expensesTRPC, expensesTrpcClient } from "../../utils/trpc";
import { useTableState } from "../../utils/hooks";
import PageHeader from "../../components/PageHeader";
import EntityTable from "../../components/EntityTable";
import ProductsTableRow from "./ProductTableRow";
import ProductFormModal from "./ProductFormModal";

export default function ProductsTable() {
    const {
        page, setPage, pageSize, setPageSize, filter, setFilter,
        entities, total, error, isLoading, refetch,
    } = useTableState({
        queryOptions: expensesTRPC.products.getMany.queryOptions,
        onUpdateSubscriber: expensesTrpcClient.products.onUpdate.subscribe,
        onCreateSubscriber: expensesTrpcClient.products.onCreate.subscribe,
        initialFilter: { query: "" },
    });

    const handleQueryChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setFilter((prev) => ({ ...prev, query: event.target.value }));
    }, []);

    return (
        <>
            <PageHeader
                title="Products"
                actions={(
                    <>
                        <TextField
                            label="Filter"
                            size="small"
                            value={filter.query}
                            onChange={handleQueryChange}
                        />
                    </>
                )}
            />
            <EntityTable
                columns={["Id", "Name", "Default Category", "Default Kind"]}
                EntityRow={ProductsTableRow}
                FormModal={ProductFormModal}
                refetch={refetch}
                {...{ total, entities, error, isLoading, page, pageSize, setPage, setPageSize}}
            />
        </>
    )
};
