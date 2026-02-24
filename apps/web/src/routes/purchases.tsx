import { createFileRoute } from '@tanstack/react-router';
import PurchasesTable from '../features/Purchases';

export const Route = createFileRoute('/purchases')({
  component: PurchasesTable,
});
