import { useCallback } from "react";
import { TextField } from "@mui/material";

import { expensesTRPC, expensesTrpcClient } from "../../utils/trpc";
import { useTableState } from "../../utils/hooks";
import PageHeader from "../../components/PageHeader";
import EntityTable from "../../components/EntityTable";
import TagFormModal from "./TagFormModal";
import TagTableRow from "./TagTableRow";

export default function TagsTable() {
    const {
        page, setPage, pageSize, setPageSize, filter, setFilter,
        entities, total, error, isLoading, refetch,
    } = useTableState({
        queryOptions: expensesTRPC.tags.getMany.queryOptions,
        onUpdateSubscriber: expensesTrpcClient.tags.onUpdate.subscribe,
        onCreateSubscriber: expensesTrpcClient.tags.onCreate.subscribe,
        initialFilter: { query: "" },
    })

    const handleQueryChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setFilter((prev) => ({ ...prev, query: event.target.value }));
    }, []);

    return (
        <>
            <PageHeader
                title="Tags"
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
                columns={["Id", "Name"]}
                EntityRow={TagTableRow}
                FormModal={TagFormModal}
                refetch={refetch}
                {...{ total, entities, error, isLoading, page, pageSize, setPage, setPageSize}}
            />
        </>
    )
};
