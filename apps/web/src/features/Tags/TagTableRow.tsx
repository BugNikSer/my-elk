import { Stack, TableCell, TableRow } from "@mui/material";
import type { TagDTO } from "@my-elk/expenses-service";
import TagFormModal from "./TagFormModal";

export default function TagTableRow({
    entity,
}: {
    entity: TagDTO;
}) {
    return (
        <TableRow key={entity.id} sx={{ height: "fit-content" }}>
            <TableCell>{entity.id}</TableCell>
            <TableCell>{entity.name}</TableCell>
            <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <TagFormModal entity={entity} />
                </Stack>
             </TableCell>
         </TableRow>
    );
};
