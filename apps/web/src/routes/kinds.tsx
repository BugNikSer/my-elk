import { createFileRoute } from '@tanstack/react-router';
import KindsTable from '../features/Kinds';

export const Route = createFileRoute('/kinds')({
  component: KindsTable,
});
