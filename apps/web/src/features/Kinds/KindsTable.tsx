import { useCallback } from "react";
import { TextField } from "@mui/material";

import { expensesTRPC, expensesTrpcClient } from "../../utils/trpc";
import { useTableState } from "../../utils/hooks";
import PageHeader from "../../components/PageHeader";
import EntityTable from "../../components/EntityTable";
import KindsTableRow from "./KindsTableRow";
import KindFormModal from "./KindFormModal";

export default function KindsTable() {
    const {
        page, setPage, pageSize, setPageSize, filter, setFilter,
        entities, total, error, isLoading, refetch,
    } = useTableState({
        queryOptions: expensesTRPC.kinds.getMany.queryOptions,
        onUpdateSubscriber: expensesTrpcClient.kinds.onUpdate.subscribe,
        onCreateSubscriber: expensesTrpcClient.kinds.onCreate.subscribe,
        initialFilter: { query: "" },
    })

    const handleQueryChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setFilter((prev) => ({ ...prev, query: event.target.value }));
    }, []);

    return (
        <>
            <PageHeader
                title="Kinds"
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
                EntityRow={KindsTableRow}
                FormModal={KindFormModal}
                refetch={refetch}
                {...{ total, entities, error, isLoading, page, pageSize, setPage, setPageSize}}
            />
        </>
    )
};
