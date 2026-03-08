import { createFileRoute } from '@tanstack/react-router';
import Charts from '../features/Charts';

export const Route = createFileRoute('/')({
  component: Charts,
});
