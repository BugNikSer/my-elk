import { useCallback, useEffect, useState } from "react";
import { TextField } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import type { Category } from "@my-elk/expenses-service";

import { expensesTRPC, expensesTrpcClient, queryClient } from "../../utils/trpc";
import { usePagination } from "../../utils/hooks";
import PageHeader from "../../components/PageHeader";
import EntityTable from "../../components/EntityTable";
import CategoryFormModal from "./CategoryFormModal";
import CategoriesTableRow from "./CategoriesRow";

export default function Categories() {
	const [filter, setFilter] = useState({
		query: "",
	});
	const { page, pageSize, setPage, setPageSize } = usePagination();
	// TODO: replace by useTableState
	const fn = expensesTRPC.categories.getMany.queryOptions;
	const { data, error, isLoading, refetch } = useQuery(fn({ pagination: { page, pageSize }, filter }));

	const [entities, setEntities] = useState<Category[] | null>(null);
	const [total, setTotal] = useState<number | null>(null);

	useEffect(() => {
		if (data) {
			setEntities(data.data);
			setTotal(data.total);
		}
		if (error) {
			setEntities(null);
			setTotal(null);
		}
	}, [data, error]);

	useEffect(() => {
		const onUpdateSubscription = expensesTrpcClient.categories.onUpdate.subscribe(undefined, {
			onData({ data }) {
				setEntities((prev) => prev?.map((c) => c.id === data.id ? data : c) || null);
			},
			onError(err) {
				console.error('Subscription error:', err);
			},
		});
		return () => {
			onUpdateSubscription.unsubscribe();
		};
	}, []);

	useEffect(() => {
		const onCreateSubscription = expensesTrpcClient.categories.onCreate.subscribe(undefined, {
			onData(event) {
				console.log("Received subscription data:", event);
			},
			onError(err) {
				console.error('Subscription error:', err);
			},
		});
		return () => {
			onCreateSubscription.unsubscribe();
		};
	}, []);

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
				columns={["id", "name"]}
				EntityRow={CategoriesTableRow}
				FormModal={CategoryFormModal}
				refetch={refetch}
				{...{ total, entities, error, isLoading, page, pageSize, setPage, setPageSize}}
			/>
		</>
	)
};
