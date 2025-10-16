import { Convert } from '@/components/Convert/Convert';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/convert')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto my-8 px-4">
      <Convert />
    </div>
  );
}
