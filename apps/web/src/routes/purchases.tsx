import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/purchases')({
  component: Purchases,
});

function Purchases() {
  return <span>Purchases</span>;
}
