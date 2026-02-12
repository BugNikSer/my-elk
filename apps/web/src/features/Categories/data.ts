import { type GridColDef } from '@mui/x-data-grid';

export const categoriesColumns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', width: 150, editable: true },
];
