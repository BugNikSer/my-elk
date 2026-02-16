import { createFileRoute } from '@tanstack/react-router';
import CategoriesTable from '../features/Categories';

export const Route = createFileRoute('/categories')({
  component: CategoriesTable,
});
