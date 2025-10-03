import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/stake')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/stake"!</div>;
}
