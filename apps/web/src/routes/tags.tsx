import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/tags')({
  component: Tags,
});

function Tags() {
  return <span>Tags</span>;
}
