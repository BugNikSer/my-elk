import { useCallback } from "react";
import { TextField } from "@mui/material";

import { expensesTRPC, expensesTrpcClient } from "../../utils/trpc";
import { useTableState } from "../../utils/hooks";
import PageHeader from "../../components/PageHeader";
import EntityTable from "../../components/EntityTable";
import PurchaseTableRow from "./PurchaseTableRow";
import PurchaseFormModal from "./PurchaseFormModal";
import type { Purchase } from "@my-elk/expenses-service";

export default function PurchasesTable() {
	const {
		page, setPage, pageSize, setPageSize, filter, setFilter,
		entities, total, error, isLoading, refetch,
	} = useTableState({
		queryOptions: expensesTRPC.purchases.getMany.queryOptions,
		onUpdateSubscriber: expensesTrpcClient.purchases.onUpdate.subscribe,
		onCreateSubscriber: expensesTrpcClient.purchases.onCreate.subscribe,
		initialFilter: { query: "" },
	});

	const handleQueryChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setFilter((prev) => ({ ...prev, query: event.target.value }));
	}, []);

	return (
		<>
			<PageHeader
				title="Purchases"
				actions={(
					<>
						<TextField
							label="Filter by product"
							size="small"
							value={filter.query}
							onChange={handleQueryChange}
						/>
					</>
				)}
			/>
			<EntityTable
				columns={["Id", "Product", "Category", "Kind", "Tags", "Price", "Date"]}
				EntityRow={PurchaseTableRow}
				FormModal={PurchaseFormModal}
				refetch={refetch}
				entities={entities as unknown as Purchase[]}
				{...{ total, /* entities, */ error, isLoading, page, pageSize, setPage, setPageSize }}
			/>
		</>
	);
}

