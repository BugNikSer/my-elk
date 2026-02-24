import { Stack, TableCell, TableRow } from "@mui/material";
import type { Purchase } from "@my-elk/expenses-service";

import PurchaseFormModal from "./PurchaseFormModal";

export default function PurchaseTableRow({
	entity,
}: {
	entity: Purchase;
}) {
	const tags = entity.tags?.map((tag) => tag.name).join(", ") || "-";

	const date = entity.date
		? (typeof entity.date === "string"
			? new Date(entity.date)
			: entity.date
		).toLocaleDateString()
		: "-";

	return (
		<TableRow key={entity.id} sx={{ height: "fit-content" }}>
			<TableCell>{entity.id}</TableCell>
			<TableCell>{entity.product?.name}</TableCell>
			<TableCell>{entity.category?.name}</TableCell>
			<TableCell>{entity.kind?.name}</TableCell>
			<TableCell>{tags}</TableCell>
			<TableCell>{entity.price}</TableCell>
			<TableCell>{date}</TableCell>
			<TableCell align="right">
				<Stack direction="row" spacing={1} justifyContent="flex-end">
					<PurchaseFormModal entity={entity} />
				</Stack>
			</TableCell>
		</TableRow>
	);
}

