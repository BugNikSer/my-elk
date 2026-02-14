import { type GridColDef } from '@mui/x-data-grid';
import type { Category } from '@my-elk/expenses-service';

export const categoriesColumns: GridColDef<Category>[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name' },
];
