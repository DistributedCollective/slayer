import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/convert')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/convert"!</div>;
}
