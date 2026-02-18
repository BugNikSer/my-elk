import { Stack, TableCell, TableRow } from "@mui/material";
import type { Kind } from "@my-elk/expenses-service";
import KindFormModal from "./KindFormModal";

export default function KindsTableRow({
    entity,
}: {
    entity: Kind;
}) {
    return (
        <TableRow key={entity.id} sx={{ height: "fit-content" }}>
            <TableCell>{entity.id}</TableCell>
            <TableCell>{entity.name}</TableCell>
            <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <KindFormModal entity={entity} />
                </Stack>
             </TableCell>
         </TableRow>
    );
};
