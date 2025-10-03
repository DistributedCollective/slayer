import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/lend')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/lend"!</div>;
}
