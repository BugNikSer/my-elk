import { useEffect } from "react";
import {
	Alert,
	CircularProgress,
	IconButton,
	Stack,
	Tab,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
} from "@mui/material";
import { Refresh } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";

import { expensesTRPC, expensesTrpcClient } from "../../utils/trpc";
import { usePagination } from "../../utils/hooks";
import PageHeader from "../../components/PageHeader";
import TablePagination from "../../components/TablePagination";
import CategoryFormModal from "./CategoryFormModal";
import CategoriesTableRow from "./CategoriesRow";

export default function Categories() {
	const { page, pageSize, setPage, setPageSize } = usePagination();
	const { data, error, isLoading, refetch } = useQuery(expensesTRPC.categories.getMany.queryOptions({ pagination: { page, pageSize } }));

	useEffect(() => {
		const onUpdateSubscription = expensesTrpcClient.categories.onUpdate.subscribe(undefined, {
			onData(event) {
				console.log("Received subscription data:", event);
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

	return (
		<>
			<PageHeader
				title="Categories"
				actions={(
					<>
						<TextField label="Filter" size="small" />
					</>
				)}
			/>
			<TableContainer sx={{ borderRadius: 0, flex: 1 }}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>ID</TableCell>
							<TableCell>Name</TableCell>
							<TableCell align="right">
								<CategoryFormModal />
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{
							isLoading ? (
								<CircularProgress />
							) : error ? (
								<TableRow>
									<TableCell colSpan={3} align="center">
										<Alert severity="error" action={
											<IconButton color="inherit" onClick={() => refetch()}>
												<Refresh />
											</IconButton>
										}>
											Failed to load categories: {error.message}
										</Alert>
									</TableCell>
								</TableRow>
							) : (
								data?.data.map((category) => (
									<CategoriesTableRow key={category.id} category={category} />
								))
							)
						}
					</TableBody>
				</Table>
			</TableContainer>
			<TablePagination
				page={page}
				pageSize={pageSize}
				setPage={setPage}
				setPageSize={setPageSize}
				total={data?.total}
			/>
		</>
	)
};
