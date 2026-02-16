import { createFileRoute } from '@tanstack/react-router';
import TagsTable from '../features/Tags';

export const Route = createFileRoute('/tags')({
  component: TagsTable,
});
