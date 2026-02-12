import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/products')({
  component: Products,
});

function Products() {
  return <span>Products</span>;
}
