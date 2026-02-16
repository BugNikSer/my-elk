import { useCallback } from "react";
import { TextField } from "@mui/material";

import { expensesTRPC, expensesTrpcClient } from "../../utils/trpc";
import { useTableState } from "../../utils/hooks";
import PageHeader from "../../components/PageHeader";
import EntityTable from "../../components/EntityTable";
import CategoryFormModal from "./CategoryFormModal";
import CategoryTableRow from "./CategoryTableRow";

export default function CategoriesTable() {
	const {
        page, setPage, pageSize, setPageSize, filter, setFilter,
        entities, total, error, isLoading, refetch,
    } = useTableState({
		queryOptions: expensesTRPC.categories.getMany.queryOptions,
		onUpdateSubscriber: expensesTrpcClient.categories.onUpdate.subscribe,
		onCreateSubscriber: expensesTrpcClient.categories.onCreate.subscribe,
		initialFilter: { query: "" },
	})

	const handleQueryChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setFilter((prev) => ({ ...prev, query: event.target.value }));
	}, []);

	return (
		<>
			<PageHeader
				title="Categories"
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
				EntityRow={CategoryTableRow}
				FormModal={CategoryFormModal}
				refetch={refetch}
				{...{ total, entities, error, isLoading, page, pageSize, setPage, setPageSize}}
			/>
		</>
	)
};
