import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/list')({
  component: List,
});

function List() {
  return <span>List</span>;
}
