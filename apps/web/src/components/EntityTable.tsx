import type { JSX } from "react/jsx-runtime";
import {
	Alert,
	CircularProgress,
	IconButton,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
	TableHead,
	Stack,
} from "@mui/material";
import { Refresh, InboxOutlined } from "@mui/icons-material";


import TablePagination from "./TablePagination";
import type { UsePaginationState } from "../utils/hooks";
import type { DefaultTRPCClientError } from "../types";

export default function EntityTable<EntityType extends { id: number }>({
	columns,
	EntityRow,
	FormModal,
	isLoading,
	error,
	entities,
	total,
	refetch,
	page,
	pageSize,
	setPage,
	setPageSize,
}: {
	columns: string[];
	EntityRow: (props: { entity: EntityType }) => JSX.Element;
	FormModal: (props: { entity?: EntityType }) => JSX.Element;
	entities: EntityType[] | null;
	total: number | null;
	error: DefaultTRPCClientError | null;
	isLoading: boolean;
	refetch: () => void;
} & UsePaginationState
) {
	return (
		<>
			<TableContainer sx={{ borderRadius: 0, flex: 1 }}>
				<Table>
					<TableHead>
						<TableRow
							sx={(theme) => ({
								fontWeight: "bold",
								backgroundColor: theme.palette.background.paper,
								['& th']: { fontWeight: "bold" },
							})}
						>
							{columns.map((column) => (
								<TableCell key={column}>
									{column}
								</TableCell>
							))}
							<TableCell align="right">
								<FormModal />
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{
							isLoading ? (
								<TableRow>
									<TableCell colSpan={columns.length + 1} align="center">
										<CircularProgress />
									</TableCell>
								</TableRow>
							) : error ? (
								<TableRow>
									<TableCell colSpan={columns.length + 1} align="center">
										<Alert severity="error" action={
											<IconButton color="inherit" onClick={() => refetch()}>
												<Refresh />
											</IconButton>
										}>
											Failed to load categories: {error.message}
										</Alert>
									</TableCell>
								</TableRow>
							) : entities?.length === 0 ? (
								<TableRow>
									<TableCell colSpan={columns.length + 1} align="center">
										<Stack direction="column" alignItems="center" gap={1}>
											<InboxOutlined color="primary" style={{ fontSize: "80px" }} />
											No data
										</Stack>
									</TableCell>
								</TableRow>
							) : (
								entities?.map((entity) => (
									<EntityRow key={entity.id} entity={entity} />
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
				total={total}
			/>
		</>
	);
}