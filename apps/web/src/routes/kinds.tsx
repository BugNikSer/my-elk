import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/kinds')({
  component: Kinds,
});

function Kinds() {
  return <span>Kinds</span>;
}
