import { createFileRoute } from '@tanstack/react-router';
import ProductsTable from '../features/Products';

export const Route = createFileRoute('/products')({
  component: ProductsTable,
});
