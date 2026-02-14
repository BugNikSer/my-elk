import { Stack, TableCell, TableRow } from "@mui/material";
import type { Category } from "@my-elk/expenses-service";
import CategoryFormModal from "./CategoryFormModal";

export default function CategoriesTableRow({
    category,
}: {
    category: Category;
}) {
    return (
        <TableRow key={category.id} sx={{ height: "fit-content" }}>
            <TableCell>{category.id}</TableCell>
            <TableCell>{category.name}</TableCell>
            <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <CategoryFormModal category={category} />
                </Stack>
             </TableCell>
         </TableRow>
    );
}