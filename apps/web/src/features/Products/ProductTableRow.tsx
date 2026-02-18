import { Stack, TableCell, TableRow } from "@mui/material";
import type { Product } from "@my-elk/expenses-service";
import ProductFormModal from "./ProductFormModal";

export default function CategoriesTableRow({
    entity,
}: {
    entity: Product;
}) {
    return (
        <TableRow key={entity.id} sx={{ height: "fit-content" }}>
            <TableCell>{entity.id}</TableCell>
            <TableCell>{entity.name}</TableCell>
            <TableCell>{entity.defaultCategory?.name || "-"}</TableCell>
            <TableCell>{entity.defaultKind?.name || "-"}</TableCell>
            <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <ProductFormModal entity={entity} />
                </Stack>
             </TableCell>
         </TableRow>
    );
};
